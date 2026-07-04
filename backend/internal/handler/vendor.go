package handler

import (
	"log/slog"
	"net/mail"
	"strings"

	"github.com/gofiber/fiber/v2"

	"backend/internal/model"
	"backend/internal/service"
)

type VendorHandler struct {
	vendorService *service.VendorService
}

func NewVendorHandler(vendorService *service.VendorService) *VendorHandler {
	return &VendorHandler{vendorService: vendorService}
}

func (h *VendorHandler) CreateRequest(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(string)
	if !ok || strings.TrimSpace(userID) == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{Error: "unauthorized"})
	}

	var req model.CreateVendorRequestRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	req.Fullname = strings.TrimSpace(req.Fullname)
	req.NID = strings.TrimSpace(req.NID)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Email = strings.TrimSpace(req.Email)

	if req.Fullname == "" || req.NID == "" || req.Phone == "" || req.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "fullname, nid, phone and email are required"})
	}
	if len(req.Fullname) > 120 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "fullname is too long"})
	}
	if len(req.NID) > 20 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "nid is too long"})
	}
	if len(req.Phone) > 20 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "phone is too long"})
	}
	if _, err := mail.ParseAddress(req.Email); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "email is invalid"})
	}

	result, err := h.vendorService.CreateRequest(c.Context(), userID, &req)
	if err != nil {
		slog.Error("create vendor request failed", "userID", userID, "err", err)
		return handleError(c, err, "internal server error")
	}

	return c.Status(fiber.StatusCreated).JSON(result)
}

func (h *VendorHandler) GetMyRequest(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(string)
	if !ok || strings.TrimSpace(userID) == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{Error: "unauthorized"})
	}

	result, err := h.vendorService.GetRequestByUserID(c.Context(), userID)
	if err != nil {
		slog.Error("get vendor request failed", "userID", userID, "err", err)
		return handleError(c, err, "internal server error")
	}

	return c.JSON(result)
}

func (h *VendorHandler) UpdateRequest(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(string)
	if !ok || strings.TrimSpace(userID) == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{Error: "unauthorized"})
	}

	var req model.UpdateVendorRequestRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	req.Fullname = strings.TrimSpace(req.Fullname)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Email = strings.TrimSpace(req.Email)
	req.Description = strings.TrimSpace(req.Description)

	if req.Fullname == "" && req.Phone == "" && req.Email == "" && req.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "no fields to update"})
	}
	if req.Fullname != "" && len(req.Fullname) > 120 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "fullname is too long"})
	}
	if req.Phone != "" && len(req.Phone) > 20 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "phone is too long"})
	}
	if req.Email != "" {
		if _, err := mail.ParseAddress(req.Email); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "email is invalid"})
		}
	}
	if req.Description != "" && len(req.Description) > 1000 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "description is too long"})
	}

	result, err := h.vendorService.UpdateRequest(c.Context(), userID, &req)
	if err != nil {
		slog.Error("update vendor request failed", "userID", userID, "err", err)
		return handleError(c, err, "internal server error")
	}

	return c.JSON(result)
}

func (h *VendorHandler) ListRequests(c *fiber.Ctx) error {
	params := model.PaginationParams{
		Limit:  c.QueryInt("limit", 20),
		Offset: c.QueryInt("offset", 0),
		Search: c.Query("search", ""),
	}

	if params.Limit <= 0 || params.Limit > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "limit must be between 1 and 100"})
	}
	if params.Offset < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "offset must be non-negative"})
	}

	results, total, err := h.vendorService.ListRequests(c.Context(), params)
	if err != nil {
		slog.Error("list vendor requests failed", "err", err)
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{
		"data":   results,
		"total":  total,
		"limit":  params.Limit,
		"offset": params.Offset,
	})
}

func (h *VendorHandler) DeleteRequest(c *fiber.Ctx) error {
	requestID := c.Params("id")
	if requestID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "request id is required"})
	}

	if err := h.vendorService.DeleteRequest(c.Context(), requestID); err != nil {
		slog.Error("delete vendor request failed", "requestID", requestID, "err", err)
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"message": "vendor request deleted successfully"})
}

func (h *VendorHandler) ApproveRequest(c *fiber.Ctx) error {
	requestID := c.Params("id")
	if requestID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "request id is required"})
	}

	if err := h.vendorService.ApproveRequest(c.Context(), requestID); err != nil {
		slog.Error("approve vendor request failed", "requestID", requestID, "err", err)
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"message": "vendor request approved successfully"})
}
