package service

import (
	"context"
	"errors"
	"strings"

	dbsqlc "backend/db/sqlc"
	"backend/internal/model"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type ProductionService struct {
	queries *dbsqlc.Queries
	db      dbsqlc.DBTX
}

func NewProductionService(queries *dbsqlc.Queries, db dbsqlc.DBTX) *ProductionService {
	return &ProductionService{queries: queries, db: db}
}

func (s *ProductionService) isMember(ctx context.Context, pid, uid pgtype.UUID, isGlobalAdmin bool) (bool, error) {
	if isGlobalAdmin {
		return true, nil
	}
	return s.queries.IsProductionMember(ctx, dbsqlc.IsProductionMemberParams{
		ProductionID: pid,
		UserID:       uid,
	})
}

func (s *ProductionService) hasRole(ctx context.Context, pid, uid pgtype.UUID, role dbsqlc.ProductionMemberRole, isGlobalAdmin bool) (bool, error) {
	if isGlobalAdmin {
		return true, nil
	}
	return s.queries.HasProductionRole(ctx, dbsqlc.HasProductionRoleParams{
		ProductionID: pid,
		UserID:       uid,
		Role:         role,
	})
}

func (s *ProductionService) isOwnerOrAdmin(ctx context.Context, pid, uid pgtype.UUID, isGlobalAdmin bool) (bool, error) {
	if isGlobalAdmin {
		return true, nil
	}

	isOwner, err := s.hasRole(ctx, pid, uid, dbsqlc.ProductionMemberRoleOwner, false)
	if err != nil || isOwner {
		return isOwner, err
	}
	return s.hasRole(ctx, pid, uid, dbsqlc.ProductionMemberRoleAdmin, false)
}

func (s *ProductionService) CheckProductionActive(ctx context.Context, productionID string) error {
	pid, err := parseUUID(productionID)
	if err != nil {
		return ErrProductionNotFound
	}

	active, err := s.queries.IsProductionActive(ctx, pid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrProductionNotFound
		}
		return err
	}

	if !active {
		return ErrProductionNotActive
	}
	return nil
}

func (s *ProductionService) resolveRootCategoryIDs(ctx context.Context, qtx *dbsqlc.Queries, names []string) ([]pgtype.UUID, error) {
	seen := make(map[string]bool)
	ids := make([]pgtype.UUID, 0, len(names))

	for _, raw := range names {
		name := strings.TrimSpace(raw)
		if name == "" {
			continue
		}

		key := strings.ToLower(name)
		if seen[key] {
			continue
		}
		seen[key] = true

		existing, err := qtx.GetRootCategoryByName(ctx, name)
		if err == nil {
			ids = append(ids, existing.ID)
			continue
		}
		if !errors.Is(err, pgx.ErrNoRows) {
			return nil, err
		}

		slug := slugifyName(name)
		created, createErr := qtx.CreateCategory(ctx, dbsqlc.CreateCategoryParams{
			ParentID:    pgtype.UUID{Valid: false},
			Name:        name,
			Slug:        slug,
			Description: pgtype.Text{Valid: false},
			Active:      true,
		})
		if createErr != nil {
			if isUniqueViolation(createErr) {
				retryExisting, retryErr := qtx.GetRootCategoryByName(ctx, name)
				if retryErr != nil {
					return nil, retryErr
				}
				ids = append(ids, retryExisting.ID)
				continue
			}
			return nil, createErr
		}

		ids = append(ids, created.ID)
	}

	return ids, nil
}

func (s *ProductionService) syncProductionCategories(ctx context.Context, qtx *dbsqlc.Queries, productionID pgtype.UUID, categoryIDs []pgtype.UUID) error {
	if err := qtx.ClearProductionCategories(ctx, productionID); err != nil {
		return err
	}
	for _, cid := range categoryIDs {
		if err := qtx.AddProductionCategory(ctx, dbsqlc.AddProductionCategoryParams{
			ProductionID: productionID,
			CategoryID:   cid,
		}); err != nil {
			return err
		}
	}
	return nil
}

