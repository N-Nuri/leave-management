package com.axonactive.leave_management.leave_balance.service;

import com.axonactive.leave_management.leave_balance.dto.LeaveBalanceResponse;

import java.util.List;

public interface LeaveBalanceService {
    LeaveBalanceResponse getMyBalance(Long userId);
    List<LeaveBalanceResponse> getTeamBalances(Long managerId);
    void updateUsedDays(Long userId, double days, boolean add);
    void runYearEndAccumulation();
}
