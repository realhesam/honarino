package service

import (
	"context"
	"errors"

	dbsqlc "backend/db/sqlc"
	"backend/internal/model"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type VendorService struct {
	queries *dbsqlc.Queries
}

func NewVendorService(queries *dbsqlc.Queries) *VendorService {
	return &VendorService{queries: queries}
}

func (s *VendorService) CreateRequest(ctx context.Context, userID string, req *model.CreateVendorRequestRequest) (*dbsqlc.VendorRequest, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	row, err := s.queries.CreateVendorRequest(ctx, dbsqlc.CreateVendorRequestParams{
		UserID:      uid,
		Fullname:    req.Fullname,
		Nid:         req.NID,
		Phone:       req.Phone,
		Email:       req.Email,
		Description: pgtype.Text{String: req.Description, Valid: req.Description != ""},
	})
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrVendorRequestAlreadyExists
		}
		return nil, err
	}

	return &row, nil
}

func (s *VendorService) GetRequestByUserID(ctx context.Context, userID string) (*dbsqlc.VendorRequest, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	row, err := s.queries.GetVendorRequestByUserID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrVendorRequestNotFound
		}
		return nil, err
	}

	return &row, nil
}

func (s *VendorService) UpdateRequest(ctx context.Context, userID string, req *model.UpdateVendorRequestRequest) (*dbsqlc.VendorRequest, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	current, err := s.queries.GetVendorRequestByUserID(ctx, uid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrVendorRequestNotFound
		}
		return nil, err
	}

	row, err := s.queries.UpdateVendorRequest(ctx, dbsqlc.UpdateVendorRequestParams{
		ID:          current.ID,
		Fullname:    pgtype.Text{String: req.Fullname, Valid: req.Fullname != ""},
		Phone:       pgtype.Text{String: req.Phone, Valid: req.Phone != ""},
		Email:       pgtype.Text{String: req.Email, Valid: req.Email != ""},
		Description: pgtype.Text{String: req.Description, Valid: req.Description != ""},
	})
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrConflict
		}
		return nil, err
	}

	return &row, nil
}

func (s *VendorService) ListRequests(ctx context.Context, params model.PaginationParams) ([]dbsqlc.VendorRequest, int64, error) {
	rows, err := s.queries.ListVendorRequests(ctx, dbsqlc.ListVendorRequestsParams{
		Limit:  int32(params.Limit),
		Offset: int32(params.Offset),
		Search: params.Search,
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := s.queries.CountVendorRequests(ctx, params.Search)
	if err != nil {
		return nil, 0, err
	}

	return rows, total, nil
}

func (s *VendorService) DeleteRequest(ctx context.Context, requestID string) error {
	rid, err := parseUUID(requestID)
	if err != nil {
		return ErrVendorRequestNotFound
	}

	if err := s.queries.SoftDeleteVendorRequest(ctx, rid); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrVendorRequestNotFound
		}
		return err
	}

	return nil
}

func (s *VendorService) ApproveRequest(ctx context.Context, requestID string) error {
	rid, err := parseUUID(requestID)
	if err != nil {
		return ErrVendorRequestNotFound
	}

	request, err := s.queries.GetVendorRequestByID(ctx, rid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrVendorRequestNotFound
		}
		return err
	}

	if err := s.queries.UpdateUserRole(ctx, dbsqlc.UpdateUserRoleParams{
		ID:   request.UserID,
		Role: dbsqlc.UserRoleVendor,
	}); err != nil {
		return err
	}

	return s.queries.SoftDeleteVendorRequest(ctx, rid)
}
