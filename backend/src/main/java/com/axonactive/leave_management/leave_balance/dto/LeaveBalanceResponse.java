package com.axonactive.leave_management.leave_balance.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaveBalanceResponse {
    private Long userId;
    private String fullName;
    private Integer year;
    private Double totalDays;
    private Double usedDays;
    private Double carriedOverDays;
    private Double remainingDays;
}
