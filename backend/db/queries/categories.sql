-- name: CreateCategory :one
INSERT INTO categories (
    parent_id,
    name,
    slug,
    description,
    active
)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, parent_id, name, slug, description, active,
          created_at, updated_at, deleted_at;

-- name: GetCategoryByID :one
SELECT id, parent_id, name, slug, description, active,
       created_at, updated_at, deleted_at
FROM categories
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetCategoryBySlug :one
SELECT id, parent_id, name, slug, description, active,
       created_at, updated_at, deleted_at
FROM categories
WHERE slug = $1 AND deleted_at IS NULL;

-- name: GetCategoryWithParent :one
SELECT
    c.id            AS id,
    c.name          AS name,
    c.slug          AS slug,
    c.description   AS description,
    c.active        AS active,
    c.created_at    AS created_at,
    c.updated_at    AS updated_at,

    pc.id           AS parent_id,
    pc.name         AS parent_name,
    pc.slug         AS parent_slug,
    pc.description  AS parent_description
FROM categories c
LEFT JOIN categories pc ON pc.id = c.parent_id AND pc.deleted_at IS NULL
WHERE c.id = $1 AND c.deleted_at IS NULL;

-- name: UpdateCategory :one
UPDATE categories SET
    parent_id   = coalesce(sqlc.narg(parent_id),   parent_id),
    name        = coalesce(sqlc.narg(name),        name),
    slug        = coalesce(sqlc.narg(slug),        slug),
    description = coalesce(sqlc.narg(description), description),
    updated_at  = NOW()
WHERE id = sqlc.arg(id) AND deleted_at IS NULL
RETURNING id, parent_id, name, slug, description, active,
          created_at, updated_at, deleted_at;

-- name: SoftDeleteCategory :exec
UPDATE categories SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: SoftDeleteCategoryWithChildren :exec
UPDATE categories SET deleted_at = NOW()
WHERE deleted_at IS NULL
  AND (id = $1 OR parent_id = $1);

-- name: ActivateCategory :execrows
UPDATE categories
SET active = TRUE, updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: DeactivateCategory :execrows
UPDATE categories
SET active = FALSE, updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListRootCategories :many
SELECT id, parent_id, name, slug, description, active,
       created_at, updated_at
FROM categories
WHERE parent_id IS NULL
  AND deleted_at IS NULL
  AND ($1::boolean IS NULL OR active = $1)
ORDER BY name ASC;

-- name: ListChildCategories :many
SELECT id, parent_id, name, slug, description, active,
       created_at, updated_at
FROM categories
WHERE parent_id = $1
  AND deleted_at IS NULL
  AND ($2::boolean IS NULL OR active = $2)
ORDER BY name ASC;

-- name: ListAllCategories :many
SELECT
    c.id, c.parent_id, c.name, c.slug, c.description, c.active,
    c.created_at, c.updated_at,
    pc.name AS parent_name
FROM categories c
LEFT JOIN categories pc ON pc.id = c.parent_id AND pc.deleted_at IS NULL
WHERE c.deleted_at IS NULL
  AND ($3::text = '' OR c.name ILIKE '%' || $3 || '%' OR c.slug ILIKE '%' || $3 || '%')
  AND (
    $4::text = 'all' OR $4 = ''
    OR ($4 = 'active' AND c.active = TRUE)
    OR ($4 = 'inactive' AND c.active = FALSE)
  )
ORDER BY c.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountAllCategories :one
SELECT COUNT(*)
FROM categories c
WHERE c.deleted_at IS NULL
  AND ($1::text = '' OR c.name ILIKE '%' || $1 || '%' OR c.slug ILIKE '%' || $1 || '%')
  AND (
    $2::text = 'all' OR $2 = ''
    OR ($2 = 'active' AND c.active = TRUE)
    OR ($2 = 'inactive' AND c.active = FALSE)
  );
  
-- name: GetCategoryAncestors :many
WITH RECURSIVE ancestors AS (
    SELECT
        c.id,
        c.parent_id,
        c.name,
        c.slug,
        c.description,
        c.active,
        0 AS depth
    FROM categories c
    WHERE c.id = $1 AND c.deleted_at IS NULL

    UNION ALL

    SELECT
        c.id,
        c.parent_id,
        c.name,
        c.slug,
        c.description,
        c.active,
        a.depth + 1
    FROM categories c
    INNER JOIN ancestors a ON c.id = a.parent_id
    WHERE c.deleted_at IS NULL
)
SELECT
    a.id,
    a.parent_id,
    a.name,
    a.slug,
    a.description,
    a.active,
    a.depth
FROM ancestors a
ORDER BY a.depth DESC;

-- name: GetCategoryDescendants :many
WITH RECURSIVE descendants AS (
    SELECT
        c.id,
        c.parent_id,
        c.name,
        c.slug,
        c.description,
        c.active,
        0 AS depth
    FROM categories c
    WHERE c.id = $1 AND c.deleted_at IS NULL

    UNION ALL

    SELECT
        c.id,
        c.parent_id,
        c.name,
        c.slug,
        c.description,
        c.active,
        d.depth + 1
    FROM categories c
    INNER JOIN descendants d ON c.parent_id = d.id
    WHERE c.deleted_at IS NULL
)
SELECT
    d.id,
    d.parent_id,
    d.name,
    d.slug,
    d.description,
    d.active,
    d.depth
FROM descendants d
WHERE d.depth > 0
ORDER BY d.depth ASC;

-- name: CategoryExists :one
SELECT EXISTS (
    SELECT 1 FROM categories
    WHERE id = $1 AND deleted_at IS NULL
) AS exists;

-- name: SlugExists :one
SELECT EXISTS (
    SELECT 1 FROM categories
    WHERE slug = $1 AND deleted_at IS NULL
      AND ($2::uuid IS NULL OR id != $2)
) AS exists;

-- name: HasChildren :one
SELECT EXISTS (
    SELECT 1 FROM categories
    WHERE parent_id = $1 AND deleted_at IS NULL
) AS has_children;

-- name: CountChildCategories :one
SELECT COUNT(*)
FROM categories
WHERE parent_id = $1 AND deleted_at IS NULL;

-- name: GetRootCategoryByName :one
SELECT id, parent_id, name, slug, description, active,
       created_at, updated_at, deleted_at
FROM categories
WHERE parent_id IS NULL
  AND deleted_at IS NULL
  AND lower(name) = lower($1)
LIMIT 1;

-- name: GetCategoriesByIDs :many
SELECT id, parent_id, name, slug, description, active
FROM categories
WHERE id = ANY(sqlc.arg(ids)::uuid[])
  AND deleted_at IS NULL;