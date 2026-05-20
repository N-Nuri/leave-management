-- V3: Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count DECIMAL(4,1) NOT NULL,
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('ANNUAL','SICK','UNPAID','OTHER')),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
    reviewed_by UUID REFERENCES users(id),
    review_note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    CONSTRAINT chk_dates CHECK (end_date >= start_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee 
ON leave_requests(employee_id);

CREATE INDEX IF NOT EXISTS idx_leave_requests_status 
ON leave_requests(status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_dates 
ON leave_requests(start_date, end_date);