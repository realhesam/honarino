package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"

	dbsqlc "backend/db/sqlc"
	"backend/internal/cache"
	"backend/internal/model"
)

var (
	ErrEmailTaken    = errors.New("email already registered")
	ErrUsernameTaken = errors.New("username already registered")
	ErrInvalidCreds  = errors.New("invalid credentials")
	ErrUserNotFound  = errors.New("user not found")
	ErrTokenRevoked  = errors.New("token has been revoked")
)

type AuthService struct {
	queries   *dbsqlc.Queries
	rdb       *cache.Redis
	jwtSecret string
	jwtExpire int
}

func NewAuthService(queries *dbsqlc.Queries, rdb *cache.Redis, secret string, expireH int) *AuthService {
	return &AuthService{
		queries:   queries,
		rdb:       rdb,
		jwtSecret: secret,
		jwtExpire: expireH,
	}
}

func (s *AuthService) Register(ctx context.Context, req *model.RegisterRequest) (*model.AuthResponse, error) {
	_, err := s.queries.GetUserByEmail(ctx, req.Email)
	if err == nil {
		return nil, ErrEmailTaken
	} else if !errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("check email: %w", err)
	}

	_, err = s.queries.GetUserByUsername(ctx, req.Username)
	if err == nil {
		return nil, ErrUsernameTaken
	} else if !errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("check username: %w", err)
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	row, err := s.queries.CreateUser(ctx, dbsqlc.CreateUserParams{
		Name:     req.Name,
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashed),
	})
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	user := toModel(row)

	token, _, err := s.generateToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("generate token: %w", err)
	}

	CacheUser(ctx, s.rdb, user)

	return &model.AuthResponse{Token: token, User: *user}, nil
}

func (s *AuthService) Login(ctx context.Context, req *model.LoginRequest) (*model.AuthResponse, error) {
	row, err := s.queries.GetUserByUsername(ctx, req.Username)
	if err != nil {
		return nil, ErrInvalidCreds
	}

	if err := bcrypt.CompareHashAndPassword([]byte(row.Password), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCreds
	}

	user := toModel(row)

	token, _, err := s.generateToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("generate token: %w", err)
	}

	CacheUser(ctx, s.rdb, user)

	return &model.AuthResponse{Token: token, User: *user}, nil
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

	return s.rdb.Set(ctx, cache.KeyTokenBlacklist(tokenID), "1", ttl)
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