func toProductionCategoryInfo(rows []dbsqlc.ListProductionCategoriesRow) []model.ProductionCategoryInfo {
	result := make([]model.ProductionCategoryInfo, 0, len(rows))
	for _, r := range rows {
		result = append(result, model.ProductionCategoryInfo{
			ID:       r.ID,
			Name:     r.Name,
			Slug:     r.Slug,
			ParentID: r.ParentID,
		})
	}
	return result
}

func (s *ProductionService) fetchCategoriesForProductions(ctx context.Context, productionIDs []pgtype.UUID) (map[pgtype.UUID][]model.ProductionCategoryInfo, error) {
	result := make(map[pgtype.UUID][]model.ProductionCategoryInfo)
	if len(productionIDs) == 0 {
		return result, nil
	}

	rows, err := s.queries.ListCategoriesForProductions(ctx, productionIDs)
	if err != nil {
		return nil, err
	}

	for _, r := range rows {
		result[r.ProductionID] = append(result[r.ProductionID], model.ProductionCategoryInfo{
			ID:       r.ID,
			Name:     r.Name,
			Slug:     r.Slug,
			ParentID: r.ParentID,
		})
	}

	return result, nil
}

func (s *ProductionService) GetProductionCategories(ctx context.Context, productionID string) ([]dbsqlc.ListProductionCategoriesRow, error) {
	pid, err := parseUUID(productionID)
	if err != nil {
		return nil, ErrProductionNotFound
	}

	rows, err := s.queries.ListProductionCategories(ctx, pid)
	if err != nil {
		return nil, err
	}
	if rows == nil {
		rows = []dbsqlc.ListProductionCategoriesRow{}
	}
	return rows, nil
}

func (s *ProductionService) ListProductionsByCategory(ctx context.Context, categoryID string, params model.PaginationParams) ([]dbsqlc.ListActiveProductionsByCategoryRow, int64, error) {
	cid, err := parseUUID(categoryID)
	if err != nil {
		return nil, 0, ErrCategoryNotFound
	}

	rows, err := s.queries.ListActiveProductionsByCategory(ctx, dbsqlc.ListActiveProductionsByCategoryParams{
		CategoryID: cid,
		Limit:      int32(params.Limit),
		Offset:     int32(params.Offset),
	})
	if err != nil {
		return nil, 0, err
	}
	if rows == nil {
		rows = []dbsqlc.ListActiveProductionsByCategoryRow{}
	}

	total, err := s.queries.CountActiveProductionsByCategory(ctx, cid)
	if err != nil {
		return nil, 0, err
	}

	return rows, total, nil
}

func (s *ProductionService) CreateProduction(ctx context.Context, userID string, req *model.CreateProductionRequest) (*model.ProductionWithCategories, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	pool, ok := s.db.(interface {
		Begin(context.Context) (pgx.Tx, error)
	})
	if !ok {
		return nil, errors.New("db does not support transactions")
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	qtx := s.queries.WithTx(tx)

	production, err := qtx.CreateProduction(ctx, dbsqlc.CreateProductionParams{
		ShopID:            req.ShopID,
		ShopName:          req.ShopName,
		ShopDescription:   req.ShopDescription,
		ProductionAddress: req.ProductionAddress,
		ProductionPhone:   req.ProductionPhone,
		ProductionEmail:   req.ProductionEmail,
		Telegram:          pgtype.Text{String: req.Telegram, Valid: req.Telegram != ""},
		Rubika:            pgtype.Text{String: req.Rubika, Valid: req.Rubika != ""},
		Eitaa:             pgtype.Text{String: req.Eitaa, Valid: req.Eitaa != ""},
		Whatsapp:          pgtype.Text{String: req.Whatsapp, Valid: req.Whatsapp != ""},
		Website:           pgtype.Text{String: req.Website, Valid: req.Website != ""},
	})
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrShopIDTaken
		}
		return nil, err
	}

	_, err = qtx.AddProductionMember(ctx, dbsqlc.AddProductionMemberParams{
		ProductionID: production.ID,
		UserID:       uid,
		Role:         dbsqlc.ProductionMemberRoleOwner,
	})
	if err != nil {
		return nil, err
	}

	categoryIDs, err := s.resolveRootCategoryIDs(ctx, qtx, req.Categories)
	if err != nil {
		return nil, err
	}
	if err := s.syncProductionCategories(ctx, qtx, production.ID, categoryIDs); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	categoryRows, err := s.queries.ListProductionCategories(ctx, production.ID)
	if err != nil {
		return nil, err
	}

	return &model.ProductionWithCategories{
		Production: production,
		Categories: toProductionCategoryInfo(categoryRows),
	}, nil
}

