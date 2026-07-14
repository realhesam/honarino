package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	dbsqlc "backend/db/sqlc"
	"backend/internal/model"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type ProductService struct {
	queries *dbsqlc.Queries
}

func NewProductService(queries *dbsqlc.Queries) *ProductService {
	return &ProductService{queries: queries}
}

func (s *ProductService) validateAndResolveCategoryIDs(ctx context.Context, shopID pgtype.UUID, rawIDs []string) ([]pgtype.UUID, error) {
	if len(rawIDs) == 0 {
		return nil, ErrNoCategoriesSelected
	}

	ids := make([]pgtype.UUID, 0, len(rawIDs))
	seen := make(map[pgtype.UUID]bool)
	for _, raw := range rawIDs {
		cid, err := parseUUID(strings.TrimSpace(raw))
		if err != nil {
			return nil, ErrInvalidProductCategory
		}
		if seen[cid] {
			continue
		}
		seen[cid] = true
		ids = append(ids, cid)
	}

	categories, err := s.queries.GetCategoriesByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}
	if len(categories) != len(ids) {
		return nil, ErrInvalidProductCategory
	}

	shopRootCategories, err := s.queries.ListProductionCategories(ctx, shopID)
	if err != nil {
		return nil, err
	}
	allowedParents := make(map[pgtype.UUID]bool, len(shopRootCategories))
	for _, rc := range shopRootCategories {
		allowedParents[rc.ID] = true
	}

	for _, c := range categories {
		if !c.ParentID.Valid {

			return nil, ErrInvalidProductCategory
		}
		if !allowedParents[c.ParentID] {
			return nil, ErrCategoryNotAllowedForShop
		}
	}

	return ids, nil
}

func (s *ProductService) syncProductCategories(ctx context.Context, productID pgtype.UUID, categoryIDs []pgtype.UUID) error {
	if err := s.queries.ClearProductCategories(ctx, productID); err != nil {
		return err
	}
	for _, cid := range categoryIDs {
		if err := s.queries.AddProductCategory(ctx, dbsqlc.AddProductCategoryParams{
			ProductID:  productID,
			CategoryID: cid,
		}); err != nil {
			return err
		}
	}
	return nil
}

func toProductCategoryInfo(rows []dbsqlc.ListProductCategoriesRow) []model.ProductCategoryInfo {
	result := make([]model.ProductCategoryInfo, 0, len(rows))
	for _, r := range rows {
		result = append(result, model.ProductCategoryInfo{
			ID:       r.ID,
			Name:     r.Name,
			Slug:     r.Slug,
			ParentID: r.ParentID,
		})
	}
	return result
}

func toProductMediaInfo(rows []dbsqlc.ProductMedium) []model.ProductMediaInfo {
	result := make([]model.ProductMediaInfo, 0, len(rows))
	for _, r := range rows {
		result = append(result, model.ProductMediaInfo{
			ID:        r.ID,
			Type:      string(r.Type),
			URL:       r.Url,
			SortOrder: r.SortOrder,
			AltText:   r.AltText,
			CreatedAt: r.CreatedAt,
		})
	}
	return result
}

func (s *ProductService) fetchCategoriesForProducts(ctx context.Context, productIDs []pgtype.UUID) (map[pgtype.UUID][]model.ProductCategoryInfo, error) {
	result := make(map[pgtype.UUID][]model.ProductCategoryInfo)
	if len(productIDs) == 0 {
		return result, nil
	}

	rows, err := s.queries.ListCategoriesForProducts(ctx, productIDs)
	if err != nil {
		return nil, err
	}
	for _, r := range rows {
		result[r.ProductID] = append(result[r.ProductID], model.ProductCategoryInfo{
			ID:       r.ID,
			Name:     r.Name,
			Slug:     r.Slug,
			ParentID: r.ParentID,
		})
	}
	return result, nil
}

func (s *ProductService) fetchMediaForProducts(ctx context.Context, productIDs []pgtype.UUID) (map[pgtype.UUID][]model.ProductMediaInfo, error) {
	result := make(map[pgtype.UUID][]model.ProductMediaInfo)
	if len(productIDs) == 0 {
		return result, nil
	}

	rows, err := s.queries.ListMediaForProducts(ctx, productIDs)
	if err != nil {
		return nil, err
	}
	for _, r := range rows {
		result[r.ProductID] = append(result[r.ProductID], model.ProductMediaInfo{
			ID:        r.ID,
			Type:      string(r.Type),
			URL:       r.Url,
			SortOrder: r.SortOrder,
			AltText:   r.AltText,
			CreatedAt: r.CreatedAt,
		})
	}
	return result, nil
}

