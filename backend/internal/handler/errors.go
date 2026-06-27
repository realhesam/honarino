package handler

import (
	"backend/internal/model"
	"backend/internal/service"
	"errors"

	"github.com/gofiber/fiber/v2"
)

type errorConfig struct {
	Status int
	Text   string
}

var errorMap = map[error]errorConfig{
	service.ErrSamePassword:     {Status: fiber.StatusBadRequest, Text: service.ErrSamePassword.Error()},
	service.ErrEmailTaken:       {Status: fiber.StatusConflict, Text: service.ErrEmailTaken.Error()},
	service.ErrUsernameTaken:    {Status: fiber.StatusConflict, Text: service.ErrUsernameTaken.Error()},
	service.ErrPhoneTaken:       {Status: fiber.StatusConflict, Text: service.ErrPhoneTaken.Error()},
	service.ErrInvalidCreds:     {Status: fiber.StatusBadRequest, Text: service.ErrInvalidCreds.Error()},
	service.ErrValidationFailed: {Status: fiber.StatusBadRequest, Text: service.ErrValidationFailed.Error()},
	service.ErrUserNotFound:     {Status: fiber.StatusNotFound, Text: service.ErrUserNotFound.Error()},
	service.ErrTokenRevoked:     {Status: fiber.StatusUnauthorized, Text: service.ErrTokenRevoked.Error()},
}

func handleError(c *fiber.Ctx, err error, fallbackMessage string) error {
	for serviceErr, config := range errorMap {
		if errors.Is(err, serviceErr) {
			return c.Status(config.Status).JSON(model.ErrorResponse{Error: config.Text})
		}
	}
	return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Error: fallbackMessage})
}