func (s *ProductionService) GetProduction(ctx context.Context, userID string, isGlobalAdmin bool, productionID string) (*model.ProductionWithCategories, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return nil, ErrProductionNotFound
	}

	member, err := s.isMember(ctx, pid, uid, isGlobalAdmin)
	if err != nil {
		return nil, err
	}
	if !member {
		return nil, ErrForbidden
	}

	production, err := s.queries.GetProductionByID(ctx, pid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProductionNotFound
		}
		return nil, err
	}

	categoryRows, err := s.queries.ListProductionCategories(ctx, pid)
	if err != nil {
		return nil, err
	}

	return &model.ProductionWithCategories{
		Production: production,
		Categories: toProductionCategoryInfo(categoryRows),
	}, nil
}

func (s *ProductionService) ListMyProductions(ctx context.Context, userID string, params model.PaginationParams) ([]model.ProductionListItemWithCategories, int64, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, 0, ErrUserNotFound
	}

	rows, err := s.queries.ListProductionsByUserID(ctx, dbsqlc.ListProductionsByUserIDParams{
		UserID: uid,
		Limit:  int32(params.Limit),
		Offset: int32(params.Offset),
	})
	if err != nil {
		return nil, 0, err
	}
	if rows == nil {
		rows = []dbsqlc.ListProductionsByUserIDRow{}
	}

	productionIDs := make([]pgtype.UUID, 0, len(rows))
	for _, r := range rows {
		productionIDs = append(productionIDs, r.ID)
	}

	categoriesByProduction, err := s.fetchCategoriesForProductions(ctx, productionIDs)
	if err != nil {
		return nil, 0, err
	}

	result := make([]model.ProductionListItemWithCategories, 0, len(rows))
	for _, r := range rows {
		categories := categoriesByProduction[r.ID]
		if categories == nil {
			categories = []model.ProductionCategoryInfo{}
		}
		result = append(result, model.ProductionListItemWithCategories{
			ListProductionsByUserIDRow: r,
			Categories:                 categories,
		})
	}

	total, err := s.queries.CountProductionsByUserID(ctx, uid)
	if err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