func (s *ProductService) checkShopAccess(ctx context.Context, shopID, userID pgtype.UUID, isGlobalAdmin bool) error {
	if isGlobalAdmin {
		return nil
	}
	isMember, err := s.queries.IsProductionMember(ctx, dbsqlc.IsProductionMemberParams{
		ProductionID: shopID,
		UserID:       userID,
	})
	if err != nil {
		return err
	}
	if !isMember {
		return ErrForbidden
	}
	return nil
}

func (s *ProductService) CreateProduct(ctx context.Context, userID, shopID string, isGlobalAdmin bool, req *model.CreateProductRequest) (*model.ProductWithRelations, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	sid, err := parseUUID(shopID)
	if err != nil {
		return nil, ErrProductionNotFound
	}

	if err := s.checkShopAccess(ctx, sid, uid, isGlobalAdmin); err != nil {
		return nil, err
	}

	categoryIDs, err := s.validateAndResolveCategoryIDs(ctx, sid, req.CategoryIDs)
	if err != nil {
		return nil, err
	}

	var fromPrice, toPrice pgtype.Numeric

	if req.FromPrice != nil {

		priceStr := fmt.Sprintf("%d", *req.FromPrice)
		if err := fromPrice.Scan(priceStr); err != nil {
			return nil, fmt.Errorf("error scanning fromPrice: %w", err)
		}
	}

	if req.ToPrice != nil {
		priceStr := fmt.Sprintf("%d", *req.ToPrice)
		if err := toPrice.Scan(priceStr); err != nil {
			return nil, fmt.Errorf("error scanning toPrice: %w", err)
		}
	}

	var productionTimeDays pgtype.Int4
	if req.ProductionTimeDays != nil {
		productionTimeDays = pgtype.Int4{Int32: *req.ProductionTimeDays, Valid: true}
	}

	product, err := s.queries.CreateProduct(ctx, dbsqlc.CreateProductParams{
		ShopID:             sid,
		Title:              req.Title,
		Slug:               req.Slug,
		Description:        req.Description,
		FromPrice:          fromPrice,
		ToPrice:            toPrice,
		IsPriceHidden:      req.IsPriceHidden,
		Material:           pgtype.Text{String: req.Material, Valid: req.Material != ""},
		Style:              pgtype.Text{String: req.Style, Valid: req.Style != ""},
		Dimensions:         pgtype.Text{String: req.Dimensions, Valid: req.Dimensions != ""},
		ProductionTimeDays: productionTimeDays,
		IsCustomizable:     req.IsCustomizable,
		Status:             dbsqlc.ProductStatusInactive,
	})
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrProductSlugTaken
		}
		return nil, err
	}

	if err := s.syncProductCategories(ctx, product.ID, categoryIDs); err != nil {
		return nil, err
	}

	categoryRows, err := s.queries.ListProductCategories(ctx, product.ID)
	if err != nil {
		return nil, err
	}

	return &model.ProductWithRelations{
		Product:    product,
		Categories: toProductCategoryInfo(categoryRows),
		Media:      []model.ProductMediaInfo{},
	}, nil
}

func (s *ProductService) GetProduct(ctx context.Context, productID string) (*model.ProductWithRelations, error) {
	pid, err := parseUUID(productID)
	if err != nil {
		return nil, ErrProductNotFound
	}

	product, err := s.queries.GetProductByID(ctx, pid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}

	categoryRows, err := s.queries.ListProductCategories(ctx, pid)
	if err != nil {
		return nil, err
	}

	mediaRows, err := s.queries.ListProductMedia(ctx, pid)
	if err != nil {
		return nil, err
	}

	return &model.ProductWithRelations{
		Product:    product,
		Categories: toProductCategoryInfo(categoryRows),
		Media:      toProductMediaInfo(mediaRows),
	}, nil
}

