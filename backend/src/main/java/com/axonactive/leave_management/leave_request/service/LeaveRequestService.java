package com.axonactive.leave_management.leave_request.service;

import com.axonactive.leave_management.leave_request.dto.LeaveRequestDTO;
import com.axonactive.leave_management.leave_request.dto.LeaveRequestResponse;

import java.util.List;

public interface LeaveRequestService {

    LeaveRequestResponse submit(LeaveRequestDTO dto, Long employeeId);

    List<LeaveRequestResponse> getMyRequests(Long employeeId);

    LeaveRequestResponse getById(Long id);

    LeaveRequestResponse cancel(Long requestId, Long employeeId);

    List<LeaveRequestResponse> getTeamRequests(Long managerId);

    List<LeaveRequestResponse> getPendingByManager(Long managerId);

    LeaveRequestResponse approve(Long requestId, Long managerId);

    LeaveRequestResponse reject(Long requestId, Long managerId, String note);
}
