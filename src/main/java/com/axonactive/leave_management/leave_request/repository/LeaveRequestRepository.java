package com.axonactive.leave_management.leave_request.repository;

import com.axonactive.leave_management.leave_request.entity.LeaveRequest;
import com.axonactive.leave_management.leave_request.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    List<LeaveRequest> findAllByEmployee_Id(UUID employeeId);

    List<LeaveRequest> findAllByStatus(LeaveStatus status);

    List<LeaveRequest> findAllByEmployee_Manager_Id(UUID managerId);
}
