package app

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/jackc/pgx/v5/pgxpool"

	"backend/config"
	"backend/internal/cache"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/internal/storage"

	"log/slog"
)

func NewServer(cfg *config.Config, db *pgxpool.Pool, rdb *cache.Redis) *fiber.App {
	userRepo := repository.NewUserRepository(db)
	authSvc := service.NewAuthService(userRepo, rdb, cfg.JWTSecret, cfg.JWTExpireH)
	profileSvc := service.NewProfileService(userRepo, rdb)

	var minioClient *storage.MinioClient
	if cfg.MinioEndpoint != "" {
		var err error
		for i := range 5 {
			minioClient, err = storage.NewMinioClient(cfg)
			if err == nil {
				slog.Info("minio connected")
				break
			}
			slog.Warn("minio init failed, retrying...", "attempt", i+1, "err", err)
			time.Sleep(3 * time.Second)
		}
		if minioClient == nil {
			slog.Error("minio init failed after retries", "err", err)
		}
	} else {
		slog.Warn("minio not configured, storage disabled")
	}

	authHdl := handler.NewAuthHandler(authSvc)
	profileHdl := handler.NewProfileHandler(profileSvc, minioClient)

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			var e *fiber.Error
			if errors.As(err, &e) {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Authorization",
	}))

	registerRoutes(app, cfg, db, rdb, authHdl, profileHdl)
	return app
}

func registerRoutes(app *fiber.App, cfg *config.Config, db *pgxpool.Pool, rdb *cache.Redis, authHdl *handler.AuthHandler, profileHdl *handler.ProfileHandler) {
	api := app.Group("/api/v1")

	auth := api.Group("/auth")
	auth.Post("/signup", authHdl.Register)
	auth.Post("/signin", middleware.RateLimit(rdb, 10), authHdl.Login)

	protected := middleware.JWTProtected(cfg.JWTSecret, rdb)
	user := api.Group("/user", protected)
	user.Get("/profile", profileHdl.Profile)
	user.Put("/profile", profileHdl.UpdateProfile)
	user.Post("/profile/upload-url", profileHdl.GetUploadURL)
	user.Post("/profile/change-password", profileHdl.ChangePassword)

	authGroup := api.Group("/auth", protected)
	authGroup.Post("/logout", authHdl.Logout)

	app.Get("/health", func(c *fiber.Ctx) error {
		if err := db.Ping(c.Context()); err != nil {
			return c.Status(503).JSON(fiber.Map{"status": "db_down", "error": err.Error()})
		}
		return c.JSON(fiber.Map{"status": "ok"})
	})
}
