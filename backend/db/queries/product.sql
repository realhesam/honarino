-- name: CreateProduct :one
INSERT INTO products (
    shop_id,
    title,
    slug,
    description,
    from_price,
    to_price,
    is_price_hidden,
    material,
    style,
    dimensions,
    production_time_days,
    is_customizable,
    status
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
RETURNING id, shop_id, title, slug, description,
          from_price, to_price, is_price_hidden,
          material, style, dimensions,
          production_time_days, is_customizable,
          status, views_count,
          created_at, updated_at, deleted_at;

-- name: GetProductByID :one
SELECT id, shop_id, title, slug, description,
       from_price, to_price, is_price_hidden,
       material, style, dimensions,
       production_time_days, is_customizable,
       status, views_count,
       created_at, updated_at, deleted_at
FROM products
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetProductBySlug :one
SELECT id, shop_id, title, slug, description,
       from_price, to_price, is_price_hidden,
       material, style, dimensions,
       production_time_days, is_customizable,
       status, views_count,
       created_at, updated_at, deleted_at
FROM products
WHERE shop_id = $1 AND slug = $2 AND deleted_at IS NULL;

-- name: UpdateProduct :one
UPDATE products SET
    title                 = coalesce(sqlc.narg(title),                 title),
    slug                  = coalesce(sqlc.narg(slug),                  slug),
    description           = coalesce(sqlc.narg(description),           description),
    from_price            = coalesce(sqlc.narg(from_price),            from_price),
    to_price              = coalesce(sqlc.narg(to_price),              to_price),
    is_price_hidden       = coalesce(sqlc.narg(is_price_hidden),       is_price_hidden),
    material              = coalesce(sqlc.narg(material),              material),
    style                 = coalesce(sqlc.narg(style),                 style),
    dimensions            = coalesce(sqlc.narg(dimensions),            dimensions),
    production_time_days  = coalesce(sqlc.narg(production_time_days),  production_time_days),
    is_customizable       = coalesce(sqlc.narg(is_customizable),       is_customizable),
    updated_at            = NOW()
WHERE id = sqlc.arg(id) AND deleted_at IS NULL
RETURNING id, shop_id, title, slug, description,
          from_price, to_price, is_price_hidden,
          material, style, dimensions,
          production_time_days, is_customizable,
          status, views_count,
          created_at, updated_at, deleted_at;

-- name: SoftDeleteProduct :exec
UPDATE products SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: ActivateProduct :execrows
UPDATE products
SET status = 'active', updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: DeactivateProduct :execrows
UPDATE products
SET status = 'inactive', updated_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: IncrementProductViews :exec
UPDATE products
SET views_count = views_count + 1
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListProductsByShop :many
SELECT id, shop_id, title, slug, description,
       from_price, to_price, is_price_hidden,
       material, style, dimensions,
       production_time_days, is_customizable,
       status, views_count,
       created_at, updated_at
FROM products
WHERE shop_id = $1
  AND deleted_at IS NULL
  AND (
    sqlc.narg(status)::text IS NULL
    OR status = sqlc.narg(status)::product_status
  )
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountProductsByShop :one
SELECT COUNT(*)
FROM products
WHERE shop_id = $1
  AND deleted_at IS NULL
  AND (
    sqlc.narg(status)::text IS NULL
    OR status = sqlc.narg(status)::product_status
  );

-- name: ListActiveProductsByCategory :many
SELECT DISTINCT p.id, p.shop_id, p.title, p.slug, p.description,
       p.from_price, p.to_price, p.is_price_hidden,
       p.material, p.style, p.dimensions,
       p.production_time_days, p.is_customizable,
       p.status, p.views_count,
       p.created_at, p.updated_at
FROM products p
INNER JOIN product_categories pc ON pc.product_id = p.id
WHERE pc.category_id = $1
  AND p.status = 'active'
  AND p.deleted_at IS NULL
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountActiveProductsByCategory :one
SELECT COUNT(DISTINCT p.id)
FROM products p
INNER JOIN product_categories pc ON pc.product_id = p.id
WHERE pc.category_id = $1
  AND p.status = 'active'
  AND p.deleted_at IS NULL;

-- name: ListActiveProductsByShop :many
SELECT id, shop_id, title, slug, description,
       from_price, to_price, is_price_hidden,
       material, style, dimensions,
       production_time_days, is_customizable,
       status, views_count,
       created_at, updated_at
FROM products
WHERE shop_id = $1
  AND status = 'active'
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountActiveProductsByShop :one
SELECT COUNT(*)
FROM products
WHERE shop_id = $1
  AND status = 'active'
  AND deleted_at IS NULL;

-- name: ListAllProducts :many
SELECT p.id, p.shop_id, p.title, p.slug, p.description,
       p.from_price, p.to_price, p.is_price_hidden,
       p.material, p.style, p.dimensions,
       p.production_time_days, p.is_customizable,
       p.status, p.views_count,
       p.created_at, p.updated_at,
       s.shop_name
FROM products p
INNER JOIN productions s ON s.id = p.shop_id
WHERE p.deleted_at IS NULL
  AND ($3::text = '' OR p.title ILIKE '%' || $3 || '%' OR s.shop_name ILIKE '%' || $3 || '%')
  AND (
    $4::text = 'all' OR $4 = ''
    OR ($4 = 'active' AND p.status = 'active')
    OR ($4 = 'inactive' AND p.status = 'inactive')
  )
ORDER BY p.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountAllProducts :one
SELECT COUNT(*)
FROM products p
INNER JOIN productions s ON s.id = p.shop_id
WHERE p.deleted_at IS NULL
  AND ($1::text = '' OR p.title ILIKE '%' || $1 || '%' OR s.shop_name ILIKE '%' || $1 || '%')
  AND (
    $2::text = 'all' OR $2 = ''
    OR ($2 = 'active' AND p.status = 'active')
    OR ($2 = 'inactive' AND p.status = 'inactive')
  );

-- name: ProductExists :one
SELECT EXISTS (
    SELECT 1 FROM products
    WHERE id = $1 AND deleted_at IS NULL
) AS exists;

-- name: SlugExistsForShop :one
SELECT EXISTS (
    SELECT 1 FROM products
    WHERE shop_id = $1 AND slug = $2 AND deleted_at IS NULL
      AND ($3::uuid IS NULL OR id != $3)
) AS exists;

-- name: AddProductCategory :exec
INSERT INTO product_categories (product_id, category_id)
VALUES ($1, $2)
ON CONFLICT (product_id, category_id) DO NOTHING;

-- name: ClearProductCategories :exec
DELETE FROM product_categories
WHERE product_id = $1;

-- name: ListProductCategories :many
SELECT c.id, c.name, c.slug, c.parent_id
FROM product_categories pc
INNER JOIN categories c ON c.id = pc.category_id
WHERE pc.product_id = $1 AND c.deleted_at IS NULL
ORDER BY c.name ASC;

-- name: ListCategoriesForProducts :many
SELECT pc.product_id, c.id, c.name, c.slug, c.parent_id
FROM product_categories pc
INNER JOIN categories c ON c.id = pc.category_id
WHERE pc.product_id = ANY(sqlc.arg(product_ids)::uuid[])
  AND c.deleted_at IS NULL
ORDER BY c.name ASC;

-- name: AddProductMedia :one
INSERT INTO product_media (
    product_id,
    type,
    url,
    sort_order,
    alt_text
)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, product_id, type, url, sort_order, alt_text, created_at;

-- name: ListProductMedia :many
SELECT id, product_id, type, url, sort_order, alt_text, created_at
FROM product_media
WHERE product_id = $1
ORDER BY sort_order ASC;

-- name: ListMediaForProducts :many
SELECT id, product_id, type, url, sort_order, alt_text, created_at
FROM product_media
WHERE product_id = ANY(sqlc.arg(product_ids)::uuid[])
ORDER BY product_id, sort_order ASC;

-- name: DeleteProductMedia :exec
DELETE FROM product_media
WHERE id = $1 AND product_id = $2;

-- name: DeleteAllProductMedia :exec
DELETE FROM product_media
WHERE product_id = $1;

-- name: UpdateProductMediaSortOrder :exec
UPDATE product_media
SET sort_order = $2
WHERE id = $1;

-- name: CountProductMedia :one
SELECT COUNT(*)
FROM product_media
WHERE product_id = $1;