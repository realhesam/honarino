package service

import (
	"context"
	"fmt"
	"log/slog"

	"golang.org/x/crypto/bcrypt"

	dbsqlc "backend/db/sqlc"
	"backend/internal/cache"
	"backend/internal/model"

	"github.com/jackc/pgx/v5/pgtype"
)

type ProfileService struct {
	queries *dbsqlc.Queries
	rdb     *cache.Redis
}

func NewProfileService(queries *dbsqlc.Queries, rdb *cache.Redis) *ProfileService {
	return &ProfileService{queries: queries, rdb: rdb}
}

func (s *ProfileService) GetProfile(ctx context.Context, userID string) (*model.UserResponse, error) {
	key := cache.KeyUserProfile(userID)

	var user model.UserResponse
	if err := s.rdb.Get(ctx, key, &user); err == nil {
		return &user, nil
	} else if !cache.IsNil(err) {
		slog.Warn("redis get profile error", "err", err)
	}

	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	row, err := s.queries.GetUserByID(ctx, uid)
	if err != nil {
		return nil, ErrUserNotFound
	}

	u := toModel(row)
	CacheUser(ctx, s.rdb, u)
	return u, nil
}

func (s *ProfileService) UpdateProfile(ctx context.Context, userID string, req *model.UpdateProfileRequest) (*model.UserResponse, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	row, err := s.queries.UpdateUser(ctx, dbsqlc.UpdateUserParams{
		ID:                uid,
		Name:              pgtype.Text{String: req.Name, Valid: req.Name != ""},
		Phone:             pgtype.Text{String: req.Phone, Valid: req.Phone != ""},
		Address:           pgtype.Text{String: req.Address, Valid: req.Address != ""},
		ProfilePictureUrl: pgtype.Text{String: req.ProfilePictureURL, Valid: req.ProfilePictureURL != ""},
	})
	if err != nil {
		return nil, err
	}

	u := toModel(row)
	InvalidateUserCache(ctx, s.rdb, userID)
	return u, nil
}

func (s *ProfileService) ChangePassword(ctx context.Context, userID, currentPassword, newPassword string) error {
	if currentPassword == "" || newPassword == "" {
		return ErrValidationFailed
	}
	if len(newPassword) < 8 {
		return ErrValidationFailed
	}

	if currentPassword == newPassword {
		return ErrSamePassword
	}

	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	storedPassword, err := s.queries.GetPasswordByID(ctx, uid)
	if err != nil {
		return ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(currentPassword)); err != nil {
		return ErrInvalidCreds
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	return s.queries.UpdatePassword(ctx, dbsqlc.UpdatePasswordParams{
		ID:       uid,
		Password: string(hashed),
	})
}