func (s *ProductService) GetProductBySlug(ctx context.Context, shopID, slug string) (*model.ProductWithRelations, error) {
	sid, err := parseUUID(shopID)
	if err != nil {
		return nil, ErrProductNotFound
	}

	product, err := s.queries.GetProductBySlug(ctx, dbsqlc.GetProductBySlugParams{
		ShopID: sid,
		Slug:   slug,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}
	if product.Status != dbsqlc.ProductStatusActive {
		return nil, ErrProductNotFound
	}

	categoryRows, err := s.queries.ListProductCategories(ctx, product.ID)
	if err != nil {
		return nil, err
	}

	mediaRows, err := s.queries.ListProductMedia(ctx, product.ID)
	if err != nil {
		return nil, err
	}

	_ = s.queries.IncrementProductViews(ctx, product.ID)

	return &model.ProductWithRelations{
		Product:    product,
		Categories: toProductCategoryInfo(categoryRows),
		Media:      toProductMediaInfo(mediaRows),
	}, nil
}

func (s *ProductService) UpdateProduct(ctx context.Context, userID, shopID, productID string, isGlobalAdmin bool, req *model.UpdateProductRequest) (*model.ProductWithRelations, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	sid, err := parseUUID(shopID)
	if err != nil {
		return nil, ErrProductionNotFound
	}
	pid, err := parseUUID(productID)
	if err != nil {
		return nil, ErrProductNotFound
	}

	if err := s.checkShopAccess(ctx, sid, uid, isGlobalAdmin); err != nil {
		return nil, err
	}

	var categoryIDs []pgtype.UUID
	if req.CategoryIDs != nil {
		categoryIDs, err = s.validateAndResolveCategoryIDs(ctx, sid, req.CategoryIDs)
		if err != nil {
			return nil, err
		}
	}

	var title, slug, description, material, style, dimensions pgtype.Text
	if req.Title != nil {
		title = pgtype.Text{String: *req.Title, Valid: true}
	}
	if req.Slug != nil {
		slug = pgtype.Text{String: *req.Slug, Valid: true}
	}
	if req.Description != nil {
		description = pgtype.Text{String: *req.Description, Valid: true}
	}
	if req.Material != nil {
		material = pgtype.Text{String: *req.Material, Valid: true}
	}
	if req.Style != nil {
		style = pgtype.Text{String: *req.Style, Valid: true}
	}
	if req.Dimensions != nil {
		dimensions = pgtype.Text{String: *req.Dimensions, Valid: true}
	}

	var fromPrice, toPrice pgtype.Numeric

	if req.FromPrice != nil {

		priceStr := fmt.Sprintf("%d", *req.FromPrice)
		if err := fromPrice.Scan(priceStr); err != nil {
			return nil, fmt.Errorf("error scanning fromPrice: %w", err)
		}
	}

	if req.ToPrice != nil {
		priceStr := fmt.Sprintf("%d", *req.ToPrice)
		if err := toPrice.Scan(priceStr); err != nil {
			return nil, fmt.Errorf("error scanning toPrice: %w", err)
		}
	}

	var isPriceHidden pgtype.Bool
	if req.IsPriceHidden != nil {
		isPriceHidden = pgtype.Bool{Bool: *req.IsPriceHidden, Valid: true}
	}
	var isCustomizable pgtype.Bool
	if req.IsCustomizable != nil {
		isCustomizable = pgtype.Bool{Bool: *req.IsCustomizable, Valid: true}
	}
	var productionTimeDays pgtype.Int4
	if req.ProductionTimeDays != nil {
		productionTimeDays = pgtype.Int4{Int32: *req.ProductionTimeDays, Valid: true}
	}

	product, err := s.queries.UpdateProduct(ctx, dbsqlc.UpdateProductParams{
		ID:                 pid,
		Title:              title,
		Slug:               slug,
		Description:        description,
		FromPrice:          fromPrice,
		ToPrice:            toPrice,
		IsPriceHidden:      isPriceHidden,
		Material:           material,
		Style:              style,
		Dimensions:         dimensions,
		ProductionTimeDays: productionTimeDays,
		IsCustomizable:     isCustomizable,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProductNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrProductSlugTaken
		}
		return nil, err
	}

	if req.CategoryIDs != nil {
		if err := s.syncProductCategories(ctx, pid, categoryIDs); err != nil {
			return nil, err
		}
	}

	categoryRows, err := s.queries.ListProductCategories(ctx, pid)
	if err != nil {
		return nil, err
	}
	mediaRows, err := s.queries.ListProductMedia(ctx, pid)
	if err != nil {
		return nil, err
	}

	return &model.ProductWithRelations{
		Product:    product,
		Categories: toProductCategoryInfo(categoryRows),
		Media:      toProductMediaInfo(mediaRows),
	}, nil
}

func (s *ProductService) DeleteProduct(ctx context.Context, userID, shopID, productID string, isGlobalAdmin bool) error {
	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}
	sid, err := parseUUID(shopID)
	if err != nil {
		return ErrProductionNotFound
	}
	pid, err := parseUUID(productID)
	if err != nil {
		return ErrProductNotFound
	}

	if err := s.checkShopAccess(ctx, sid, uid, isGlobalAdmin); err != nil {
		return err
	}

	return s.queries.SoftDeleteProduct(ctx, pid)
}

