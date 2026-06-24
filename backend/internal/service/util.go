package service

import (
	"backend/internal/cache"
	"backend/internal/model"
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func parseUUID(id string) (pgtype.UUID, error) {
	var uid pgtype.UUID
	if err := uid.Scan(id); err != nil {
		return pgtype.UUID{}, fmt.Errorf("invalid uuid: %w", err)
	}
	return uid, nil
}

func CacheUser(ctx context.Context, rdb *cache.Redis, user *model.UserResponse) {
	if user == nil {
		return
	}
	if err := rdb.Set(ctx, cache.KeyUserProfile(user.ID), user, cache.TTLUserProfile*time.Second); err != nil {
		slog.Warn("redis set profile error", "err", err, "userID", user.ID)
	}
}

func InvalidateUserCache(ctx context.Context, rdb *cache.Redis, userID string) {
	if err := rdb.Del(ctx, cache.KeyUserProfile(userID)); err != nil {
		slog.Warn("redis del profile error", "err", err, "userID", userID)
	}
}
