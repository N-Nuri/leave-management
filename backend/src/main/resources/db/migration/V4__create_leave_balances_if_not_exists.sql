CREATE TABLE IF NOT EXISTS leave_balances (
    id                BIGSERIAL    PRIMARY KEY,
    user_id           BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year              INT          NOT NULL,
    total_days        DECIMAL(4,1) NOT NULL DEFAULT 12.0,
    used_days         DECIMAL(4,1) NOT NULL DEFAULT 0.0,
    carried_over_days DECIMAL(4,1) NOT NULL DEFAULT 0.0,
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, year)
);

CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year ON leave_balances(user_id, year);
