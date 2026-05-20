package com.axonactive.leave_management.leave_request.repository;

import com.axonactive.leave_management.leave_request.entity.LeaveRequest;
import com.axonactive.leave_management.leave_request.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findAllByEmployee_Id(Long employeeId);

    List<LeaveRequest> findAllByStatus(LeaveStatus status);

    List<LeaveRequest> findAllByEmployee_Manager_Id(Long managerId);

    List<LeaveRequest> findAllByEmployee_Manager_IdAndStatus(Long managerId, LeaveStatus status);
}