func (s *ProductService) ActivateProduct(ctx context.Context, userID, shopID, productID string, isGlobalAdmin bool) error {
	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}
	sid, err := parseUUID(shopID)
	if err != nil {
		return ErrProductionNotFound
	}
	pid, err := parseUUID(productID)
	if err != nil {
		return ErrProductNotFound
	}

	if err := s.checkShopAccess(ctx, sid, uid, isGlobalAdmin); err != nil {
		return err
	}

	rows, err := s.queries.ActivateProduct(ctx, pid)
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrProductNotFound
	}
	return nil
}

func (s *ProductService) DeactivateProduct(ctx context.Context, userID, shopID, productID string, isGlobalAdmin bool) error {
	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}
	sid, err := parseUUID(shopID)
	if err != nil {
		return ErrProductionNotFound
	}
	pid, err := parseUUID(productID)
	if err != nil {
		return ErrProductNotFound
	}

	if err := s.checkShopAccess(ctx, sid, uid, isGlobalAdmin); err != nil {
		return err
	}

	rows, err := s.queries.DeactivateProduct(ctx, pid)
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrProductNotFound
	}
	return nil
}

func (s *ProductService) ListShopProducts(ctx context.Context, userID, shopID string, isGlobalAdmin bool, params model.PaginationParams) ([]model.ProductListItemWithRelations, int64, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, 0, ErrUserNotFound
	}
	sid, err := parseUUID(shopID)
	if err != nil {
		return nil, 0, ErrProductionNotFound
	}

	if err := s.checkShopAccess(ctx, sid, uid, isGlobalAdmin); err != nil {
		return nil, 0, err
	}

	rows, err := s.queries.ListProductsByShop(ctx, dbsqlc.ListProductsByShopParams{
		ShopID: sid,
		Limit:  int32(params.Limit),
		Offset: int32(params.Offset),
		Status: pgtype.Text{Valid: false},
	})
	if err != nil {
		return nil, 0, err
	}
	if rows == nil {
		rows = []dbsqlc.ListProductsByShopRow{}
	}

	productIDs := make([]pgtype.UUID, 0, len(rows))
	for _, r := range rows {
		productIDs = append(productIDs, r.ID)
	}

	categoriesByProduct, err := s.fetchCategoriesForProducts(ctx, productIDs)
	if err != nil {
		return nil, 0, err
	}
	mediaByProduct, err := s.fetchMediaForProducts(ctx, productIDs)
	if err != nil {
		return nil, 0, err
	}

	result := make([]model.ProductListItemWithRelations, 0, len(rows))
	for _, r := range rows {
		cats := categoriesByProduct[r.ID]
		if cats == nil {
			cats = []model.ProductCategoryInfo{}
		}
		media := mediaByProduct[r.ID]
		if media == nil {
			media = []model.ProductMediaInfo{}
		}
		result = append(result, model.ProductListItemWithRelations{
			ListProductsByShopRow: r,
			Categories:            cats,
			Media:                 media,
		})
	}

	total, err := s.queries.CountProductsByShop(ctx, dbsqlc.CountProductsByShopParams{
		ShopID: sid,
		Status: pgtype.Text{Valid: false},
	})
	if err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

