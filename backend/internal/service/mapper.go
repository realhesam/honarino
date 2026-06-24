package service

import (
	dbsqlc "backend/db/sqlc"
	"backend/internal/model"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func toModel(row interface{}) *model.UserResponse {
	switch r := row.(type) {
	case dbsqlc.CreateUserRow:
		return userFromFields(r.ID, r.Name, r.Username, r.Email, r.Phone, r.Address, r.ProfilePictureUrl, r.Role, r.CreatedAt, r.UpdatedAt, r.DeletedAt)
	case dbsqlc.GetUserByIDRow:
		return userFromFields(r.ID, r.Name, r.Username, r.Email, r.Phone, r.Address, r.ProfilePictureUrl, r.Role, r.CreatedAt, r.UpdatedAt, r.DeletedAt)
	case dbsqlc.UpdateUserRow:
		return userFromFields(r.ID, r.Name, r.Username, r.Email, r.Phone, r.Address, r.ProfilePictureUrl, r.Role, r.CreatedAt, r.UpdatedAt, r.DeletedAt)
	case dbsqlc.User:
		return userFromFields(r.ID, r.Name, r.Username, r.Email, r.Phone, r.Address, r.ProfilePictureUrl, r.Role, r.CreatedAt, r.UpdatedAt, r.DeletedAt)
	}
	return nil
}

func userFromFields(
	id pgtype.UUID,
	name, username, email string,
	phone, address, profilePic pgtype.Text,
	role dbsqlc.UserRole,
	createdAt, updatedAt, deletedAt pgtype.Timestamptz,
) *model.UserResponse {
	roleStr := string(role)
	return &model.UserResponse{
		ID:                id.String(),
		Name:              name,
		Username:          username,
		Email:             email,
		Phone:             nullToPtr(phone),
		Address:           nullToPtr(address),
		ProfilePictureURL: nullToPtr(profilePic),
		Role:              &roleStr,
		CreatedAt:         createdAt.Time,
		UpdatedAt:         nullTimeToPtr(updatedAt),
		DeletedAt:         nullTimeToPtr(deletedAt),
	}
}

func nullToPtr(s pgtype.Text) *string {
	if !s.Valid {
		return nil
	}
	return &s.String
}

func nullTimeToPtr(t pgtype.Timestamptz) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}
