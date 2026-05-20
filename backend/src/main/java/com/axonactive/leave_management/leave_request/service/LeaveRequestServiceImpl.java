package com.axonactive.leave_management.leave_request.service;

import com.axonactive.leave_management.common.exception.AccessDeniedException;
import com.axonactive.leave_management.common.exception.InvalidLeaveRequestException;
import com.axonactive.leave_management.common.exception.ResourceNotFoundException;
import com.axonactive.leave_management.leave_balance.service.LeaveBalanceService;
import com.axonactive.leave_management.leave_request.dto.LeaveRequestDTO;
import com.axonactive.leave_management.leave_request.dto.LeaveRequestResponse;
import com.axonactive.leave_management.leave_request.entity.LeaveRequest;
import com.axonactive.leave_management.leave_request.entity.LeaveStatus;
import com.axonactive.leave_management.leave_request.repository.LeaveRequestRepository;
import com.axonactive.leave_management.user.entity.User;
import com.axonactive.leave_management.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final LeaveBalanceService leaveBalanceService;

    @Override
    @Transactional
    public LeaveRequestResponse submit(LeaveRequestDTO dto, Long employeeId) {
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new InvalidLeaveRequestException("Start date must not be after end date");
        }

        double workingDays = calculateWorkingDays(dto.getStartDate(), dto.getEndDate());
        if (workingDays == 0) {
            throw new InvalidLeaveRequestException("Leave request must include at least one working day");
        }

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        LeaveRequest request = LeaveRequest.builder()
                .employee(employee)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .daysCount(workingDays)
                .leaveType(dto.getLeaveType())
                .reason(dto.getReason())
                .build();

        return toResponse(leaveRequestRepository.save(request));
    }

    @Override
    public List<LeaveRequestResponse> getMyRequests(Long employeeId) {
        return leaveRequestRepository.findAllByEmployee_Id(employeeId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveRequestResponse getById(Long id) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));
        return toResponse(request);
    }

    @Override
    @Transactional
    public LeaveRequestResponse cancel(Long requestId, Long employeeId) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + requestId));

        if (!request.getEmployee().getId().equals(employeeId)) {
            throw new AccessDeniedException("You are not allowed to cancel this leave request");
        }

        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidLeaveRequestException("Only PENDING leave requests can be cancelled");
        }

        request.setStatus(LeaveStatus.CANCELLED);
        request.setUpdatedAt(LocalDateTime.now());
        return toResponse(leaveRequestRepository.save(request));
    }

    @Override
    public List<LeaveRequestResponse> getTeamRequests(Long managerId) {
        return leaveRequestRepository.findAllByEmployee_Manager_Id(managerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestResponse> getPendingByManager(Long managerId) {
        return leaveRequestRepository.findAllByEmployee_Manager_IdAndStatus(managerId, LeaveStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LeaveRequestResponse approve(Long requestId, Long managerId) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + requestId));

        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidLeaveRequestException("Only PENDING requests can be approved");
        }

        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found: " + managerId));

        if (request.getEmployee().getManager() == null ||
                !request.getEmployee().getManager().getId().equals(managerId)) {
            throw new AccessDeniedException("You are not the manager of this employee");
        }

        request.setStatus(LeaveStatus.APPROVED);
        request.setReviewedBy(manager);
        request.setUpdatedAt(LocalDateTime.now());
        LeaveRequest saved = leaveRequestRepository.save(request);

        leaveBalanceService.updateUsedDays(request.getEmployee().getId(), request.getDaysCount(), true);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public LeaveRequestResponse reject(Long requestId, Long managerId, String note) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + requestId));

        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidLeaveRequestException("Only PENDING requests can be rejected");
        }

        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found: " + managerId));

        request.setStatus(LeaveStatus.REJECTED);
        request.setReviewedBy(manager);
        request.setReviewNote(note);
        request.setUpdatedAt(LocalDateTime.now());
        return toResponse(leaveRequestRepository.save(request));
    }

    double calculateWorkingDays(LocalDate start, LocalDate end) {
        double count = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek day = current.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                count++;
            }
            current = current.plusDays(1);
        }
        return count;
    }

    private LeaveRequestResponse toResponse(LeaveRequest request) {
        return LeaveRequestResponse.builder()
                .id(request.getId())
                .employeeId(request.getEmployee().getId())
                .employeeName(request.getEmployee().getFullName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .daysCount(request.getDaysCount())
                .leaveType(request.getLeaveType())
                .reason(request.getReason())
                .status(request.getStatus())
                .reviewedById(request.getReviewedBy() != null ? request.getReviewedBy().getId() : null)
                .reviewNote(request.getReviewNote())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
