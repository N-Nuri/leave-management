CREATE TABLE IF NOT EXISTS leave_requests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES users(id),
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    days_count  DOUBLE PRECISION NOT NULL,
    leave_type  VARCHAR(50) NOT NULL,
    reason      TEXT,
    status      VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES users(id),
    review_note TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
