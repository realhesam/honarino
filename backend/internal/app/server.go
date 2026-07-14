package app

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/jackc/pgx/v5/pgxpool"

	"backend/config"
	dbsqlc "backend/db/sqlc"
	"backend/internal/cache"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/service"
	"backend/internal/storage"

	"log/slog"
)

func NewServer(cfg *config.Config, db *pgxpool.Pool, rdb *cache.Redis, queries *dbsqlc.Queries) *fiber.App {
	authSvc := service.NewAuthService(queries, rdb, cfg.JWTSecret, cfg.JWTExpireH)
	profileSvc := service.NewProfileService(queries, rdb)
	vendorSvc := service.NewVendorService(queries)
	productionSvc := service.NewProductionService(queries, db)
	categorySvc := service.NewCategoryService(queries)
	productSvc := service.NewProductService(queries)

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
	vendorHdl := handler.NewVendorHandler(vendorSvc)
	productionHdl := handler.NewProductionHandler(productionSvc, minioClient)
	categoryHdl := handler.NewCategoryHandler(categorySvc)
	productHdl := handler.NewProductHandler(productSvc, minioClient)

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

	registerRoutes(app, cfg, db, rdb, authHdl, profileHdl, vendorHdl, productionHdl, categoryHdl, productHdl)
	return app
}

func registerRoutes(app *fiber.App, cfg *config.Config, db *pgxpool.Pool, rdb *cache.Redis,
	authHdl *handler.AuthHandler,
	profileHdl *handler.ProfileHandler,
	vendorHdl *handler.VendorHandler,
	productionHdl *handler.ProductionHandler,
	categoryHdl *handler.CategoryHandler,
	productHdl *handler.ProductHandler,
) {
	api := app.Group("/api/v1")

	auth := api.Group("/auth")
	auth.Post("/signup", authHdl.Register)
	auth.Post("/signin", middleware.RateLimit(rdb, 10), authHdl.Login)

	protected := middleware.JWTProtected(cfg.JWTSecret, rdb)

	authGroup := api.Group("/auth", protected)
	authGroup.Post("/logout", authHdl.Logout)

	user := api.Group("/user", protected)
	user.Get("/profile", profileHdl.Profile)
	user.Put("/profile", profileHdl.UpdateProfile)
	user.Post("/profile/upload-url", profileHdl.GetUploadURL)
	user.Post("/profile/change-password", profileHdl.ChangePassword)

	vendor := api.Group("/vendor", protected, middleware.RequireRole("user", "admin"))
	vendor.Post("/request", vendorHdl.CreateRequest)
	vendor.Get("/request", vendorHdl.GetMyRequest)
	vendor.Put("/request", vendorHdl.UpdateRequest)

	admin := api.Group("/admin", protected, middleware.RequireRole("admin"))
	admin.Get("/vendor/requests", vendorHdl.ListRequests)
	admin.Delete("/vendor/requests/:id", vendorHdl.DeleteRequest)
	admin.Patch("/vendor/requests/:id/approve", vendorHdl.ApproveRequest)

	publicProductions := api.Group("/productions")
	publicProductions.Get("/:id/get", productionHdl.GetPublicProduction)

	productions := api.Group("/productions", protected, middleware.RequireRole("vendor", "admin"))
	productions.Post("/", productionHdl.CreateProduction)
	productions.Get("/list", productionHdl.ListProductions)
	productions.Get("/list/admin", productionHdl.ListAdminProductions)
	productions.Get("/:id", productionHdl.GetProduction)
	productions.Patch("/:id", productionHdl.UpdateProduction)
	productions.Delete("/:id", productionHdl.DeleteProduction)
	productions.Get("/:id/members/search", productionHdl.SearchUsersForMembership)
	productions.Get("/:id/members", productionHdl.ListMembers)
	productions.Get("/:id/members/count", productionHdl.GetMembersCount)
	productions.Post("/:id/members", productionHdl.AddMember)
	productions.Patch("/:id/members/:userID", productionHdl.UpdateMemberRole)
	productions.Delete("/:id/members/:userID", productionHdl.RemoveMember)
	productions.Post("/:id/upload-url", productionHdl.GetMediaUploadURL)
	productions.Post("/:id/confirm-upload", productionHdl.ConfirmMediaUpload)
	productions.Post("/:id/approve", productionHdl.ActiveProduction)
	productions.Post("/:id/deactive", productionHdl.DeactiveProduction)
	productions.Post("/:id/isactive", productionHdl.IsProductionActive)

	categories := api.Group("/categories")
	categories.Get("/", categoryHdl.ListRootCategories)
	categories.Get("/all", categoryHdl.ListAllCategories)
	categories.Get("/:id", categoryHdl.GetCategory)
	categories.Get("/:id/children", categoryHdl.ListChildCategories)
	categories.Get("/:id/ancestors", categoryHdl.GetCategoryAncestors)
	categories.Get("/:id/descendants", categoryHdl.GetCategoryDescendants)
	categories.Get("/slug/:slug", categoryHdl.GetCategoryBySlug)

	categoriesAdmin := api.Group("/admin/categories", protected, middleware.RequireRole("admin"))
	categoriesAdmin.Post("/", categoryHdl.CreateCategory)
	categoriesAdmin.Get("/", categoryHdl.ListAllCategoriesAdmin)
	categoriesAdmin.Patch("/:id", categoryHdl.UpdateCategory)
	categoriesAdmin.Delete("/:id", categoryHdl.DeleteCategory)
	categoriesAdmin.Post("/:id/activate", categoryHdl.ActivateCategory)
	categoriesAdmin.Post("/:id/deactivate", categoryHdl.DeactivateCategory)

	products := api.Group("/products")
	products.Get("/", productHdl.ListActiveProducts)
	products.Get("/:id", productHdl.GetProduct)
	products.Get("/shop/:shopID/slug/:slug", productHdl.GetProductBySlug)
	products.Get("/shop/:shopID", productHdl.ListActiveProductsByShop)

	shopProducts := api.Group("/productions/:id/products", protected, middleware.RequireRole("vendor", "admin"))
	shopProducts.Post("/", productHdl.CreateProduct)
	shopProducts.Get("/", productHdl.ListShopProducts)
	shopProducts.Patch("/:productID", productHdl.UpdateProduct)
	shopProducts.Delete("/:productID", productHdl.DeleteProduct)
	shopProducts.Post("/:productID/activate", productHdl.ActivateProduct)
	shopProducts.Post("/:productID/deactivate", productHdl.DeactivateProduct)
	shopProducts.Post("/:productID/media", productHdl.AddProductMedia)
	shopProducts.Post("/:productID/media/upload-url", productHdl.GetProductMediaUploadURL)
	shopProducts.Delete("/:productID/media/:mediaID", productHdl.DeleteProductMedia)

	productsAdmin := api.Group("/admin/products", protected, middleware.RequireRole("admin"))
	productsAdmin.Get("/", productHdl.ListAllProductsAdmin)

	app.Get("/health", func(c *fiber.Ctx) error {
		if err := db.Ping(c.Context()); err != nil {
			return c.Status(503).JSON(fiber.Map{"status": "db_down", "error": err.Error()})
		}
		return c.JSON(fiber.Map{"status": "ok"})
	})
}
