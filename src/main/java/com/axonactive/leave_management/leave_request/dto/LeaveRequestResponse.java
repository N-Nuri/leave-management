package com.axonactive.leave_management.leave_request.dto;

import com.axonactive.leave_management.leave_request.entity.LeaveStatus;
import com.axonactive.leave_management.leave_request.entity.LeaveType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class LeaveRequestResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double daysCount;
    private LeaveType leaveType;
    private String reason;
    private LeaveStatus status;
    private UUID reviewedById;
    private String reviewNote;
    private LocalDateTime createdAt;
}
