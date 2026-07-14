package handler

import (
	"fmt"
	"strings"

	"backend/internal/model"
	"backend/internal/service"
	"backend/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ProductHandler struct {
	svc     *service.ProductService
	storage *storage.MinioClient
}

func NewProductHandler(svc *service.ProductService, storageClient *storage.MinioClient) *ProductHandler {
	return &ProductHandler{svc: svc, storage: storageClient}
}

func (h *ProductHandler) userID(c *fiber.Ctx) string {
	userID, _ := c.Locals("userID").(string)
	return userID
}

func (h *ProductHandler) isGlobalAdmin(c *fiber.Ctx) bool {
	role, _ := c.Locals("role").(string)
	return role == "admin"
}

func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	var req model.CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	req.Title = strings.TrimSpace(req.Title)
	req.Slug = strings.TrimSpace(strings.ToLower(req.Slug))
	req.Description = strings.TrimSpace(req.Description)
	req.Material = strings.TrimSpace(req.Material)
	req.Style = strings.TrimSpace(req.Style)
	req.Dimensions = strings.TrimSpace(req.Dimensions)

	if req.Title == "" || len(req.Title) < 2 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "title must be at least 2 characters"})
	}
	if req.Slug == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "slug is required"})
	}
	if !isValidSlug(req.Slug) {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "slug format is invalid (use lowercase letters, numbers and hyphens)"})
	}
	if req.Description == "" || len(req.Description) < 10 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "description must be at least 10 characters"})
	}
	if len(req.CategoryIDs) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "at least one category must be selected"})
	}
	if !req.IsPriceHidden {
		if req.FromPrice == nil || req.ToPrice == nil {
			return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "from_price and to_price are required unless price is hidden"})
		}
		if *req.FromPrice < 0 || *req.ToPrice < 0 {
			return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "prices must not be negative"})
		}
		if *req.FromPrice > *req.ToPrice {
			return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "from_price must not be greater than to_price"})
		}
	}

	product, err := h.svc.CreateProduct(c.Context(), h.userID(c), c.Params("id"), h.isGlobalAdmin(c), &req)
	if err != nil {
		println(err.Error())
		return handleError(c, err, "internal server error")
	}

	return c.Status(fiber.StatusCreated).JSON(product)
}

func (h *ProductHandler) ListShopProducts(c *fiber.Ctx) error {
	var params model.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid query params"})
	}

	if params.Limit <= 0 {
		params.Limit = 20
	}
	if params.Limit > 100 {
		params.Limit = 100
	}

	rows, total, err := h.svc.ListShopProducts(c.Context(), h.userID(c), c.Params("id"), h.isGlobalAdmin(c), params)
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{
		"data":   rows,
		"total":  total,
		"limit":  params.Limit,
		"offset": params.Offset,
	})
}

func (h *ProductHandler) UpdateProduct(c *fiber.Ctx) error {
	var req model.UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	if req.Title != nil {
		trimmed := strings.TrimSpace(*req.Title)
		if len(trimmed) < 2 {
			return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "title must be at least 2 characters"})
		}
		req.Title = &trimmed
	}

	if req.Slug != nil {
		trimmed := strings.TrimSpace(strings.ToLower(*req.Slug))
		if !isValidSlug(trimmed) {
			return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "slug format is invalid (use lowercase letters, numbers and hyphens)"})
		}
		req.Slug = &trimmed
	}

	if req.Description != nil {
		trimmed := strings.TrimSpace(*req.Description)
		if len(trimmed) < 10 {
			return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "description must be at least 10 characters"})
		}
		req.Description = &trimmed
	}

	if req.CategoryIDs != nil && len(req.CategoryIDs) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "at least one category must be selected"})
	}

	if req.FromPrice != nil && *req.FromPrice < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "from_price must not be negative"})
	}
	if req.ToPrice != nil && *req.ToPrice < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "to_price must not be negative"})
	}
	if req.FromPrice != nil && req.ToPrice != nil && *req.FromPrice > *req.ToPrice {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "from_price must not be greater than to_price"})
	}

	product, err := h.svc.UpdateProduct(c.Context(), h.userID(c), c.Params("id"), c.Params("productID"), h.isGlobalAdmin(c), &req)
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(product)
}

