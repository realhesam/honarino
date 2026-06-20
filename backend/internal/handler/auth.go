package handler

import (
	"errors"
	"log/slog"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"

	"backend/internal/model"
	"backend/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
	validate    *validator.Validate
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService, validate: validator.New()}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req model.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}
	if err := h.validate.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "validation failed",
			"details": formatValidationErrors(err),
		})
	}

	resp, err := h.authService.Register(c.Context(), &req)
	if err != nil {
		if errors.Is(err, service.ErrEmailTaken) || errors.Is(err, service.ErrUsernameTaken) {
			return c.Status(fiber.StatusConflict).JSON(model.ErrorResponse{Error: "email or username already registered"})
		}
		slog.Error("register failed", "err", err)
		return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Error: "internal server error"})
	}

	return c.Status(fiber.StatusCreated).JSON(resp)
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req model.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}
	if err := h.validate.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "validation failed"})
	}

	resp, err := h.authService.Login(c.Context(), &req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCreds) {
			return c.Status(fiber.StatusUnauthorized).JSON(model.ErrorResponse{Error: "invalid username or password"})
		}
		slog.Error("login failed", "err", err)
		return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Error: "internal server error"})
	}

	return c.JSON(resp)
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	tokenStr := c.Locals("tokenStr").(string)

	if err := h.authService.Logout(c.Context(), tokenStr); err != nil {
		slog.Error("logout failed", "err", err)
	}

	return c.JSON(fiber.Map{"message": "logged out successfully"})
}


func formatValidationErrors(err error) map[string]string {
	errs := make(map[string]string)
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		for _, e := range ve {
			errs[e.Field()] = e.Tag()
		}
	}
	return errs
}