func (s *ProductionService) ListAllProductions(ctx context.Context, isGlobalAdmin bool, params model.PaginationParams) ([]model.ProductionAdminListItemWithCategories, int64, error) {
	if !isGlobalAdmin {
		return nil, 0, ErrForbidden
	}

	rows, err := s.queries.ListAllProductions(ctx, dbsqlc.ListAllProductionsParams{
		Limit:   int32(params.Limit),
		Offset:  int32(params.Offset),
		Column3: params.Search,
		Column4: params.Status,
	})
	if err != nil {
		return nil, 0, err
	}
	if rows == nil {
		rows = []dbsqlc.ListAllProductionsRow{}
	}

	productionIDs := make([]pgtype.UUID, 0, len(rows))
	for _, r := range rows {
		productionIDs = append(productionIDs, r.ID)
	}

	categoriesByProduction, err := s.fetchCategoriesForProductions(ctx, productionIDs)
	if err != nil {
		return nil, 0, err
	}

	result := make([]model.ProductionAdminListItemWithCategories, 0, len(rows))
	for _, r := range rows {
		categories := categoriesByProduction[r.ID]
		if categories == nil {
			categories = []model.ProductionCategoryInfo{}
		}
		result = append(result, model.ProductionAdminListItemWithCategories{
			ListAllProductionsRow: r,
			Categories:            categories,
		})
	}

	total, err := s.queries.CountAllProductions(ctx, dbsqlc.CountAllProductionsParams{
		Column1: params.Search,
		Column2: params.Status,
	})
	if err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

func (s *ProductionService) UpdateProduction(ctx context.Context, userID, productionID string, req *model.UpdateProductionRequest, isGlobalAdmin bool) (*model.ProductionWithCategories, error) {
	if err := s.CheckProductionActive(ctx, productionID); err != nil {
		return nil, err
	}

	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return nil, ErrProductionNotFound
	}

	allowed, err := s.isOwnerOrAdmin(ctx, pid, uid, isGlobalAdmin)
	if err != nil {
		return nil, err
	}
	if !allowed {
		return nil, ErrForbidden
	}

	pool, ok := s.db.(interface {
		Begin(context.Context) (pgx.Tx, error)
	})
	if !ok {
		return nil, errors.New("db does not support transactions")
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	qtx := s.queries.WithTx(tx)

	row, err := qtx.UpdateProduction(ctx, dbsqlc.UpdateProductionParams{
		ID:                pid,
		ShopID:            pgtype.Text{String: req.ShopID, Valid: req.ShopID != ""},
		ShopName:          pgtype.Text{String: req.ShopName, Valid: req.ShopName != ""},
		ShopDescription:   pgtype.Text{String: req.ShopDescription, Valid: req.ShopDescription != ""},
		ProductionAddress: pgtype.Text{String: req.ProductionAddress, Valid: req.ProductionAddress != ""},
		ProductionPhone:   pgtype.Text{String: req.ProductionPhone, Valid: req.ProductionPhone != ""},
		ProductionEmail:   pgtype.Text{String: req.ProductionEmail, Valid: req.ProductionEmail != ""},
		Telegram:          pgtype.Text{String: req.Telegram, Valid: req.Telegram != ""},
		Rubika:            pgtype.Text{String: req.Rubika, Valid: req.Rubika != ""},
		Eitaa:             pgtype.Text{String: req.Eitaa, Valid: req.Eitaa != ""},
		Whatsapp:          pgtype.Text{String: req.Whatsapp, Valid: req.Whatsapp != ""},
		Website:           pgtype.Text{String: req.Website, Valid: req.Website != ""},
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProductionNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrShopIDTaken
		}
		return nil, err
	}

	if req.Categories != nil {
		categoryIDs, err := s.resolveRootCategoryIDs(ctx, qtx, req.Categories)
		if err != nil {
			return nil, err
		}
		if err := s.syncProductionCategories(ctx, qtx, pid, categoryIDs); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	production := dbsqlc.Production{
		ID:                row.ID,
		ShopID:            row.ShopID,
		ShopName:          row.ShopName,
		ShopDescription:   row.ShopDescription,
		ProductionAddress: row.ProductionAddress,
		ProductionPhone:   row.ProductionPhone,
		ProductionEmail:   row.ProductionEmail,
		Telegram:          row.Telegram,
		Rubika:            row.Rubika,
		Eitaa:             row.Eitaa,
		Whatsapp:          row.Whatsapp,
		Website:           row.Website,
		LogoUrl:           row.LogoUrl,
		BannerUrl:         row.BannerUrl,
		CoverUrl:          row.CoverUrl,
		CreatedAt:         row.CreatedAt,
		UpdatedAt:         row.UpdatedAt,
		DeletedAt:         row.DeletedAt,
	}

	categoryRows, err := s.queries.ListProductionCategories(ctx, pid)
	if err != nil {
		return nil, err
	}

	return &model.ProductionWithCategories{
		Production: production,
		Categories: toProductionCategoryInfo(categoryRows),
	}, nil
}

func (s *ProductionService) DeleteProduction(ctx context.Context, userID, productionID string, isGlobalAdmin bool) error {
	if !isGlobalAdmin {
		return ErrForbidden
	}

	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return ErrProductionNotFound
	}

	isOwner, err := s.hasRole(ctx, pid, uid, dbsqlc.ProductionMemberRoleOwner, isGlobalAdmin)
	if err != nil {
		return err
	}
	if !isOwner {
		return ErrForbidden
	}

	return s.queries.SoftDeleteProduction(ctx, pid)
}

func (s *ProductionService) ListMembers(ctx context.Context, userID, productionID string, isGlobalAdmin bool, params model.PaginationParams) ([]dbsqlc.ListProductionMembersRow, int64, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, 0, ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return nil, 0, ErrProductionNotFound
	}

	member, err := s.isMember(ctx, pid, uid, isGlobalAdmin)
	if err != nil {
		return nil, 0, err
	}
	if !member {
		return nil, 0, ErrForbidden
	}

	members, err := s.queries.ListProductionMembers(ctx, dbsqlc.ListProductionMembersParams{
		ProductionID: pid,
		Limit:        int32(params.Limit),
		Offset:       int32(params.Offset),
	})
	if err != nil {
		return nil, 0, err
	}

	if members == nil {
		members = []dbsqlc.ListProductionMembersRow{}
	}

	total, err := s.queries.CountProductionMembers(ctx, pid)
	if err != nil {
		return nil, 0, err
	}

	return members, total, nil
}