func (s *ProductService) ListActiveProductsByCategory(ctx context.Context, categoryID string, params model.PaginationParams) ([]model.ProductListItemWithRelations, int64, error) {
	cid, err := parseUUID(categoryID)
	if err != nil {
		return nil, 0, ErrCategoryNotFound
	}

	rows, err := s.queries.ListActiveProductsByCategory(ctx, dbsqlc.ListActiveProductsByCategoryParams{
		CategoryID: cid,
		Limit:      int32(params.Limit),
		Offset:     int32(params.Offset),
	})
	if err != nil {
		return nil, 0, err
	}
	if rows == nil {
		rows = []dbsqlc.ListActiveProductsByCategoryRow{}
	}

	productIDs := make([]pgtype.UUID, 0, len(rows))
	for _, r := range rows {
		productIDs = append(productIDs, r.ID)
	}

	categoriesByProduct, err := s.fetchCategoriesForProducts(ctx, productIDs)
	if err != nil {
		return nil, 0, err
	}
	mediaByProduct, err := s.fetchMediaForProducts(ctx, productIDs)
	if err != nil {
		return nil, 0, err
	}

	result := make([]model.ProductListItemWithRelations, 0, len(rows))
	for _, r := range rows {
		cats := categoriesByProduct[r.ID]
		if cats == nil {
			cats = []model.ProductCategoryInfo{}
		}
		media := mediaByProduct[r.ID]
		if media == nil {
			media = []model.ProductMediaInfo{}
		}
		result = append(result, model.ProductListItemWithRelations{
			ListProductsByShopRow: dbsqlc.ListProductsByShopRow(r),
			Categories:            cats,
			Media:                 media,
		})
	}

	total, err := s.queries.CountActiveProductsByCategory(ctx, cid)
	if err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

func (s *ProductService) ListActiveProductsPublic(ctx context.Context, params model.PaginationParams, search string) ([]model.ProductPublicListItemWithRelations, int64, error) {
	rows, err := s.queries.ListAllProducts(ctx, dbsqlc.ListAllProductsParams{
		Limit:   int32(params.Limit),
		Offset:  int32(params.Offset),
		Column3: search,
		Column4: "active",
	})
	if err != nil {
		return nil, 0, err
	}
	if rows == nil {
		rows = []dbsqlc.ListAllProductsRow{}
	}

	productIDs := make([]pgtype.UUID, 0, len(rows))
	for _, r := range rows {
		productIDs = append(productIDs, r.ID)
	}

	categoriesByProduct, err := s.fetchCategoriesForProducts(ctx, productIDs)
	if err != nil {
		return nil, 0, err
	}
	mediaByProduct, err := s.fetchMediaForProducts(ctx, productIDs)
	if err != nil {
		return nil, 0, err
	}

	result := make([]model.ProductPublicListItemWithRelations, 0, len(rows))
	for _, r := range rows {
		cats := categoriesByProduct[r.ID]
		if cats == nil {
			cats = []model.ProductCategoryInfo{}
		}
		media := mediaByProduct[r.ID]
		if media == nil {
			media = []model.ProductMediaInfo{}
		}
		result = append(result, model.ProductPublicListItemWithRelations{
			ListAllProductsRow: r,
			Categories:         cats,
			Media:              media,
		})
	}

	total, err := s.queries.CountAllProducts(ctx, dbsqlc.CountAllProductsParams{
		Column1: search,
		Column2: "active",
	})
	if err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

func (s *ProductService) ListAllProductsAdmin(ctx context.Context, isGlobalAdmin bool, params model.PaginationParams, search, status string) ([]model.ProductAdminListItemWithRelations, int64, error) {
	if !isGlobalAdmin {
		return nil, 0, ErrForbidden
	}

	rows, err := s.queries.ListAllProducts(ctx, dbsqlc.ListAllProductsParams{
		Limit:   int32(params.Limit),
		Offset:  int32(params.Offset),
		Column3: search,
		Column4: status,
	})
	if err != nil {
		return nil, 0, err
	}
	if rows == nil {
		rows = []dbsqlc.ListAllProductsRow{}
	}

	productIDs := make([]pgtype.UUID, 0, len(rows))
	for _, r := range rows {
		productIDs = append(productIDs, r.ID)
	}

	categoriesByProduct, err := s.fetchCategoriesForProducts(ctx, productIDs)
	if err != nil {
		return nil, 0, err
	}

	result := make([]model.ProductAdminListItemWithRelations, 0, len(rows))
	for _, r := range rows {
		cats := categoriesByProduct[r.ID]
		if cats == nil {
			cats = []model.ProductCategoryInfo{}
		}
		result = append(result, model.ProductAdminListItemWithRelations{
			ListAllProductsRow: r,
			Categories:         cats,
		})
	}

	total, err := s.queries.CountAllProducts(ctx, dbsqlc.CountAllProductsParams{
		Column1: search,
		Column2: status,
	})
	if err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

func (s *ProductService) AddProductMedia(ctx context.Context, userID, shopID, productID string, isGlobalAdmin bool, req *model.AddProductMediaRequest) (*model.ProductMediaInfo, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	sid, err := parseUUID(shopID)
	if err != nil {
		return nil, ErrProductionNotFound
	}
	pid, err := parseUUID(productID)
	if err != nil {
		return nil, ErrProductNotFound
	}

	if err := s.checkShopAccess(ctx, sid, uid, isGlobalAdmin); err != nil {
		return nil, err
	}

	if req.Type != "image" && req.Type != "video" && req.Type != "360" {
		return nil, ErrInvalidMediaType
	}

	media, err := s.queries.AddProductMedia(ctx, dbsqlc.AddProductMediaParams{
		ProductID: pid,
		Type:      dbsqlc.ProductMediaType(req.Type),
		Url:       req.URL,
		SortOrder: req.SortOrder,
		AltText:   pgtype.Text{String: req.AltText, Valid: req.AltText != ""},
	})
	if err != nil {
		return nil, err
	}

	return &model.ProductMediaInfo{
		ID:        media.ID,
		Type:      string(media.Type),
		URL:       media.Url,
		SortOrder: media.SortOrder,
		AltText:   media.AltText,
		CreatedAt: media.CreatedAt,
	}, nil
}

func (s *ProductService) DeleteProductMedia(ctx context.Context, userID, shopID, productID, mediaID string, isGlobalAdmin bool) error {
	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}
	sid, err := parseUUID(shopID)
	if err != nil {
		return ErrProductionNotFound
	}
	pid, err := parseUUID(productID)
	if err != nil {
		return ErrProductNotFound
	}
	mid, err := parseUUID(mediaID)
	if err != nil {
		return errors.New("invalid media id")
	}

	if err := s.checkShopAccess(ctx, sid, uid, isGlobalAdmin); err != nil {
		return err
	}

	return s.queries.DeleteProductMedia(ctx, dbsqlc.DeleteProductMediaParams{
		ID:        mid,
		ProductID: pid,
	})
}

func (s *ProductService) ListActiveProductsByShop(ctx context.Context, shopID string, params model.PaginationParams) ([]model.ProductListItemWithRelations, int64, error) {
	sid, err := parseUUID(shopID)
	if err != nil {
		return nil, 0, ErrProductionNotFound
	}

	rows, err := s.queries.ListActiveProductsByShop(ctx, dbsqlc.ListActiveProductsByShopParams{
		ShopID: sid,
		Limit:  int32(params.Limit),
		Offset: int32(params.Offset),
	})
	if err != nil {
		return nil, 0, err
	}
	if rows == nil {
		rows = []dbsqlc.ListActiveProductsByShopRow{}
	}

	productIDs := make([]pgtype.UUID, 0, len(rows))
	for _, r := range rows {
		productIDs = append(productIDs, r.ID)
	}

	categoriesByProduct, err := s.fetchCategoriesForProducts(ctx, productIDs)
	if err != nil {
		return nil, 0, err
	}
	mediaByProduct, err := s.fetchMediaForProducts(ctx, productIDs)
	if err != nil {
		return nil, 0, err
	}

	result := make([]model.ProductListItemWithRelations, 0, len(rows))
	for _, r := range rows {
		cats := categoriesByProduct[r.ID]
		if cats == nil {
			cats = []model.ProductCategoryInfo{}
		}
		media := mediaByProduct[r.ID]
		if media == nil {
			media = []model.ProductMediaInfo{}
		}
		result = append(result, model.ProductListItemWithRelations{
			ListProductsByShopRow: dbsqlc.ListProductsByShopRow(r),
			Categories:            cats,
			Media:                 media,
		})
	}

	total, err := s.queries.CountActiveProductsByShop(ctx, sid)
	if err != nil {
		return nil, 0, err
	}

	return result, total, nil
}

func (s *ProductService) CheckProductMediaAccess(ctx context.Context, userID, shopID, productID string, isGlobalAdmin bool) error {
	uid, err := parseUUID(userID)
	if err != nil {
		return ErrUserNotFound
	}
	sid, err := parseUUID(shopID)
	if err != nil {
		return ErrProductionNotFound
	}
	if _, err := parseUUID(productID); err != nil {
		return ErrProductNotFound
	}

	return s.checkShopAccess(ctx, sid, uid, isGlobalAdmin)
}
