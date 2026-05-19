CREATE TYPE IF NOT EXISTS leave_type_enum AS ENUM ('ANNUAL', 'SICK', 'UNPAID', 'OTHER');
CREATE TYPE IF NOT EXISTS request_status  AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS leave_requests (
    id          BIGSERIAL    PRIMARY KEY,
    employee_id BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date  DATE         NOT NULL,
    end_date    DATE         NOT NULL,
    days_count  NUMERIC(4,1) NOT NULL,
    leave_type  leave_type_enum NOT NULL,
    reason      TEXT,
    status      request_status  NOT NULL DEFAULT 'PENDING',
    reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    review_note TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
