-- name: CreateUser :one
INSERT INTO users (name, username, email, password)
VALUES ($1, $2, $3, $4)
RETURNING id, name, username, email, phone, address, profile_picture_url, role, created_at, updated_at, deleted_at;

-- name: GetUserByID :one
SELECT id, name, username, email, phone, address, profile_picture_url, role, created_at, updated_at, deleted_at
FROM users
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetUserByEmail :one
SELECT id, name, username, email, password, phone, address, profile_picture_url, role, created_at, updated_at, deleted_at
FROM users
WHERE email = $1 AND deleted_at IS NULL;

-- name: GetUserByUsername :one
SELECT id, name, username, email, password, phone, address, profile_picture_url, role, created_at, updated_at, deleted_at
FROM users
WHERE username = $1 AND deleted_at IS NULL;

-- name: UpdateUser :one
UPDATE users SET
    name                = coalesce(sqlc.narg(name),                name),
    phone               = coalesce(sqlc.narg(phone),               phone),
    address             = coalesce(sqlc.narg(address),             address),
    profile_picture_url = coalesce(sqlc.narg(profile_picture_url), profile_picture_url),
    updated_at          = NOW()
WHERE id = sqlc.arg(id) AND deleted_at IS NULL
RETURNING id, name, username, email, phone, address, profile_picture_url, role, created_at, updated_at, deleted_at;

-- name: UpdateUserRole :exec
UPDATE users SET
    role       = $2,
    updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetPasswordByID :one
SELECT password FROM users
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdatePassword :exec
UPDATE users SET
    password   = $2,
    updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: SoftDeleteUser :exec
UPDATE users SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListUsers :many
SELECT id, name, username, email, phone, address, profile_picture_url, role, created_at, updated_at, deleted_at
FROM users
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListUsersByRole :many
SELECT id, name, username, email, phone, address, profile_picture_url, role, created_at, updated_at, deleted_at
FROM users
WHERE role = $1 AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;