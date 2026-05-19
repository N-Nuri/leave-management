package com.axonactive.leave_management.leave_request.dto;

import com.axonactive.leave_management.leave_request.entity.LeaveStatus;
import com.axonactive.leave_management.leave_request.entity.LeaveType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class LeaveRequestResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double daysCount;
    private LeaveType leaveType;
    private String reason;
    private LeaveStatus status;
    private Long reviewedById;
    private String reviewNote;
    private LocalDateTime createdAt;
}
