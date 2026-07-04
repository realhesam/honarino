package model

type CreateProductionRequest struct {
	ShopID            string   `json:"shop_id"            validate:"required,min=3,max=50"`
	ShopName          string   `json:"shop_name"          validate:"required,min=2,max=80"`
	ShopDescription   string   `json:"shop_description"   validate:"required,min=20"`
	Categories        []string `json:"categories"         validate:"required"`
	ProductionAddress string   `json:"production_address" validate:"required"`
	ProductionPhone   string   `json:"production_phone"   validate:"required"`
	ProductionEmail   string   `json:"production_email"   validate:"required,email"`
	Telegram          string   `json:"telegram"`
	Rubika            string   `json:"rubika"`
	Eitaa             string   `json:"eitaa"`
	Whatsapp          string   `json:"whatsapp"`
	Website           string   `json:"website"`
}

type UpdateProductionRequest struct {
	ShopID            string   `json:"shop_id"            validate:"omitempty,min=3,max=50"`
	ShopName          string   `json:"shop_name"          validate:"omitempty,min=2,max=80"`
	ShopDescription   string   `json:"shop_description"   validate:"omitempty,min=20"`
	Categories        []string `json:"categories"`
	ProductionAddress string   `json:"production_address"`
	ProductionPhone   string   `json:"production_phone"`
	ProductionEmail   string   `json:"production_email"   validate:"omitempty,email"`
	Telegram          string   `json:"telegram"`
	Rubika            string   `json:"rubika"`
	Eitaa             string   `json:"eitaa"`
	Whatsapp          string   `json:"whatsapp"`
	Website           string   `json:"website"`
}

type AddMemberRequest struct {
	UserID string `json:"user_id" validate:"required,uuid"`
	Role   string `json:"role"    validate:"required,oneof=admin editor"`
}

type UpdateMemberRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=admin editor"`
}

type ProductionMediaUploadURLRequest struct {
	Type        string `json:"type"        validate:"required,oneof=logo banner cover"`
	ContentType string `json:"contentType" validate:"required"`
}

type ProductionMediaConfirmRequest struct {
	Type        string `json:"type"        validate:"required,oneof=logo banner cover"`
	ContentType string `json:"contentType" validate:"required"`
}

type MembersCountResponse struct {
	Total       int `json:"total"`
	EditorTotal int `json:"editorTotal"`
	AdminTotal  int `json:"adminTotal"`
}
