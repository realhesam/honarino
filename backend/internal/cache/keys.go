package cache

import "fmt"

// TTL ها
const (
	TTLUserProfile  = 15 * 60
	TTLTokenBlack   = 72 * 3600
	TTLRateLimit    = 60
)

func KeyUserProfile(userID string) string {
	return fmt.Sprintf("user:profile:%s", userID)
}

func KeyTokenBlacklist(tokenID string) string {
	return fmt.Sprintf("token:blacklist:%s", tokenID)
}

func KeyLoginAttempts(ip string) string {
	return fmt.Sprintf("rate:login:%s", ip)
}