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
	service.ErrSamePassword:               {Status: fiber.StatusBadRequest, Text: service.ErrSamePassword.Error()},
	service.ErrEmailTaken:                 {Status: fiber.StatusConflict, Text: service.ErrEmailTaken.Error()},
	service.ErrUsernameTaken:              {Status: fiber.StatusConflict, Text: service.ErrUsernameTaken.Error()},
	service.ErrPhoneTaken:                 {Status: fiber.StatusConflict, Text: service.ErrPhoneTaken.Error()},
	service.ErrInvalidCreds:               {Status: fiber.StatusBadRequest, Text: service.ErrInvalidCreds.Error()},
	service.ErrValidationFailed:           {Status: fiber.StatusBadRequest, Text: service.ErrValidationFailed.Error()},
	service.ErrUserNotFound:               {Status: fiber.StatusNotFound, Text: service.ErrUserNotFound.Error()},
	service.ErrTokenRevoked:               {Status: fiber.StatusUnauthorized, Text: service.ErrTokenRevoked.Error()},
	service.ErrVendorRequestAlreadyExists: {Status: fiber.StatusConflict, Text: service.ErrVendorRequestAlreadyExists.Error()},
	service.ErrVendorRequestNotFound:      {Status: fiber.StatusNotFound, Text: service.ErrVendorRequestNotFound.Error()},
	service.ErrConflict:                   {Status: fiber.StatusConflict, Text: service.ErrConflict.Error()},
	service.ErrProductionNotFound:         {Status: fiber.StatusNotFound, Text: service.ErrProductionNotFound.Error()},
	service.ErrForbidden:                  {Status: fiber.StatusForbidden, Text: service.ErrForbidden.Error()},
	service.ErrInvalidRole:                {Status: fiber.StatusBadRequest, Text: service.ErrInvalidRole.Error()},
	service.ErrMemberAlreadyExists:        {Status: fiber.StatusConflict, Text: service.ErrMemberAlreadyExists.Error()},
	service.ErrInvalidMediaType:           {Status: fiber.StatusBadRequest, Text: service.ErrInvalidMediaType.Error()},
	service.ErrProductionNotActive:        {Status: fiber.StatusForbidden, Text: service.ErrProductionNotActive.Error()},
	service.ErrShopIDTaken:                {Status: fiber.StatusConflict, Text: service.ErrShopIDTaken.Error()},
}

func handleError(c *fiber.Ctx, err error, fallbackMessage string) error {
	for serviceErr, config := range errorMap {
		if errors.Is(err, serviceErr) {
			return c.Status(config.Status).JSON(model.ErrorResponse{Error: config.Text})
		}
	}
	return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Error: fallbackMessage})
}
