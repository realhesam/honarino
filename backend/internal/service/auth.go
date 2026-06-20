package service

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"backend/internal/cache"
	"backend/internal/model"
	"backend/internal/repository"
)

var (
	ErrEmailTaken   = errors.New("email already registered")
	ErrUsernameTaken = errors.New("username already registered")
	ErrInvalidCreds = errors.New("invalid credentials")
	ErrUserNotFound = errors.New("user not found")
	ErrTokenRevoked = errors.New("token has been revoked")
)

type AuthService struct {
	userRepo  *repository.UserRepository
	rdb       *cache.Redis
	jwtSecret string
	jwtExpire int
}

func NewAuthService(repo *repository.UserRepository, rdb *cache.Redis, secret string, expireH int) *AuthService {
	return &AuthService{
		userRepo:  repo,
		rdb:       rdb,
		jwtSecret: secret,
		jwtExpire: expireH,
	}
}

func (s *AuthService) Register(ctx context.Context, req *model.RegisterRequest) (*model.AuthResponse, error) {
	existing, _ := s.userRepo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return nil, ErrEmailTaken
	}

	usernameExisting, _ := s.userRepo.GetByUsername(ctx, req.Username)
	if usernameExisting != nil {
		return nil, ErrUsernameTaken
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	user, err := s.userRepo.Create(ctx, req.Name, req.Username, req.Email, string(hashed))
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	token, tokenID, err := s.generateToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("generate token: %w", err)
	}

	s.cacheUser(ctx, user)

	_ = tokenID
	return &model.AuthResponse{Token: token, User: *user}, nil
}

func (s *AuthService) Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error) {
	row, err := s.userRepo.GetByUsername(ctx, req.Username)
	if err != nil {
		return nil, ErrInvalidCreds
	}

	if err := bcrypt.CompareHashAndPassword([]byte(row.Password), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCreds
	}

	token, _, err := s.generateToken(row.ID)
	if err != nil {
		return nil, fmt.Errorf("generate token: %w", err)
	}

	user := model.User{
		ID:        row.ID,
		Name:      row.Name,
		Email:     row.Email,
		Username:  row.Username,
		Phone:     row.Phone,
		Address:   row.Address,
		ProfilePictureURL: row.ProfilePictureURL,
		CreatedAt: row.CreatedAt,
		DeletedAt: row.DeletedAt,
	}

	s.cacheUser(ctx, &user)

	return &model.AuthResponse{Token: token, User: user}, nil
}

func (s *AuthService) GetProfile(ctx context.Context, userID string) (*model.User, error) {
	return nil, fmt.Errorf("use ProfileService.GetProfile")
}

func (s *AuthService) Logout(ctx context.Context, tokenStr string) error {
	claims, err := s.parseToken(tokenStr)
	if err != nil {
		return nil
	}

	tokenID, _ := claims["jti"].(string)
	if tokenID == "" {
		return nil
	}

	exp, _ := claims["exp"].(float64)
	ttl := time.Until(time.Unix(int64(exp), 0))
	if ttl <= 0 {
		return nil
	}

	key := cache.KeyTokenBlacklist(tokenID)
	return s.rdb.Set(ctx, key, "1", ttl)
}

func (s *AuthService) IsTokenRevoked(ctx context.Context, tokenID string) bool {
	key := cache.KeyTokenBlacklist(tokenID)
	exists, err := s.rdb.Exists(ctx, key)
	if err != nil {
		slog.Warn("redis check revoked error", "err", err)
		return false
	}
	return exists
}

func (s *AuthService) InvalidateUserCache(ctx context.Context, userID string) {
	key := cache.KeyUserProfile(userID)
	if err := s.rdb.Del(ctx, key); err != nil {
		slog.Warn("redis del profile error", "err", err, "userID", userID)
	}
}
func (s *AuthService) cacheUser(ctx context.Context, user *model.User) {
	key := cache.KeyUserProfile(user.ID)
	if err := s.rdb.Set(ctx, key, user, cache.TTLUserProfile*time.Second); err != nil {
		slog.Warn("redis set profile error", "err", err)
	}
}

func (s *AuthService) generateToken(userID string) (tokenStr, tokenID string, err error) {
	jti := fmt.Sprintf("%s-%d", userID, time.Now().UnixNano())

	claims := jwt.MapClaims{
		"sub": userID,
		"jti": jti,
		"exp": time.Now().Add(time.Duration(s.jwtExpire) * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(s.jwtSecret))
	return signed, jti, err
}

func (s *AuthService) parseToken(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}
	return claims, nil
}
