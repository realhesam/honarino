package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"backend/internal/cache"
	"backend/internal/model"
)

func JWTProtected(secret string, rdb *cache.Redis) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{
				Error: "missing authorization header",
			})
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{
				Error: "invalid authorization format",
			})
		}

		tokenStr := parts[1]

		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{
				Error: "invalid or expired token",
			})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{
				Error: "invalid token claims",
			})
		}

		if tokenID, ok := claims["jti"].(string); ok && tokenID != "" {
			key := cache.KeyTokenBlacklist(tokenID)
			revoked, err := rdb.Exists(c.Context(), key)
			if err == nil && revoked {
				return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{
					Error: "token has been revoked",
				})
			}
		}

		c.Locals("userID", claims["sub"].(string))
		c.Locals("tokenStr", tokenStr)

		return c.Next()
	}
}
