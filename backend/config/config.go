package config

import (
	"os"
	"strconv"
)

type Config struct {
	AppPort    string
	AppEnv     string
	DBUrl      string
	RedisUrl   string
	JWTSecret  string
	JWTExpireH int
	MinioEndpoint      string
	MinioPublicEndpoint string
	MinioAccessKey     string
	MinioSecretKey     string
	MinioBucket        string
	MinioUseSSL        bool
	MinioPresignHours  int
}

func Load() *Config {
	jwtExpire, _ := strconv.Atoi(getEnv("JWT_EXPIRE_HOURS", "72"))
	minioUseSSL := getEnv("MINIO_USE_SSL", "false")
	minioPresignHours, _ := strconv.Atoi(getEnv("MINIO_PRESIGN_HOURS", "24"))

	return &Config{
		AppPort:    getEnv("APP_PORT", "3000"),
		AppEnv:     getEnv("APP_ENV", "development"),
		DBUrl:      getEnv("DATABASE_URL", ""),
		RedisUrl:            getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:           getEnv("JWT_SECRET", "change-me"),
		JWTExpireH:          jwtExpire,
		MinioPublicEndpoint: getEnv("MINIO_PUBLIC_ENDPOINT", "http://localhost:9000"),
		MinioEndpoint:       getEnv("MINIO_ENDPOINT", "minio:9000"),
		MinioAccessKey:      getEnv("MINIO_ACCESS_KEY", "minioadmin"),
		MinioSecretKey:      getEnv("MINIO_SECRET_KEY", "minioadmin"),
		MinioBucket:         getEnv("MINIO_BUCKET", "uploads"),
		MinioUseSSL:         minioUseSSL == "true",
		MinioPresignHours:   minioPresignHours,
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
