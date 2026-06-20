ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
