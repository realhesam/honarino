package model

import (
	dbsqlc "backend/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type ProductCategoryInfo struct {
	ID       pgtype.UUID `json:"id"`
	Name     string      `json:"name"`
	Slug     string      `json:"slug"`
	ParentID pgtype.UUID `json:"parent_id"`
}

type ProductMediaInfo struct {
	ID        pgtype.UUID        `json:"id"`
	Type      string             `json:"type"`
	URL       string             `json:"url"`
	SortOrder int32              `json:"sort_order"`
	AltText   pgtype.Text        `json:"alt_text"`
	CreatedAt pgtype.Timestamptz `json:"created_at"`
}

type ProductWithRelations struct {
	dbsqlc.Product
	Categories []ProductCategoryInfo `json:"categories"`
	Media      []ProductMediaInfo    `json:"media"`
}

type ProductListItemWithRelations struct {
	dbsqlc.ListProductsByShopRow
	Categories []ProductCategoryInfo `json:"categories"`
	Media      []ProductMediaInfo    `json:"media"`
}

type ProductAdminListItemWithRelations struct {
	dbsqlc.ListAllProductsRow
	Categories []ProductCategoryInfo `json:"categories"`
}

type ProductPublicListItemWithRelations struct {
	dbsqlc.ListAllProductsRow
	Categories []ProductCategoryInfo `json:"categories"`
	Media      []ProductMediaInfo    `json:"media"`
}

type CreateProductRequest struct {
	Title              string   `json:"title"`
	Slug               string   `json:"slug"`
	Description        string   `json:"description"`
	FromPrice          *int64   `json:"from_price"`
	ToPrice            *int64   `json:"to_price"`
	IsPriceHidden      bool     `json:"is_price_hidden"`
	Material           string   `json:"material"`
	Style              string   `json:"style"`
	Dimensions         string   `json:"dimensions"`
	ProductionTimeDays *int32   `json:"production_time_days"`
	IsCustomizable     bool     `json:"is_customizable"`
	CategoryIDs        []string `json:"category_ids"`
}

type UpdateProductRequest struct {
	Title              *string  `json:"title"`
	Slug               *string  `json:"slug"`
	Description        *string  `json:"description"`
	FromPrice          *int64   `json:"from_price"`
	ToPrice            *int64   `json:"to_price"`
	IsPriceHidden      *bool    `json:"is_price_hidden"`
	Material           *string  `json:"material"`
	Style              *string  `json:"style"`
	Dimensions         *string  `json:"dimensions"`
	ProductionTimeDays *int32   `json:"production_time_days"`
	IsCustomizable     *bool    `json:"is_customizable"`
	CategoryIDs        []string `json:"category_ids"`
}

type AddProductMediaRequest struct {
	Type      string `json:"type"`
	URL       string `json:"url"`
	SortOrder int32  `json:"sort_order"`
	AltText   string `json:"alt_text"`
}
