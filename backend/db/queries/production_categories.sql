-- name: AddProductionCategory :exec
INSERT INTO production_categories (production_id, category_id)
VALUES ($1, $2)
ON CONFLICT (production_id, category_id) DO NOTHING;

-- name: ClearProductionCategories :exec
DELETE FROM production_categories
WHERE production_id = $1;

-- name: ListProductionCategories :many
SELECT c.id, c.name, c.slug, c.parent_id
FROM production_categories pc
INNER JOIN categories c ON c.id = pc.category_id
WHERE pc.production_id = $1 AND c.deleted_at IS NULL
ORDER BY c.name ASC;

-- name: ListActiveProductionsByCategory :many
SELECT p.id, p.shop_id, p.shop_name, p.shop_description,
       p.production_address, p.production_phone, p.production_email,
       p.telegram, p.rubika, p.eitaa, p.whatsapp, p.website,
       p.logo_url, p.banner_url, p.cover_url,
       p.active, p.created_at, p.updated_at
FROM production_categories pc
INNER JOIN productions p ON p.id = pc.production_id
WHERE pc.category_id = $1
  AND p.active = TRUE
  AND p.deleted_at IS NULL
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountActiveProductionsByCategory :one
SELECT COUNT(*)
FROM production_categories pc
INNER JOIN productions p ON p.id = pc.production_id
WHERE pc.category_id = $1
  AND p.active = TRUE
  AND p.deleted_at IS NULL;

-- name: ListCategoriesForProductions :many
SELECT pc.production_id, c.id, c.name, c.slug, c.parent_id
FROM production_categories pc
INNER JOIN categories c ON c.id = pc.category_id
WHERE pc.production_id = ANY(sqlc.arg(production_ids)::uuid[])
  AND c.deleted_at IS NULL
ORDER BY c.name ASC;