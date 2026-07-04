package handler

import (
	"strings"

	"backend/internal/model"
	"backend/internal/service"

	"github.com/gofiber/fiber/v2"
)

type CategoryHandler struct {
	svc *service.CategoryService
}

func NewCategoryHandler(svc *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{svc: svc}
}

func (h *CategoryHandler) isGlobalAdmin(c *fiber.Ctx) bool {
	role, _ := c.Locals("role").(string)
	return role == "admin"
}

func (h *CategoryHandler) ListRootCategories(c *fiber.Ctx) error {
	categories, err := h.svc.ListRootCategories(c.Context())
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"data": categories})
}

func (h *CategoryHandler) ListChildCategories(c *fiber.Ctx) error {
	categories, err := h.svc.ListChildCategories(c.Context(), c.Params("id"))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"data": categories})
}

func (h *CategoryHandler) GetCategory(c *fiber.Ctx) error {
	category, err := h.svc.GetCategoryWithParent(c.Context(), c.Params("id"))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(category)
}

func (h *CategoryHandler) GetCategoryBySlug(c *fiber.Ctx) error {
	category, err := h.svc.GetCategoryBySlug(c.Context(), c.Params("slug"))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(category)
}

func (h *CategoryHandler) GetCategoryAncestors(c *fiber.Ctx) error {
	ancestors, err := h.svc.GetCategoryAncestors(c.Context(), c.Params("id"))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"data": ancestors})
}

func (h *CategoryHandler) GetCategoryDescendants(c *fiber.Ctx) error {
	descendants, err := h.svc.GetCategoryDescendants(c.Context(), c.Params("id"))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"data": descendants})
}

func (h *CategoryHandler) ListAllCategories(c *fiber.Ctx) error {
	categories, err := h.svc.ListAllActiveCategories(c.Context())
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"data": categories})
}

func (h *CategoryHandler) CreateCategory(c *fiber.Ctx) error {
	var req model.CreateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Slug = strings.TrimSpace(strings.ToLower(req.Slug))
	req.Description = strings.TrimSpace(req.Description)

	if req.Name == "" || len(req.Name) < 2 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "name must be at least 2 characters"})
	}
	if req.Slug == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "slug is required"})
	}
	if !isValidSlug(req.Slug) {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "slug format is invalid (use lowercase letters, numbers and hyphens)"})
	}

	category, err := h.svc.CreateCategory(c.Context(), &req)
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.Status(fiber.StatusCreated).JSON(category)
}

func (h *CategoryHandler) ListAllCategoriesAdmin(c *fiber.Ctx) error {
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

	rows, total, err := h.svc.ListAllCategoriesAdmin(c.Context(), params, search, status)
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

func (h *CategoryHandler) UpdateCategory(c *fiber.Ctx) error {
	var req model.UpdateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	if req.Name != nil {
		trimmed := strings.TrimSpace(*req.Name)
		if len(trimmed) < 2 {
			return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "name must be at least 2 characters"})
		}
		req.Name = &trimmed
	}

	if req.Slug != nil {
		trimmed := strings.TrimSpace(strings.ToLower(*req.Slug))
		if !isValidSlug(trimmed) {
			return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "slug format is invalid (use lowercase letters, numbers and hyphens)"})
		}
		req.Slug = &trimmed
	}

	category, err := h.svc.UpdateCategory(c.Context(), c.Params("id"), &req)
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(category)
}

func (h *CategoryHandler) DeleteCategory(c *fiber.Ctx) error {
	if err := h.svc.DeleteCategory(c.Context(), c.Params("id")); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *CategoryHandler) ActivateCategory(c *fiber.Ctx) error {
	if err := h.svc.ActivateCategory(c.Context(), c.Params("id")); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *CategoryHandler) DeactivateCategory(c *fiber.Ctx) error {
	if err := h.svc.DeactivateCategory(c.Context(), c.Params("id")); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func isValidSlug(slug string) bool {
	if slug == "" {
		return false
	}
	for i, r := range slug {
		isLower := r >= 'a' && r <= 'z'
		isDigit := r >= '0' && r <= '9'
		isHyphen := r == '-'
		if !isLower && !isDigit && !isHyphen {
			return false
		}
		if isHyphen && (i == 0 || i == len(slug)-1) {
			return false
		}
	}
	return true
}
