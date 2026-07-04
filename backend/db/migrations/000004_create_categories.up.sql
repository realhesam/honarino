CREATE TABLE IF NOT EXISTS categories (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    parent_id       UUID,

    name            VARCHAR(80)  NOT NULL,
    slug            VARCHAR(120) NOT NULL,
    description     TEXT,

    active          BOOLEAN      NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT categories_not_self_parent
        CHECK (id <> parent_id),

    CONSTRAINT categories_name_length
        CHECK (char_length(name) >= 2),

    CONSTRAINT categories_slug_format
        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX uq_categories_slug
    ON categories(slug)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_categories_parent_id
    ON categories(parent_id);

CREATE INDEX idx_categories_active
    ON categories(active)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_categories_deleted_at
    ON categories(deleted_at)
    WHERE deleted_at IS NOT NULL;