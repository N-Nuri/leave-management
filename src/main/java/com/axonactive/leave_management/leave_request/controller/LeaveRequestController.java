package com.axonactive.leave_management.leave_request.controller;

import com.axonactive.leave_management.common.exception.ResourceNotFoundException;
import com.axonactive.leave_management.leave_request.dto.LeaveRequestDTO;
import com.axonactive.leave_management.leave_request.dto.LeaveRequestResponse;
import com.axonactive.leave_management.leave_request.service.LeaveRequestService;
import com.axonactive.leave_management.user.entity.User;
import com.axonactive.leave_management.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveRequestResponse> submit(
            @Valid @RequestBody LeaveRequestDTO dto,
            @AuthenticationPrincipal UserDetails principal) {
        UUID employeeId = resolveUserId(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveRequestService.submit(dto, employeeId));
    }

    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<LeaveRequestResponse>> getMyRequests(
            @AuthenticationPrincipal UserDetails principal) {
        UUID employeeId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.getMyRequests(employeeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequestResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(leaveRequestService.getById(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveRequestResponse> cancel(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal) {
        UUID employeeId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.cancel(id, employeeId));
    }

    private UUID resolveUserId(UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getUsername()));
        return user.getId();
    }
}
