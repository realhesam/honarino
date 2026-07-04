package model

type CreateVendorRequestRequest struct {
	Fullname    string `json:"fullname"`
	NID         string `json:"nid"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	Description string `json:"description"`
}

type UpdateVendorRequestRequest struct {
	Fullname    string `json:"fullname"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	Description string `json:"description"`
}

type PaginationParams struct {
	Limit  int    `query:"limit"`
	Offset int    `query:"offset"`
	Search string `query:"search"`
	Status string `query:"status"`
}
