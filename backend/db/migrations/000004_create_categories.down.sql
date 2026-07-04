DROP INDEX IF EXISTS idx_categories_deleted_at;
DROP INDEX IF EXISTS idx_categories_active;
DROP INDEX IF EXISTS idx_categories_parent_id;
DROP INDEX IF EXISTS uq_categories_slug;

DROP TABLE IF EXISTS categories;