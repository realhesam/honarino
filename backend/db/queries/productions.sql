-- name: CreateProduction :one
INSERT INTO productions (
    shop_id,
    shop_name,
    shop_description,
    production_address,
    production_phone,
    production_email,
    telegram,
    rubika,
    eitaa,
    whatsapp,
    website,
    active
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING id, shop_id, shop_name, shop_description,
          production_address, production_phone, production_email,
          telegram, rubika, eitaa, whatsapp, website,
          logo_url, banner_url, cover_url,
          active,
          created_at, updated_at, deleted_at;

-- name: GetProductionByID :one
SELECT id, shop_id, shop_name, shop_description,
       production_address, production_phone, production_email,
       telegram, rubika, eitaa, whatsapp, website,
       logo_url, banner_url, cover_url,
       active,
       created_at, updated_at, deleted_at
FROM productions
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateProduction :one
UPDATE productions SET
    shop_id            = coalesce(sqlc.narg(shop_id),            shop_id),
    shop_name          = coalesce(sqlc.narg(shop_name),          shop_name),
    shop_description   = coalesce(sqlc.narg(shop_description),   shop_description),
    production_address = coalesce(sqlc.narg(production_address), production_address),
    production_phone   = coalesce(sqlc.narg(production_phone),   production_phone),
    production_email   = coalesce(sqlc.narg(production_email),   production_email),
    telegram           = coalesce(sqlc.narg(telegram),           telegram),
    rubika             = coalesce(sqlc.narg(rubika),             rubika),
    eitaa              = coalesce(sqlc.narg(eitaa),              eitaa),
    whatsapp           = coalesce(sqlc.narg(whatsapp),           whatsapp),
    website            = coalesce(sqlc.narg(website),            website),
    updated_at         = NOW()
WHERE id = sqlc.arg(id) AND deleted_at IS NULL
RETURNING id, shop_id, shop_name, shop_description,
          production_address, production_phone, production_email,
          telegram, rubika, eitaa, whatsapp, website,
          logo_url, banner_url, cover_url,
          created_at, updated_at, deleted_at;

-- name: UpdateProductionMediaURL :one
UPDATE productions SET
    logo_url   = CASE WHEN sqlc.narg(logo_url)::text   IS NOT NULL THEN sqlc.narg(logo_url)   ELSE logo_url   END,
    banner_url = CASE WHEN sqlc.narg(banner_url)::text IS NOT NULL THEN sqlc.narg(banner_url) ELSE banner_url END,
    cover_url  = CASE WHEN sqlc.narg(cover_url)::text  IS NOT NULL THEN sqlc.narg(cover_url)  ELSE cover_url  END,
    updated_at = NOW()
WHERE id = sqlc.arg(id) AND deleted_at IS NULL
RETURNING id, shop_id, logo_url, banner_url, cover_url, active, updated_at;

-- name: SoftDeleteProduction :exec
UPDATE productions SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListProductionsByUserID :many
SELECT p.id,
       p.shop_id,
       p.shop_name,
       p.shop_description,
       p.production_address,
       p.production_phone,
       p.production_email,
       p.telegram,
       p.rubika,
       p.eitaa,
       p.whatsapp,
       p.website,
       p.logo_url,
       p.banner_url,
       p.cover_url,
       p.active,
       p.created_at,
       p.updated_at,
       pm.role AS member_role
FROM productions p
INNER JOIN production_members pm ON pm.production_id = p.id
WHERE pm.user_id = $1
  AND p.deleted_at IS NULL
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountProductionsByUserID :one
SELECT COUNT(*)
FROM productions p
INNER JOIN production_members pm ON pm.production_id = p.id
WHERE pm.user_id = $1 AND p.deleted_at IS NULL;

-- name: AddProductionMember :one
INSERT INTO production_members (production_id, user_id, role)
VALUES ($1, $2, $3)
RETURNING id, production_id, user_id, role, created_at, updated_at;

-- name: GetProductionMember :one
SELECT id, production_id, user_id, role, created_at, updated_at
FROM production_members
WHERE production_id = $1 AND user_id = $2;

-- name: ListProductionMembers :many
SELECT pm.id, pm.production_id, pm.user_id, pm.role, pm.created_at, pm.updated_at,
       u.name, u.username, u.email, u.phone, u.profile_picture_url
FROM production_members pm
INNER JOIN users u ON u.id = pm.user_id
WHERE pm.production_id = $1
ORDER BY pm.created_at ASC
LIMIT $2 OFFSET $3;

-- name: CountProductionMembers :one
SELECT COUNT(*)
FROM production_members
WHERE production_id = $1;

-- name: SearchUsersForMembership :many
SELECT u.id, u.name, u.username, u.email, u.phone, u.profile_picture_url, u.role
FROM users u
WHERE u.deleted_at IS NULL
  AND u.id <> ALL (SELECT pm.user_id FROM production_members pm WHERE pm.production_id = $1)
  AND (
    lower(u.name) LIKE '%' || lower($2) || '%'
    OR lower(u.username) LIKE '%' || lower($2) || '%'
    OR replace(u.phone, ' ', '') LIKE '%' || replace($2, ' ', '') || '%'
    OR lower(u.email) LIKE '%' || lower($2) || '%'
  )
ORDER BY u.created_at DESC
LIMIT $3;

-- name: GetProductionOwner :one
SELECT pm.id, pm.user_id, pm.role, pm.created_at, pm.updated_at,
       u.name, u.username, u.email
FROM production_members pm
INNER JOIN users u ON u.id = pm.user_id
WHERE pm.production_id = $1 AND pm.role = 'owner';

-- name: UpdateProductionMemberRole :exec
UPDATE production_members SET
    role       = $3,
    updated_at = NOW()
WHERE production_id = $1 AND user_id = $2;

-- name: RemoveProductionMember :exec
DELETE FROM production_members
WHERE production_id = $1 AND user_id = $2 AND role != 'owner';

-- name: IsProductionMember :one
SELECT EXISTS (
    SELECT 1 FROM production_members
    WHERE production_id = $1 AND user_id = $2
) AS is_member;

-- name: HasProductionRole :one
SELECT EXISTS (
    SELECT 1 FROM production_members
    WHERE production_id = $1 AND user_id = $2 AND role = $3
) AS has_role;

-- name: ActivateProduction :execrows
UPDATE productions
SET active = TRUE, updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: DeactivateProduction :execrows
UPDATE productions
SET active = FALSE, updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetProductionWithActiveStatus :one
SELECT id, shop_id, shop_name, active
FROM productions
WHERE id = $1 AND deleted_at IS NULL;

-- name: IsProductionActive :one
SELECT active
FROM productions
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListAllProductions :many
SELECT p.id,
       p.shop_id,
       p.shop_name,
       p.shop_description,
       p.production_address,
       p.production_phone,
       p.production_email,
       p.telegram,
       p.rubika,
       p.eitaa,
       p.whatsapp,
       p.website,
       p.logo_url,
       p.banner_url,
       p.cover_url,
       p.active,
       p.created_at,
       p.updated_at,
       u.id   AS owner_id,
       u.name AS owner_name,
       u.username AS owner_username,
       u.email AS owner_email
FROM productions p
INNER JOIN production_members pm
    ON pm.production_id = p.id AND pm.role = 'owner'
INNER JOIN users u
    ON u.id = pm.user_id
WHERE p.deleted_at IS NULL
  AND ($3::text = '' OR p.shop_name ILIKE '%' || $3 || '%' OR u.name ILIKE '%' || $3 || '%' OR p.production_phone ILIKE '%' || $3 || '%')
  AND (
    $4::text = 'all' OR $4 = ''
    OR ($4 = 'active' AND p.active = TRUE)
    OR ($4 = 'inactive' AND p.active = FALSE)
  )
ORDER BY p.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountAllProductions :one
SELECT COUNT(*)
FROM productions p
INNER JOIN production_members pm
    ON pm.production_id = p.id AND pm.role = 'owner'
INNER JOIN users u
    ON u.id = pm.user_id
WHERE p.deleted_at IS NULL
  AND ($1::text = '' OR p.shop_name ILIKE '%' || $1 || '%' OR u.name ILIKE '%' || $1 || '%' OR p.production_phone ILIKE '%' || $1 || '%')
  AND (
    $2::text = 'all' OR $2 = ''
    OR ($2 = 'active' AND p.active = TRUE)
    OR ($2 = 'inactive' AND p.active = FALSE)
  );

-- name: GetMembersCount :one
SELECT
    COUNT(*) FILTER (WHERE role = 'editor') AS "EditorTotal",
    COUNT(*) FILTER (WHERE role = 'admin') AS "AdminTotal"
FROM production_members
WHERE production_id = $1;

-- name: GetProductionBySlug :one
SELECT id, shop_id, shop_name, shop_description,
       production_address, production_phone, production_email,
       telegram, rubika, eitaa, whatsapp, website,
       logo_url, banner_url, cover_url,
       active,
       created_at, updated_at, deleted_at
FROM productions
WHERE shop_id = $1 AND deleted_at IS NULL;