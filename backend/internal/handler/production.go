package handler

import (
	"backend/internal/model"
	"backend/internal/service"
	"backend/internal/storage"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type ProductionHandler struct {
	svc     *service.ProductionService
	storage *storage.MinioClient
}

func NewProductionHandler(svc *service.ProductionService, storageClient *storage.MinioClient) *ProductionHandler {
	return &ProductionHandler{svc: svc, storage: storageClient}
}

func (h *ProductionHandler) userID(c *fiber.Ctx) string {
	userID, _ := c.Locals("userID").(string)
	return userID
}

func (h *ProductionHandler) isGlobalAdmin(c *fiber.Ctx) bool {
	role, _ := c.Locals("role").(string)
	return role == "admin"
}

func (h *ProductionHandler) CreateProduction(c *fiber.Ctx) error {
	var req model.CreateProductionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	req.ShopID = strings.TrimSpace(req.ShopID)
	req.ShopName = strings.TrimSpace(req.ShopName)
	req.ShopDescription = strings.TrimSpace(req.ShopDescription)
	req.ProductionAddress = strings.TrimSpace(req.ProductionAddress)
	req.ProductionPhone = strings.TrimSpace(req.ProductionPhone)
	req.ProductionEmail = strings.TrimSpace(req.ProductionEmail)
	req.Telegram = strings.TrimSpace(req.Telegram)
	req.Rubika = strings.TrimSpace(req.Rubika)
	req.Eitaa = strings.TrimSpace(req.Eitaa)
	req.Whatsapp = strings.TrimSpace(req.Whatsapp)
	req.Website = strings.TrimSpace(req.Website)

	if req.ShopName == "" || len(req.ShopName) < 2 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "shop_name must be at least 2 characters"})
	}
	if req.ShopDescription == "" || len(req.ShopDescription) < 20 {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "shop_description must be at least 20 characters"})
	}
	if req.ProductionAddress == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "production_address is required"})
	}
	if req.ProductionPhone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "production_phone is required"})
	}
	if req.ProductionEmail == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "production_email is required"})
	}

	production, err := h.svc.CreateProduction(c.Context(), h.userID(c), &req)
	if err != nil {
		fmt.Println("create production failed:", err)
		return handleError(c, err, "internal server error")
	}

	return c.Status(fiber.StatusCreated).JSON(production)
}

func (h *ProductionHandler) ListProductions(c *fiber.Ctx) error {
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

	rows, total, err := h.svc.ListMyProductions(c.Context(), h.userID(c), params)
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

func (h *ProductionHandler) ListAdminProductions(c *fiber.Ctx) error {
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

	rows, total, err := h.svc.ListAllProductions(c.Context(), h.isGlobalAdmin(c), params)
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

func (h *ProductionHandler) GetProduction(c *fiber.Ctx) error {
	production, err := h.svc.GetProduction(c.Context(), h.userID(c), h.isGlobalAdmin(c), c.Params("id"))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(production)
}

func (h *ProductionHandler) UpdateProduction(c *fiber.Ctx) error {
	var req model.UpdateProductionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	production, err := h.svc.UpdateProduction(c.Context(), h.userID(c), c.Params("id"), &req, h.isGlobalAdmin(c))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(production)
}

func (h *ProductionHandler) DeleteProduction(c *fiber.Ctx) error {
	if err := h.svc.DeleteProduction(c.Context(), h.userID(c), c.Params("id"), h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductionHandler) ListMembers(c *fiber.Ctx) error {
	if q := c.Query("q"); q != "" {
		users, err := h.svc.SearchUsersForMembership(c.Context(), h.userID(c), c.Params("id"), q, h.isGlobalAdmin(c))
		if err != nil {
			return handleError(c, err, "internal server error")
		}
		return c.JSON(fiber.Map{"data": users, "total": len(users)})
	}

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

	members, total, err := h.svc.ListMembers(c.Context(), h.userID(c), c.Params("id"), h.isGlobalAdmin(c), params)
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{
		"data":   members,
		"total":  total,
		"limit":  params.Limit,
		"offset": params.Offset,
	})
}

func (h *ProductionHandler) SearchUsersForMembership(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "q is required"})
	}

	users, err := h.svc.SearchUsersForMembership(c.Context(), h.userID(c), c.Params("id"), query, h.isGlobalAdmin(c))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"data": users})
}

