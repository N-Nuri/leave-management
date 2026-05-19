-- V2: Create leave_balances table
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    year INT NOT NULL,
    total_days DECIMAL(4,1) DEFAULT 12.0,
    used_days DECIMAL(4,1) DEFAULT 0.0,
    carried_over_days DECIMAL(4,1) DEFAULT 0.0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, year),
    CONSTRAINT chk_used_days CHECK (used_days >= 0)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year 
ON leave_balances(user_id, year);