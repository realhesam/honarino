package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"backend/config"
	dbsqlc "backend/db/sqlc"
	server "backend/internal/app"
	"backend/internal/cache"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	db, err := pgxpool.New(context.Background(), cfg.DBUrl)
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

	queries := dbsqlc.New(db)

	app := server.NewServer(cfg, db, rdb, queries)

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

	slog.Info("server stopped")
}