func (h *ProductionHandler) AddMember(c *fiber.Ctx) error {
	var req model.AddMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	if req.UserID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "user_id is required"})
	}
	if req.Role != "admin" && req.Role != "editor" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "role must be admin or editor"})
	}

	member, err := h.svc.AddMember(c.Context(), h.userID(c), c.Params("id"), &req, h.isGlobalAdmin(c))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.Status(fiber.StatusCreated).JSON(member)
}

func (h *ProductionHandler) UpdateMemberRole(c *fiber.Ctx) error {
	var req model.UpdateMemberRoleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	if req.Role != "admin" && req.Role != "editor" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "role must be admin or editor"})
	}

	if err := h.svc.UpdateMemberRole(c.Context(), h.userID(c), c.Params("id"), c.Params("userID"), req.Role, h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductionHandler) RemoveMember(c *fiber.Ctx) error {
	if err := h.svc.RemoveMember(c.Context(), h.userID(c), c.Params("id"), c.Params("userID"), h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductionHandler) GetMediaUploadURL(c *fiber.Ctx) error {
	var req model.ProductionMediaUploadURLRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	if req.Type != "logo" && req.Type != "banner" && req.Type != "cover" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "type must be logo, banner or cover"})
	}
	if req.ContentType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "contentType is required"})
	}

	req.ContentType = strings.TrimSpace(req.ContentType)
	if !isAllowedMediaContentType(req.ContentType) {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "unsupported content type"})
	}
	if h.storage == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(model.ErrorResponse{Error: "storage not configured"})
	}

	if err := h.svc.CheckMediaAccess(c.Context(), h.userID(c), c.Params("id"), req.Type, h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	objectName := productionMediaObjectName(c.Params("id"), req.Type, req.ContentType)

	uploadURL, publicURL, err := h.storage.GetPresignedUploadURL(c.Context(), objectName, req.ContentType)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(model.ErrorResponse{Error: "internal server error"})
	}

	return c.JSON(fiber.Map{"uploadUrl": uploadURL, "publicUrl": publicURL})
}

func (h *ProductionHandler) ConfirmMediaUpload(c *fiber.Ctx) error {
	var req model.ProductionMediaConfirmRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "invalid request body"})
	}

	if req.Type != "logo" && req.Type != "banner" && req.Type != "cover" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "type must be logo, banner or cover"})
	}
	if req.ContentType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "contentType is required"})
	}

	if !isAllowedMediaContentType(req.ContentType) {
		return c.Status(fiber.StatusBadRequest).JSON(model.ErrorResponse{Error: "unsupported content type"})
	}
	if h.storage == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(model.ErrorResponse{Error: "storage not configured"})
	}

	objectName := productionMediaObjectName(c.Params("id"), req.Type, req.ContentType)
	publicURL := h.storage.PublicURL(objectName)

	if err := h.svc.ConfirmMediaUpload(c.Context(), h.userID(c), c.Params("id"), req.Type, publicURL, h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"url": publicURL})
}

func productionMediaObjectName(productionID, mediaType, contentType string) string {
	ext := contentTypeToExtension(contentType)
	return fmt.Sprintf("productions/%s/%s%s", productionID, mediaType, ext)
}

func (h *ProductionHandler) ActiveProduction(c *fiber.Ctx) error {
	if err := h.svc.ActiveProduction(c.Context(), c.Params("id"), h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductionHandler) DeactiveProduction(c *fiber.Ctx) error {
	if err := h.svc.DeactiveProduction(c.Context(), c.Params("id"), h.isGlobalAdmin(c)); err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *ProductionHandler) IsProductionActive(c *fiber.Ctx) error {
	err := h.svc.IsProductionActive(c.Context(), h.userID(c), c.Params("id"), h.isGlobalAdmin(c))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(fiber.Map{"active": "true"})
}

func (h *ProductionHandler) GetMembersCount(c *fiber.Ctx) error {
	count, err := h.svc.GetMembersCount(c.Context(), h.userID(c), c.Params("id"), h.isGlobalAdmin(c))
	if err != nil {
		return handleError(c, err, "internal server error")
	}

	return c.JSON(count)
}
