-- name: CreateVendorRequest :one
INSERT INTO vendor_requests (user_id, fullname, nid, phone, email, description)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, user_id, fullname, nid, phone, email, description, created_at, updated_at, deleted_at;

-- name: GetVendorRequestByID :one
SELECT id, user_id, fullname, nid, phone, email, description, created_at, updated_at, deleted_at
FROM vendor_requests
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetVendorRequestByUserID :one
SELECT id, user_id, fullname, nid, phone, email, description, created_at, updated_at, deleted_at
FROM vendor_requests
WHERE user_id = $1 AND deleted_at IS NULL;

-- name: GetVendorRequestByNID :one
SELECT id, user_id, fullname, nid, phone, email, description, created_at, updated_at, deleted_at
FROM vendor_requests
WHERE nid = $1 AND deleted_at IS NULL;

-- name: UpdateVendorRequest :one
UPDATE vendor_requests SET
    fullname    = coalesce(sqlc.narg(fullname),    fullname),
    phone       = coalesce(sqlc.narg(phone),       phone),
    email       = coalesce(sqlc.narg(email),       email),
    description = coalesce(sqlc.narg(description), description),
    updated_at  = NOW()
WHERE id = sqlc.arg(id) AND deleted_at IS NULL
RETURNING id, user_id, fullname, nid, phone, email, description, created_at, updated_at, deleted_at;

-- name: ListVendorRequests :many
SELECT id, user_id, fullname, nid, phone, email, description, created_at, updated_at, deleted_at
FROM vendor_requests
WHERE deleted_at IS NULL
  AND (
    NULLIF(TRIM(sqlc.arg(search)::text), '') IS NULL
    OR fullname ILIKE '%' || TRIM(sqlc.arg(search)::text) || '%'
    OR nid LIKE '%' || TRIM(sqlc.arg(search)::text) || '%'
    OR phone LIKE '%' || TRIM(sqlc.arg(search)::text) || '%'
  )
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountVendorRequests :one
SELECT COUNT(*) FROM vendor_requests
WHERE deleted_at IS NULL
  AND (
    NULLIF(TRIM(sqlc.arg(search)::text), '') IS NULL
    OR fullname ILIKE '%' || TRIM(sqlc.arg(search)::text) || '%'
    OR nid LIKE '%' || TRIM(sqlc.arg(search)::text) || '%'
    OR phone LIKE '%' || TRIM(sqlc.arg(search)::text) || '%'
  );

-- name: SoftDeleteVendorRequest :exec
UPDATE vendor_requests SET
    deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;