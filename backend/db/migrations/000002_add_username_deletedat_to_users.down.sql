DROP INDEX IF EXISTS idx_users_deleted_at;
DROP INDEX IF EXISTS idx_users_username;

ALTER TABLE users DROP COLUMN username;
ALTER TABLE users DROP COLUMN deleted_at;
