package com.axonactive.leave_management.leave_request.service;

import com.axonactive.leave_management.leave_request.dto.LeaveRequestDTO;
import com.axonactive.leave_management.leave_request.dto.LeaveRequestResponse;

import java.util.List;
import java.util.UUID;

public interface LeaveRequestService {

    LeaveRequestResponse submit(LeaveRequestDTO dto, UUID employeeId);

    List<LeaveRequestResponse> getMyRequests(UUID employeeId);

    LeaveRequestResponse getById(UUID id);

    LeaveRequestResponse cancel(UUID requestId, UUID employeeId);
}