func (s *ProductionService) SearchUsersForMembership(ctx context.Context, userID, productionID, query string, isGlobalAdmin bool) ([]dbsqlc.SearchUsersForMembershipRow, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return nil, ErrProductionNotFound
	}

	allowed, err := s.isOwnerOrAdmin(ctx, pid, uid, isGlobalAdmin)
	if err != nil {
		return nil, err
	}
	if !allowed {
		return nil, ErrForbidden
	}

	trimmed := strings.TrimSpace(query)
	if trimmed == "" {
		return []dbsqlc.SearchUsersForMembershipRow{}, nil
	}

	return s.queries.SearchUsersForMembership(ctx, dbsqlc.SearchUsersForMembershipParams{
		ProductionID: pid,
		Lower:        strings.ToLower(trimmed),
		Limit:        10,
	})
}

func (s *ProductionService) AddMember(ctx context.Context, userID, productionID string, req *model.AddMemberRequest, isGlobalAdmin bool) (*dbsqlc.ProductionMember, error) {
	if err := s.CheckProductionActive(ctx, productionID); err != nil {
		return nil, err
	}

	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return nil, ErrProductionNotFound
	}

	if isGlobalAdmin {

	} else {
		isOwner, ownerErr := s.hasRole(ctx, pid, uid, dbsqlc.ProductionMemberRoleOwner, false)
		if ownerErr != nil {
			return nil, ownerErr
		}
		isAdmin, adminErr := s.hasRole(ctx, pid, uid, dbsqlc.ProductionMemberRoleAdmin, false)
		if adminErr != nil {
			return nil, adminErr
		}
		if !isOwner && !isAdmin {
			return nil, ErrForbidden
		}
		if !isOwner && req.Role == string(dbsqlc.ProductionMemberRoleAdmin) {
			return nil, ErrInvalidRole
		}
	}

	targetUID, err := parseUUID(req.UserID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	member, err := s.queries.AddProductionMember(ctx, dbsqlc.AddProductionMemberParams{
		ProductionID: pid,
		UserID:       targetUID,
		Role:         dbsqlc.ProductionMemberRole(req.Role),
	})
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrMemberAlreadyExists
		}
		return nil, err
	}

	return &member, nil
}

func (s *ProductionService) UpdateMemberRole(ctx context.Context, userID, productionID, targetUserID, role string, isGlobalAdmin bool) error {
	if err := s.CheckProductionActive(ctx, productionID); err != nil {
		return err
	}

	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return ErrProductionNotFound
	}

	isOwner, err := s.hasRole(ctx, pid, uid, dbsqlc.ProductionMemberRoleOwner, isGlobalAdmin)
	if err != nil {
		return err
	}
	if !isOwner {
		return ErrForbidden
	}

	if role == string(dbsqlc.ProductionMemberRoleOwner) {
		return ErrInvalidRole
	}

	targetUID, err := parseUUID(targetUserID)
	if err != nil {
		return ErrUserNotFound
	}

	return s.queries.UpdateProductionMemberRole(ctx, dbsqlc.UpdateProductionMemberRoleParams{
		ProductionID: pid,
		UserID:       targetUID,
		Role:         dbsqlc.ProductionMemberRole(role),
	})
}

func (s *ProductionService) RemoveMember(ctx context.Context, userID, productionID, targetUserID string, isGlobalAdmin bool) error {
	if err := s.CheckProductionActive(ctx, productionID); err != nil {
		return err
	}

	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return ErrProductionNotFound
	}

	isOwner, err := s.hasRole(ctx, pid, uid, dbsqlc.ProductionMemberRoleOwner, isGlobalAdmin)
	if err != nil {
		return err
	}
	if !isOwner {
		return ErrForbidden
	}

	targetUID, err := parseUUID(targetUserID)
	if err != nil {
		return ErrUserNotFound
	}

	return s.queries.RemoveProductionMember(ctx, dbsqlc.RemoveProductionMemberParams{
		ProductionID: pid,
		UserID:       targetUID,
	})
}

