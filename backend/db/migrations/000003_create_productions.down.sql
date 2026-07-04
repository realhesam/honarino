DROP INDEX IF EXISTS idx_productions_created_at;
DROP INDEX IF EXISTS idx_productions_deleted_at;
DROP INDEX IF EXISTS idx_production_members_production_id;
DROP INDEX IF EXISTS idx_production_members_user_id;
DROP INDEX IF EXISTS idx_production_one_owner;
DROP INDEX IF EXISTS idx_productions_active;

DROP TABLE IF EXISTS production_members;
DROP TABLE IF EXISTS productions;

DROP TYPE IF EXISTS production_member_role;