DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_users_deleted_at;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_phone_active;
DROP INDEX IF EXISTS idx_users_username_active;
DROP INDEX IF EXISTS idx_users_email_active;

DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS user_role;

DROP EXTENSION IF EXISTS "pgcrypto";