package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"backend/config"
	server "backend/internal/app"
	"backend/internal/cache"
	"backend/internal/repository"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	db, err := repository.NewPostgres(cfg.DBUrl)
	if err != nil {
		slog.Error("failed to connect to database", "err", err)
		os.Exit(1)
	}
	defer db.Close()
	slog.Info("database connected")

	rdb, err := cache.NewRedis(cfg.RedisUrl)
	if err != nil {
		slog.Error("failed to connect to redis", "err", err)
		os.Exit(1)
	}
	defer rdb.Close()
	slog.Info("redis connected")

	if err := rdb.FlushAll(context.Background()); err != nil {
		slog.Error("failed to flush redis", "err", err)
	} else {
		slog.Info("redis flushed")
	}

	app := server.NewServer(cfg, db, rdb)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		slog.Info("server starting", "port", cfg.AppPort)
		if err := app.Listen(":" + cfg.AppPort); err != nil {
			slog.Error("server error", "err", err)
		}
	}()

	<-quit
	slog.Info("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := app.ShutdownWithContext(ctx); err != nil {
		slog.Error("shutdown error", "err", err)
	}

	slog.Info("server stopped.")
}
