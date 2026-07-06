CREATE TABLE IF NOT EXISTS production_categories (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    production_id  UUID        NOT NULL,
    category_id    UUID        NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_production_categories_production
        FOREIGN KEY (production_id)
        REFERENCES productions(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_production_categories_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_production_categories UNIQUE (production_id, category_id)
);

CREATE INDEX idx_production_categories_production_id
    ON production_categories(production_id);

CREATE INDEX idx_production_categories_category_id
    ON production_categories(category_id);