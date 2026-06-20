package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"backend/internal/model"
)

type UserRow struct {
	ID        string
	Name      string
	Username  string
	Email     string
	Password  string
	Phone     *string
	Address   *string
	ProfilePictureURL *string
	CreatedAt time.Time
	DeletedAt *time.Time
}

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, name, username, email, hashedPassword string) (*model.User, error) {
	var u model.User
	err := r.db.QueryRow(ctx,
		`INSERT INTO users (name, username, email, password)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, name, username, email, phone, address, profile_picture_url, created_at`,
		name, username, email, hashedPassword,
	).Scan(&u.ID, &u.Name, &u.Username, &u.Email, &u.Phone, &u.Address, &u.ProfilePictureURL, &u.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}
	return &u, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*UserRow, error) {
	var u UserRow
	err := r.db.QueryRow(ctx,
		`SELECT id, name, username, email, password, phone, address, profile_picture_url, created_at
		 FROM users WHERE email = $1`,
		email,
	).Scan(&u.ID, &u.Name, &u.Username, &u.Email, &u.Password, &u.Phone, &u.Address, &u.ProfilePictureURL, &u.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("get user by email: %w", err)
	}
	return &u, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	var u model.User
	err := r.db.QueryRow(ctx,
		`SELECT id, name, username, email, phone, address, profile_picture_url, created_at
		 FROM users WHERE id = $1`,
		id,
	).Scan(&u.ID, &u.Name, &u.Username, &u.Email, &u.Phone, &u.Address, &u.ProfilePictureURL, &u.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}
	return &u, nil
}

func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*UserRow, error) {
	var u UserRow
	err := r.db.QueryRow(ctx,
		`SELECT id, name, username, email, password, phone, address, profile_picture_url, created_at, deleted_at
		 FROM users WHERE username = $1`,
		username,
	).Scan(&u.ID, &u.Name, &u.Username, &u.Email, &u.Password, &u.Phone, &u.Address, &u.ProfilePictureURL, &u.CreatedAt, &u.DeletedAt)

	if err != nil {
		return nil, fmt.Errorf("get user by username: %w", err)
	}
	return &u, nil
}

func (r *UserRepository) Update(ctx context.Context, userID string, updates map[string]interface{}) (*model.User, error) {
	cols := []string{"name", "phone", "address", "profile_picture_url"}

	setParts := []string{}
	args := []interface{}{}
	argIndex := 1

	for _, col := range cols {
		if val, ok := updates[col]; ok {
			setParts = append(setParts, fmt.Sprintf("%s = $%d", col, argIndex))
			args = append(args, val)
			argIndex++
		}
	}

	if len(setParts) == 0 {
		return nil, fmt.Errorf("no valid fields to update")
	}

	query := fmt.Sprintf(`UPDATE users SET %s WHERE id = $%d RETURNING id, name, username, email, phone, address, profile_picture_url, created_at`,
		join(setParts, ", "), argIndex)
	args = append(args, userID)

	var u model.User
	err := r.db.QueryRow(ctx, query, args...).Scan(
		&u.ID, &u.Name, &u.Username, &u.Email, &u.Phone, &u.Address, &u.ProfilePictureURL, &u.CreatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("update user: %w", err)
	}
	return &u, nil
}

func (r *UserRepository) GetPasswordByID(ctx context.Context, userID string) (string, error) {
	var password string
	err := r.db.QueryRow(ctx,
		`SELECT password FROM users WHERE id = $1`,
		userID,
	).Scan(&password)
	if err != nil {
		return "", fmt.Errorf("get password by id: %w", err)
	}
	return password, nil
}

func (r *UserRepository) UpdatePassword(ctx context.Context, userID, hashedPassword string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET password = $1 WHERE id = $2`,
		hashedPassword, userID,
	)
	if err != nil {
		return fmt.Errorf("update password: %w", err)
	}
	return nil
}

func join(parts []string, sep string) string {
	if len(parts) == 0 {
		return ""
	}
	s := parts[0]
	for i := 1; i < len(parts); i++ {
		s += sep + parts[i]
	}
	return s
}
