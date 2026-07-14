DROP INDEX IF EXISTS idx_product_media_product_sort;
DROP INDEX IF EXISTS idx_product_media_product_id;
DROP TABLE IF EXISTS product_media;

DROP INDEX IF EXISTS idx_product_categories_category_id;
DROP INDEX IF EXISTS idx_product_categories_product_id;
DROP TABLE IF EXISTS product_categories;

DROP INDEX IF EXISTS idx_products_created_at;
DROP INDEX IF EXISTS idx_products_deleted_at;
DROP INDEX IF EXISTS idx_products_status;
DROP INDEX IF EXISTS idx_products_shop_id;
DROP INDEX IF EXISTS uq_products_shop_slug;
DROP TABLE IF EXISTS products;

DROP TYPE IF EXISTS product_media_type;
DROP TYPE IF EXISTS product_status;