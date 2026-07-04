package service

import (
	"context"
	"errors"

	dbsqlc "backend/db/sqlc"
	"backend/internal/model"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type CategoryService struct {
	queries *dbsqlc.Queries
}

func NewCategoryService(queries *dbsqlc.Queries) *CategoryService {
	return &CategoryService{queries: queries}
}

func (s *CategoryService) isChainActive(ctx context.Context, id pgtype.UUID) (bool, error) {
	ancestors, err := s.queries.GetCategoryAncestors(ctx, id)
	if err != nil {
		return false, err
	}
	if len(ancestors) == 0 {
		return false, nil
	}
	for _, a := range ancestors {
		if !a.Active {
			return false, nil
		}
	}
	return true, nil
}

func filterActiveDescendants(rows []dbsqlc.GetCategoryDescendantsRow, rootID pgtype.UUID) []dbsqlc.GetCategoryDescendantsRow {
	activeSet := map[pgtype.UUID]bool{rootID: true}
	result := make([]dbsqlc.GetCategoryDescendantsRow, 0, len(rows))

	for _, r := range rows {
		if activeSet[r.ParentID] && r.Active {
			result = append(result, r)
			activeSet[r.ID] = true
		}
	}
	return result
}

func (s *CategoryService) ListRootCategories(ctx context.Context) ([]dbsqlc.ListRootCategoriesRow, error) {
	rows, err := s.queries.ListRootCategories(ctx, true)
	if err != nil {
		return nil, err
	}
	if rows == nil {
		rows = []dbsqlc.ListRootCategoriesRow{}
	}
	return rows, nil
}

func (s *CategoryService) ListChildCategories(ctx context.Context, parentID string) ([]dbsqlc.ListChildCategoriesRow, error) {
	pid, err := parseUUID(parentID)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	chainActive, err := s.isChainActive(ctx, pid)
	if err != nil {
		return nil, err
	}
	if !chainActive {
		return []dbsqlc.ListChildCategoriesRow{}, nil
	}

	rows, err := s.queries.ListChildCategories(ctx, dbsqlc.ListChildCategoriesParams{
		ParentID: pid,
		Column2:  true,
	})
	if err != nil {
		return nil, err
	}
	if rows == nil {
		rows = []dbsqlc.ListChildCategoriesRow{}
	}
	return rows, nil
}

func (s *CategoryService) GetCategoryWithParent(ctx context.Context, categoryID string) (*model.Category, error) {
	cid, err := parseUUID(categoryID)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	row, err := s.queries.GetCategoryWithParent(ctx, cid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}

	if !row.Active {
		return nil, ErrCategoryNotFound
	}

	chainActive, err := s.isChainActive(ctx, cid)
	if err != nil {
		return nil, err
	}
	if !chainActive {
		return nil, ErrCategoryNotFound
	}

	category := &model.Category{
		ID:          row.ID,
		Name:        row.Name,
		Slug:        row.Slug,
		Description: row.Description,
		Active:      row.Active,
		CreatedAt:   row.CreatedAt,
		UpdatedAt:   row.UpdatedAt,
	}

	if row.ParentID.Valid {
		category.Parent = &model.Category{
			ID:          row.ParentID,
			Name:        row.ParentName.String,
			Slug:        row.ParentSlug.String,
			Description: row.ParentDescription,
		}
	}

	return category, nil
}

func (s *CategoryService) GetCategoryBySlug(ctx context.Context, slug string) (*dbsqlc.Category, error) {
	if slug == "" {
		return nil, ErrCategoryNotFound
	}

	category, err := s.queries.GetCategoryBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}

	if !category.Active {
		return nil, ErrCategoryNotFound
	}

	chainActive, err := s.isChainActive(ctx, category.ID)
	if err != nil {
		return nil, err
	}
	if !chainActive {
		return nil, ErrCategoryNotFound
	}

	return &category, nil
}

func (s *CategoryService) GetCategoryAncestors(ctx context.Context, categoryID string) ([]dbsqlc.GetCategoryAncestorsRow, error) {
	cid, err := parseUUID(categoryID)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	rows, err := s.queries.GetCategoryAncestors(ctx, cid)
	if err != nil {
		return nil, err
	}
	if rows == nil {
		rows = []dbsqlc.GetCategoryAncestorsRow{}
	}

	for _, r := range rows {
		if !r.Active {
			return nil, ErrCategoryNotFound
		}
	}

	return rows, nil
}

func (s *CategoryService) GetCategoryDescendants(ctx context.Context, categoryID string) ([]dbsqlc.GetCategoryDescendantsRow, error) {
	cid, err := parseUUID(categoryID)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	chainActive, err := s.isChainActive(ctx, cid)
	if err != nil {
		return nil, err
	}
	if !chainActive {
		return nil, ErrCategoryNotFound
	}

	rows, err := s.queries.GetCategoryDescendants(ctx, cid)
	if err != nil {
		return nil, err
	}
	if rows == nil {
		rows = []dbsqlc.GetCategoryDescendantsRow{}
	}

	return filterActiveDescendants(rows, cid), nil
}

