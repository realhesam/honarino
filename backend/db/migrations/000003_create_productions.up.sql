CREATE TYPE production_member_role AS ENUM ('owner', 'admin', 'editor');

CREATE TABLE IF NOT EXISTS productions (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    
    shop_id             VARCHAR(50)  UNIQUE NOT NULL,
    
    shop_name           VARCHAR(80)  NOT NULL,
    shop_description    TEXT         NOT NULL,
    production_address  TEXT         NOT NULL,
    production_phone    VARCHAR(20)  NOT NULL,
    production_email    VARCHAR(255) NOT NULL,
    telegram            VARCHAR(255),
    rubika              VARCHAR(255),
    eitaa               VARCHAR(255),
    whatsapp            VARCHAR(20),
    website             VARCHAR(255),
    logo_url            VARCHAR(500),
    banner_url          VARCHAR(500),
    cover_url           VARCHAR(500),
    
    active              BOOLEAN      NOT NULL DEFAULT FALSE,
    
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT productions_shop_name_length
        CHECK (char_length(shop_name) >= 2),
    CONSTRAINT productions_shop_description_length
        CHECK (char_length(shop_description) >= 20),
    CONSTRAINT productions_production_email_format
        CHECK (production_email ~* '^[^@]+@[^@]+\.[^@]+$'),
    CONSTRAINT productions_production_phone_format
        CHECK (production_phone ~ '^\+?[0-9\s\-]{7,20}$')
);

CREATE TABLE IF NOT EXISTS production_members (
    id              UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
    production_id   UUID                   NOT NULL,
    user_id         UUID                   NOT NULL,
    role            production_member_role NOT NULL DEFAULT 'editor',
    created_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_production_members_production
        FOREIGN KEY (production_id)
        REFERENCES productions(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_production_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_production_members
        UNIQUE (production_id, user_id)
);

CREATE UNIQUE INDEX idx_production_one_owner
    ON production_members(production_id)
    WHERE role = 'owner';

CREATE INDEX idx_production_members_user_id
    ON production_members(user_id);

CREATE INDEX idx_production_members_production_id
    ON production_members(production_id);

CREATE INDEX idx_productions_deleted_at
    ON productions(deleted_at)
    WHERE deleted_at IS NOT NULL;

CREATE INDEX idx_productions_created_at
    ON productions(created_at DESC);

CREATE INDEX idx_productions_active 
    ON productions(active);