func (s *ProductionService) CheckMediaAccess(ctx context.Context, userID, productionID, mediaType string, isGlobalAdmin bool) error {
	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return ErrProductionNotFound
	}

	if mediaType != "logo" && mediaType != "banner" && mediaType != "cover" {
		return ErrInvalidMediaType
	}

	allowed, err := s.isOwnerOrAdmin(ctx, pid, uid, isGlobalAdmin)
	if err != nil {
		return err
	}
	if !allowed {
		return ErrForbidden
	}

	return nil
}

func (s *ProductionService) ConfirmMediaUpload(ctx context.Context, userID, productionID, mediaType, publicURL string, isGlobalAdmin bool) error {
	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return ErrProductionNotFound
	}

	allowed, err := s.isOwnerOrAdmin(ctx, pid, uid, isGlobalAdmin)
	if err != nil {
		return err
	}
	if !allowed {
		return ErrForbidden
	}

	params := dbsqlc.UpdateProductionMediaURLParams{ID: pid}
	switch mediaType {
	case "logo":
		params.LogoUrl = pgtype.Text{String: publicURL, Valid: true}
	case "banner":
		params.BannerUrl = pgtype.Text{String: publicURL, Valid: true}
	case "cover":
		params.CoverUrl = pgtype.Text{String: publicURL, Valid: true}
	default:
		return ErrInvalidMediaType
	}

	_, err = s.queries.UpdateProductionMediaURL(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrProductionNotFound
		}
		return err
	}

	return nil
}

func (s *ProductionService) ActiveProduction(ctx context.Context, productionID string, isGlobalAdmin bool) error {
	if !isGlobalAdmin {
		return ErrForbidden
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return ErrProductionNotFound
	}

	rows, err := s.queries.ActivateProduction(ctx, pid)
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrProductionNotFound
	}

	return nil
}

func (s *ProductionService) DeactiveProduction(ctx context.Context, productionID string, isGlobalAdmin bool) error {
	if !isGlobalAdmin {
		return ErrForbidden
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return ErrProductionNotFound
	}

	rows, err := s.queries.DeactivateProduction(ctx, pid)
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrProductionNotFound
	}

	return nil
}

func (s *ProductionService) IsProductionActive(ctx context.Context, userID, productionID string, isGlobalAdmin bool) error {
	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return ErrProductionNotFound
	}

	member, err := s.isMember(ctx, pid, uid, isGlobalAdmin)
	if err != nil {
		return err
	}
	if !member {
		return ErrForbidden
	}

	active, err := s.queries.IsProductionActive(ctx, pid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrProductionNotFound
		}
		return err
	}

	if !active {
		return ErrProductionNotActive
	}
	return nil
}

func (s *ProductionService) GetMembersCount(ctx context.Context, userID, productionID string, isGlobalAdmin bool) (*model.MembersCountResponse, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	pid, err := parseUUID(productionID)
	if err != nil {
		return nil, ErrProductionNotFound
	}

	member, err := s.isMember(ctx, pid, uid, isGlobalAdmin)
	if err != nil {
		return nil, err
	}
	if !member {
		return nil, ErrForbidden
	}

	counts, err := s.queries.GetMembersCount(ctx, pid)
	if err != nil {
		return nil, err
	}

	return &model.MembersCountResponse{
		EditorTotal: int(counts.EditorTotal),
		AdminTotal:  int(counts.AdminTotal),
	}, nil
}

func (s *ProductionService) GetPublicProduction(ctx context.Context, productionID string) (*model.ProductionWithCategories, error) {
	production, err := s.queries.GetProductionBySlug(ctx, productionID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProductionNotFound
		}
		return nil, err
	}

	categoryRows, err := s.queries.ListProductionCategories(ctx, production.ID)
	if err != nil {
		return nil, err
	}

	return &model.ProductionWithCategories{
		Production: production,
		Categories: toProductionCategoryInfo(categoryRows),
	}, nil
}