func (h *ProductHandler) DeleteProduct(c *fiber.Ctx) error {
	if err := h.svc.DeleteProduct(c.Context(), h.userID(c), c.Params("id"), c.Params("productID"), h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductHandler) ActivateProduct(c *fiber.Ctx) error {
	if err := h.svc.ActivateProduct(c.Context(), h.userID(c), c.Params("id"), c.Params("productID"), h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductHandler) DeactivateProduct(c *fiber.Ctx) error {
	if err := h.svc.DeactivateProduct(c.Context(), h.userID(c), c.Params("id"), c.Params("productID"), h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductHandler) AddProductMedia(c *fiber.Ctx) error {
	var req model.AddProductMediaRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	req.Type = strings.TrimSpace(req.Type)
	req.URL = strings.TrimSpace(req.URL)
	req.AltText = strings.TrimSpace(req.AltText)

	if req.Type != "image" && req.Type != "video" && req.Type != "360" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "type must be image, video or 360"})
	}
	if req.URL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "url is required"})
	}
	if req.SortOrder < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "sort_order must not be negative"})
	}

	media, err := h.svc.AddProductMedia(c.Context(), h.userID(c), c.Params("id"), c.Params("productID"), h.isGlobalAdmin(c), &req)
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.Status(fiber.StatusCreated).JSON(media)
}

func (h *ProductHandler) DeleteProductMedia(c *fiber.Ctx) error {
	if err := h.svc.DeleteProductMedia(c.Context(), h.userID(c), c.Params("id"), c.Params("productID"), c.Params("mediaID"), h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
	product, err := h.svc.GetProduct(c.Context(), c.Params("id"))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(product)
}

func (h *ProductHandler) GetProductBySlug(c *fiber.Ctx) error {
	product, err := h.svc.GetProductBySlug(c.Context(), c.Params("shopID"), c.Params("slug"))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(product)
}

func (h *ProductHandler) ListActiveProducts(c *fiber.Ctx) error {
	var params model.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid query params"})
	}

	if params.Limit <= 0 {
		params.Limit = 20
	}
	if params.Limit > 100 {
		params.Limit = 100
	}

	categoryID := strings.TrimSpace(c.Query("category_id"))
	search := strings.TrimSpace(c.Query("q"))

	if categoryID != "" {
		rows, total, err := h.svc.ListActiveProductsByCategory(c.Context(), categoryID, params)
		if err != nil {
			return handleError(c, err, "internal server error")
		}

		return c.JSON(fiber.Map{
			"data":   rows,
			"total":  total,
			"limit":  params.Limit,
			"offset": params.Offset,
		})
	}

	rows, total, err := h.svc.ListActiveProductsPublic(c.Context(), params, search)
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{
		"data":   rows,
		"total":  total,
		"limit":  params.Limit,
		"offset": params.Offset,
	})
}

func (h *ProductHandler) ListAllProductsAdmin(c *fiber.Ctx) error {
	var params model.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid query params"})
	}

	if params.Limit <= 0 {
		params.Limit = 20
	}
	if params.Limit > 100 {
		params.Limit = 100
	}

	search := c.Query("q")
	status := c.Query("status", "all")

	rows, total, err := h.svc.ListAllProductsAdmin(c.Context(), h.isGlobalAdmin(c), params, search, status)
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{
		"data":   rows,
		"total":  total,
		"limit":  params.Limit,
		"offset": params.Offset,
	})
}

func (h *ProductHandler) ListActiveProductsByShop(c *fiber.Ctx) error {
	var params model.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid query params"})
	}

	if params.Limit <= 0 {
		params.Limit = 20
	}
	if params.Limit > 100 {
		params.Limit = 100
	}

	rows, total, err := h.svc.ListActiveProductsByShop(c.Context(), c.Params("shopID"), params)
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{
		"data":   rows,
		"total":  total,
		"limit":  params.Limit,
		"offset": params.Offset,
	})
}

func isAllowedProductMediaContentType(contentType string) bool {
	switch contentType {
	case "image/jpeg", "image/png", "image/webp",
		"video/mp4", "video/webm":
		return true
	default:
		return false
	}
}

func (h *ProductHandler) GetProductMediaUploadURL(c *fiber.Ctx) error {
	var req struct {
		FileName    string `json:"fileName"`
		ContentType string `json:"contentType"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	req.ContentType = strings.TrimSpace(req.ContentType)
	if req.ContentType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "contentType is required"})
	}
	if !isAllowedProductMediaContentType(req.ContentType) {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "unsupported content type"})
	}
	if h.storage == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(model.ErrorResponse{Error: "storage not configured"})
	}

	if err := h.svc.CheckProductMediaAccess(c.Context(), h.userID(c), c.Params("id"), c.Params("productID"), h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	objectName := productMediaObjectName(c.Params("productID"), req.ContentType)

	uploadURL, publicURL, err := h.storage.GetPresignedUploadURL(c.Context(), objectName, req.ContentType)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Error: "internal server error"})
	}

	return c.JSON(fiber.Map{"uploadUrl": uploadURL, "publicUrl": publicURL})
}

func productMediaObjectName(productID, contentType string) string {
	ext := contentTypeToExtension(contentType)
	return fmt.Sprintf("products/%s/media/%s%s", productID, uuid.NewString(), ext)
}
