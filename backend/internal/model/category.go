package model

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type CreateCategoryRequest struct {
	ParentID    *uuid.UUID `json:"parent_id"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	Description string     `json:"description"`
	Active      *bool      `json:"active"`
}

type UpdateCategoryRequest struct {
	ParentID    *uuid.UUID `json:"parent_id"`
	Name        *string    `json:"name"`
	Slug        *string    `json:"slug"`
	Description *string    `json:"description"`
}

type Category struct {
	ID          pgtype.UUID        `json:"id"`
	Name        string             `json:"name"`
	Slug        string             `json:"slug"`
	Description pgtype.Text        `json:"description"`
	Active      bool               `json:"active"`
	CreatedAt   pgtype.Timestamptz `json:"created_at"`
	UpdatedAt   pgtype.Timestamptz `json:"updated_at"`
	Parent      *Category          `json:"parent,omitempty"`
}
