CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('user', 'vendor', 'admin');

CREATE TABLE IF NOT EXISTS users (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100)        NOT NULL,
    username            VARCHAR(50) UNIQUE  NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    password            TEXT                NOT NULL,
    phone               VARCHAR(20)         UNIQUE,
    address             TEXT,
    profile_picture_url TEXT,
    role                user_role           NOT NULL DEFAULT 'user',
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT users_username_length CHECK (char_length(username) >= 3),
    CONSTRAINT users_email_format    CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

CREATE UNIQUE INDEX idx_users_email_active    ON users(email)    WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_username_active ON users(username) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_phone_active    ON users(phone)    WHERE deleted_at IS NULL AND phone IS NOT NULL;

CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX idx_users_created_at ON users(created_at DESC);