func (s *CategoryService) ListAllActiveCategories(ctx context.Context) ([]dbsqlc.ListAllCategoriesRow, error) {
	rows, err := s.queries.ListAllCategories(ctx, dbsqlc.ListAllCategoriesParams{
		Limit:   1000,
		Offset:  0,
		Column3: "",
		Column4: "active",
	})
	if err != nil {
		return nil, err
	}
	if rows == nil {
		rows = []dbsqlc.ListAllCategoriesRow{}
	}
	return rows, nil
}

func (s *CategoryService) CreateCategory(ctx context.Context, req *model.CreateCategoryRequest) (*dbsqlc.Category, error) {
	var parentID pgtype.UUID
	if req.ParentID != nil {
		pid, err := parseUUID(req.ParentID.String())
		if err != nil {
			return nil, ErrParentNotFound
		}
		exists, err := s.queries.CategoryExists(ctx, pid)
		if err != nil {
			return nil, err
		}
		if !exists {
			return nil, ErrParentNotFound
		}
		parentID = pid
	}

	active := true
	if req.Active != nil {
		active = *req.Active
	}

	category, err := s.queries.CreateCategory(ctx, dbsqlc.CreateCategoryParams{
		ParentID:    parentID,
		Name:        req.Name,
		Slug:        req.Slug,
		Description: pgtype.Text{String: req.Description, Valid: req.Description != ""},
		Active:      active,
	})
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrSlugTaken
		}
		return nil, err
	}

	return &category, nil
}

func (s *CategoryService) ListAllCategoriesAdmin(ctx context.Context, params model.PaginationParams, search, status string) ([]dbsqlc.ListAllCategoriesRow, int64, error) {
	rows, err := s.queries.ListAllCategories(ctx, dbsqlc.ListAllCategoriesParams{
		Limit:   int32(params.Limit),
		Offset:  int32(params.Offset),
		Column3: search,
		Column4: status,
	})
	if err != nil {
		return nil, 0, err
	}
	if rows == nil {
		rows = []dbsqlc.ListAllCategoriesRow{}
	}

	total, err := s.queries.CountAllCategories(ctx, dbsqlc.CountAllCategoriesParams{
		Column1: search,
		Column2: status,
	})
	if err != nil {
		return nil, 0, err
	}

	return rows, total, nil
}

func (s *CategoryService) UpdateCategory(ctx context.Context, categoryID string, req *model.UpdateCategoryRequest) (*dbsqlc.Category, error) {
	cid, err := parseUUID(categoryID)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	var parentID pgtype.UUID
	if req.ParentID != nil {
		pid, err := parseUUID(req.ParentID.String())
		if err != nil {
			return nil, ErrParentNotFound
		}

		if pid == cid {
			return nil, ErrInvalidParentCircle
		}

		exists, err := s.queries.CategoryExists(ctx, pid)
		if err != nil {
			return nil, err
		}
		if !exists {
			return nil, ErrParentNotFound
		}

		descendants, err := s.queries.GetCategoryDescendants(ctx, cid)
		if err != nil {
			return nil, err
		}
		for _, d := range descendants {
			if d.ID == pid {
				return nil, ErrInvalidParentCircle
			}
		}

		parentID = pid
	}

	var name, slug, description pgtype.Text
	if req.Name != nil {
		name = pgtype.Text{String: *req.Name, Valid: true}
	}
	if req.Slug != nil {
		exists, err := s.queries.SlugExists(ctx, dbsqlc.SlugExistsParams{
			Slug:    *req.Slug,
			Column2: cid,
		})
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, ErrSlugTaken
		}
		slug = pgtype.Text{String: *req.Slug, Valid: true}
	}
	if req.Description != nil {
		description = pgtype.Text{String: *req.Description, Valid: true}
	}

	category, err := s.queries.UpdateCategory(ctx, dbsqlc.UpdateCategoryParams{
		ID:          cid,
		ParentID:    parentID,
		Name:        name,
		Slug:        slug,
		Description: description,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrCategoryNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrSlugTaken
		}
		return nil, err
	}

	return &category, nil
}

func (s *CategoryService) DeleteCategory(ctx context.Context, categoryID string) error {
	cid, err := parseUUID(categoryID)
	if err != nil {
		return ErrCategoryNotFound
	}

	exists, err := s.queries.CategoryExists(ctx, cid)
	if err != nil {
		return err
	}
	if !exists {
		return ErrCategoryNotFound
	}

	hasChildren, err := s.queries.HasChildren(ctx, cid)
	if err != nil {
		return err
	}
	if hasChildren {
		return ErrCategoryHasChildren
	}

	return s.queries.SoftDeleteCategory(ctx, cid)
}

func (s *CategoryService) ActivateCategory(ctx context.Context, categoryID string) error {
	cid, err := parseUUID(categoryID)
	if err != nil {
		return ErrCategoryNotFound
	}

	rows, err := s.queries.ActivateCategory(ctx, cid)
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrCategoryNotFound
	}
	return nil
}

func (s *CategoryService) DeactivateCategory(ctx context.Context, categoryID string) error {
	cid, err := parseUUID(categoryID)
	if err != nil {
		return ErrCategoryNotFound
	}

	rows, err := s.queries.DeactivateCategory(ctx, cid)
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrCategoryNotFound
	}
	return nil
}
