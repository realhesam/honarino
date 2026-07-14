CREATE TYPE product_status AS ENUM ('active', 'inactive');
CREATE TYPE product_media_type AS ENUM ('image', 'video', '360');

CREATE TABLE IF NOT EXISTS products (
    id                    UUID              PRIMARY KEY DEFAULT gen_random_uuid(),

    shop_id               UUID              NOT NULL,

    title                 VARCHAR(150)      NOT NULL,
    slug                  VARCHAR(180)      NOT NULL,
    description           TEXT              NOT NULL,

    from_price            NUMERIC(14, 0),
    to_price              NUMERIC(14, 0),
    is_price_hidden       BOOLEAN           NOT NULL DEFAULT FALSE,

    material              VARCHAR(120),
    style                 VARCHAR(120),
    dimensions            VARCHAR(120),

    production_time_days  INTEGER,
    is_customizable       BOOLEAN           NOT NULL DEFAULT FALSE,

    status                product_status    NOT NULL DEFAULT 'inactive',
    views_count           INTEGER           NOT NULL DEFAULT 0,

    created_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    deleted_at            TIMESTAMPTZ,

    CONSTRAINT fk_products_shop
        FOREIGN KEY (shop_id)
        REFERENCES productions(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT products_title_length
        CHECK (char_length(title) >= 2),

    CONSTRAINT products_slug_format
        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

    CONSTRAINT products_description_length
        CHECK (char_length(description) >= 10),

    CONSTRAINT products_price_range
        CHECK (
            from_price IS NULL
            OR to_price IS NULL
            OR from_price <= to_price
        ),

    CONSTRAINT products_price_required_unless_hidden
        CHECK (
            is_price_hidden = TRUE
            OR (from_price IS NOT NULL AND to_price IS NOT NULL)
        ),

    CONSTRAINT products_price_non_negative
        CHECK (
            (from_price IS NULL OR from_price >= 0)
            AND (to_price IS NULL OR to_price >= 0)
        ),

    CONSTRAINT products_production_time_non_negative
        CHECK (production_time_days IS NULL OR production_time_days >= 0),

    CONSTRAINT products_views_count_non_negative
        CHECK (views_count >= 0)
);

CREATE UNIQUE INDEX uq_products_shop_slug
    ON products(shop_id, slug)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_products_shop_id
    ON products(shop_id);

CREATE INDEX idx_products_status
    ON products(status)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_products_deleted_at
    ON products(deleted_at)
    WHERE deleted_at IS NOT NULL;

CREATE INDEX idx_products_created_at
    ON products(created_at DESC);


CREATE TABLE IF NOT EXISTS product_categories (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id     UUID        NOT NULL,
    category_id    UUID        NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_categories_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_product_categories_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_product_categories UNIQUE (product_id, category_id)
);

CREATE INDEX idx_product_categories_product_id
    ON product_categories(product_id);

CREATE INDEX idx_product_categories_category_id
    ON product_categories(category_id);


CREATE TABLE IF NOT EXISTS product_media (
    id            UUID                PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id    UUID                NOT NULL,

    type          product_media_type  NOT NULL,
    url           VARCHAR(500)        NOT NULL,
    sort_order    INTEGER             NOT NULL DEFAULT 0,
    alt_text      VARCHAR(255),

    created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_media_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT product_media_sort_order_non_negative
        CHECK (sort_order >= 0)
);

CREATE INDEX idx_product_media_product_id
    ON product_media(product_id);

CREATE INDEX idx_product_media_product_sort
    ON product_media(product_id, sort_order);