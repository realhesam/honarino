package service

import (
	"backend/internal/cache"
	"backend/internal/model"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
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

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func slugifyName(name string) string {
	var b strings.Builder
	lastHyphen := true

	for _, r := range strings.ToLower(strings.TrimSpace(name)) {
		switch {
		case (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9'):
			b.WriteRune(r)
			lastHyphen = false
		case r == ' ' || r == '-' || r == '_':
			if !lastHyphen {
				b.WriteRune('-')
				lastHyphen = true
			}
		}
	}

	slug := strings.Trim(b.String(), "-")
	if slug == "" {
		slug = "cat-" + randomHex(6)
	}
	return slug
}

func randomHex(n int) string {
	buf := make([]byte, n)
	_, _ = rand.Read(buf)
	return hex.EncodeToString(buf)
}
