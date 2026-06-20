package handler

import (
    "errors"
    "fmt"
    "log/slog"

    "github.com/gofiber/fiber/v2"

    "backend/internal/model"
    "backend/internal/service"
    "backend/internal/storage"
)

type ProfileHandler struct {
    profileService *service.ProfileService
    storage         *storage.MinioClient
}

func NewProfileHandler(profileService *service.ProfileService, storageClient *storage.MinioClient) *ProfileHandler {
    return &ProfileHandler{profileService: profileService, storage: storageClient}
}

func (h *ProfileHandler) Profile(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)

    user, err := h.profileService.GetProfile(c.Context(), userID)
    if err != nil {
        return c.Status(fiber.StatusNotFound).JSON(model.ErrorResponse{Error: "user not found"})
    }
    return c.JSON(user)
}

func (h *ProfileHandler) UpdateProfile(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)

    var req model.UpdateProfileRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
    }

    if req.Name == "" && req.Phone == "" && req.Address == "" && req.ProfilePictureURL == "" {
        return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "no fields to update"})
    }

    updates := make(map[string]interface{})
    if req.Name != "" {
        updates["name"] = req.Name
    }
    if req.Phone != "" {
        updates["phone"] = req.Phone
    }
    if req.Address != "" {
        updates["address"] = req.Address
    }
    if req.ProfilePictureURL != "" {
        updates["profile_picture_url"] = req.ProfilePictureURL
    }

    user, err := h.profileService.UpdateProfile(c.Context(), userID, updates)
    if err != nil {
        if errors.Is(err, service.ErrUserNotFound) {
            return c.Status(fiber.StatusNotFound).JSON(model.ErrorResponse{Error: "user not found"})
        }
        slog.Error("update profile failed", "err", err)
        return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Error: "internal server error"})
    }

    return c.JSON(user)
}

func (h *ProfileHandler) ChangePassword(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)

    var req struct {
        CurrentPassword string `json:"current_password"`
        NewPassword     string `json:"new_password"`
    }
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
    }

    if req.CurrentPassword == "" || req.NewPassword == "" {
        return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "current and new password are required"})
    }
    if len(req.NewPassword) < 8 {
        return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "new password must be at least 8 characters"})
    }

    err := h.profileService.ChangePassword(c.Context(), userID, req.CurrentPassword, req.NewPassword)
    if err != nil {
        if errors.Is(err, service.ErrInvalidCreds) {
            return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{Error: "current password is incorrect"})
        }
        if errors.Is(err, service.ErrUserNotFound) {
            return c.Status(fiber.StatusNotFound).JSON(model.ErrorResponse{Error: "user not found"})
        }
        slog.Error("change password failed", "err", err)
        return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Error: "internal server error"})
    }

    return c.JSON(fiber.Map{"message": "password changed successfully"})
}

func (h *ProfileHandler) GetUploadURL(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)

    var req struct {
        FileName    string `json:"fileName"`
        ContentType string `json:"contentType"`
    }
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
    }
    if req.FileName == "" || req.ContentType == "" {
        return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "fileName and contentType are required"})
    }
    if h.storage == nil {
        return c.Status(fiber.StatusServiceUnavailable).JSON(model.ErrorResponse{Error: "storage not configured"})
    }

    objectName := profileObjectName(userID, req.ContentType)
    uploadURL, publicURL, err := h.storage.GetPresignedUploadURL(c.Context(), objectName, req.ContentType)
    if err != nil {
        slog.Error("minio presigned upload failed", "err", err)
        return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Error: "upload url generation failed"})
    }

    return c.JSON(fiber.Map{"uploadUrl": uploadURL, "publicUrl": publicURL})
}

func profileObjectName(userID, contentType string) string {
    ext := contentTypeToExtension(contentType)
    return fmt.Sprintf("%s/profile%s", userID, ext)
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
