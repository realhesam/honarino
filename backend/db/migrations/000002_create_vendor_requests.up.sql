CREATE TABLE IF NOT EXISTS vendor_requests (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL,
    fullname    VARCHAR(100) NOT NULL,
    nid         CHAR(10)     NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    email       VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,

    CONSTRAINT fk_vendor_requests_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT vendor_requests_nid_ir
        CHECK (nid ~ '^\d{10}$'),

    CONSTRAINT vendor_requests_phone_format
        CHECK (phone ~ '^\+?[0-9\s\-]{7,20}$'),

    CONSTRAINT vendor_requests_email_format
        CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

CREATE UNIQUE INDEX idx_vendor_requests_nid_active
    ON vendor_requests(nid)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_vendor_requests_phone_active
    ON vendor_requests(phone)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_vendor_requests_email_active
    ON vendor_requests(email)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_requests_user_id
    ON vendor_requests(user_id);

CREATE INDEX idx_vendor_requests_deleted_at
    ON vendor_requests(deleted_at)
    WHERE deleted_at IS NOT NULL;

CREATE INDEX idx_vendor_requests_created_at
    ON vendor_requests(created_at DESC);