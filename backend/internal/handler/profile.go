package handler

import (
	"fmt"
	"log/slog"
	"net/url"
	"strings"

	"github.com/gofiber/fiber/v2"

	"backend/internal/model"
	"backend/internal/service"
	"backend/internal/storage"
)

type ProfileHandler struct {
	profileService *service.ProfileService
	storage        *storage.MinioClient
}

func NewProfileHandler(profileService *service.ProfileService, storageClient *storage.MinioClient) *ProfileHandler {
	return &ProfileHandler{profileService: profileService, storage: storageClient}
}

func (h *ProfileHandler) Profile(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(string)
	if !ok || strings.TrimSpace(userID) == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{Error: "unauthorized"})
	}

	user, err := h.profileService.GetProfile(c.Context(), userID)
	if err != nil {
		slog.Error("get profile failed", "err", err)
		return handleError(c, err, "internal server error")
	}
	return c.JSON(user)
}

func (h *ProfileHandler) UpdateProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(string)
	if !ok || strings.TrimSpace(userID) == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{Error: "unauthorized"})
	}

	var req model.UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Address = strings.TrimSpace(req.Address)
	req.ProfilePictureURL = strings.TrimSpace(req.ProfilePictureURL)

	if req.Name == "" && req.Phone == "" && req.Address == "" && req.ProfilePictureURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "no fields to update"})
	}
	if req.Name != "" && (len(req.Name) < 2 || len(req.Name) > 100) {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "name must be between 2 and 100 characters"})
	}
	if req.Phone != "" && len(req.Phone) > 20 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "phone is too long"})
	}
	if req.Address != "" && len(req.Address) > 250 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "address is too long"})
	}
	if req.ProfilePictureURL != "" {
		parsedURL, err := url.ParseRequestURI(req.ProfilePictureURL)
		if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
			return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "profile_picture_url must be a valid http/https url"})
		}
	}

	user, err := h.profileService.UpdateProfile(c.Context(), userID, &req)
	if err != nil {
		slog.Error("update profile failed", "err", err)
		return handleError(c, err, "internal server error")
	}

	return c.JSON(user)
}

func (h *ProfileHandler) ChangePassword(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(string)
	if !ok || strings.TrimSpace(userID) == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{Error: "unauthorized"})
	}

	var req struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	req.CurrentPassword = strings.TrimSpace(req.CurrentPassword)
	req.NewPassword = strings.TrimSpace(req.NewPassword)

	if req.CurrentPassword == "" || req.NewPassword == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "current and new password are required"})
	}
	if len(req.NewPassword) < 8 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "new password must be at least 8 characters"})
	}

	err := h.profileService.ChangePassword(c.Context(), userID, req.CurrentPassword, req.NewPassword)
	if err != nil {
		slog.Error("change pass failed", "err", err)
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"message": "password changed successfully"})
}

func (h *ProfileHandler) GetUploadURL(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(string)
	if !ok || strings.TrimSpace(userID) == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{Error: "unauthorized"})
	}

	var req struct {
		FileName    string `json:"fileName"`
		ContentType string `json:"contentType"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}
	req.FileName = strings.TrimSpace(req.FileName)
	req.ContentType = strings.TrimSpace(req.ContentType)

	if req.FileName == "" || req.ContentType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "fileName and contentType are required"})
	}
	if !isAllowedMediaContentType(req.ContentType) {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "unsupported content type"})
	}
	if h.storage == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(model.ErrorResponse{Error: "storage not configured"})
	}

	objectName := profileObjectName(userID, req.ContentType)
	uploadURL, publicURL, err := h.storage.GetPresignedUploadURL(c.Context(), objectName, req.ContentType)
	if err != nil {
		slog.Error("get upload url failed", "err", err)
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"uploadUrl": uploadURL, "publicUrl": publicURL})
}

func profileObjectName(userID, contentType string) string {
	ext := contentTypeToExtension(contentType)
	return fmt.Sprintf("%s/profile%s", userID, ext)
}

func isAllowedMediaContentType(contentType string) bool {
	switch contentType {
	case "image/jpeg", "image/png", "image/gif", "image/webp":
		return true
	default:
		return false
	}
}

func contentTypeToExtension(contentType string) string {
	switch contentType {
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/gif":
		return ".gif"
	case "image/webp":
		return ".webp"
	default:
		return ".jpg"
	}
}
