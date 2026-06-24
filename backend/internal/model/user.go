package model

import "time"

type UserResponse struct {
	ID                string     `json:"id"`
	Name              string     `json:"name"`
	Username          string     `json:"username"`
	Email             string     `json:"email"`
	Phone             *string    `json:"phone,omitempty"`
	Address           *string    `json:"address,omitempty"`
	ProfilePictureURL *string    `json:"profile_picture_url,omitempty"`
	Role              *string    `json:"role,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         *time.Time `json:"updated_at,omitempty"`
	DeletedAt         *time.Time `json:"deleted_at,omitempty"`
}

// request structs

type RegisterRequest struct {
	Name     string `json:"name"     validate:"required,min=2,max=100" example:"علی رضایی"`
	Username string `json:"username" validate:"required,min=3,max=50"  example:"alirezarezaei"`
	Email    string `json:"email"    validate:"required,email"          example:"ali@example.com"`
	Password string `json:"password" validate:"required,min=8"          example:"12345678"`
}

type LoginRequest struct {
	Username string `json:"username" validate:"required" example:"alirezarezaei"`
	Password string `json:"password" validate:"required"       example:"12345678"`
}

type UpdateProfileRequest struct {
	Name              string `json:"name,omitempty"                example:"علی رضایی جدید"`
	Phone             string `json:"phone,omitempty"               example:"+989123456789"`
	Address           string `json:"address,omitempty"             example:"تهران، خیابان مولوی"`
	ProfilePictureURL string `json:"profile_picture_url,omitempty" example:"https://example.com/pic.jpg"`
}

// response structs

type AuthResponse struct {
	Token string       `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	User  UserResponse `json:"user"`
}

type ErrorResponse struct {
	Error string `json:"error" example:"invalid username or password"`
}
