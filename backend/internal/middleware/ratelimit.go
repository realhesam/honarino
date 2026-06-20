package middleware

import (
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v2"
	"backend/internal/cache"
	"backend/internal/model"
)

const maxLoginAttempts = 10

func RateLimit(rdb *cache.Redis, max int) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ip := c.IP()
		key := cache.KeyLoginAttempts(ip)
		ctx := c.Context()

		count, err := rdb.Incr(ctx, key)
		if err != nil {
			slog.Warn("rate limit redis error", "err", err, "ip", ip)
			return c.Next()
		}

		if count == 1 {
			_ = rdb.Expire(ctx, key, cache.TTLRateLimit*time.Second)
		}

		if count > int64(max) {
			ttl, _ := rdb.TTL(ctx, key)
			return c.Status(fiber.StatusTooManyRequests).JSON(model.ErrorResponse{
				Error: "too many attempts, try again in " + ttl.Round(time.Second).String(),
			})
		}

		return c.Next()
	}
}