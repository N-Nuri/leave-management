package com.axonactive.leave_management.manager;

import com.axonactive.leave_management.common.exception.ResourceNotFoundException;
import com.axonactive.leave_management.leave_balance.dto.LeaveBalanceResponse;
import com.axonactive.leave_management.leave_balance.service.LeaveBalanceService;
import com.axonactive.leave_management.leave_request.dto.LeaveRequestResponse;
import com.axonactive.leave_management.leave_request.dto.RejectRequest;
import com.axonactive.leave_management.leave_request.service.LeaveRequestService;
import com.axonactive.leave_management.user.entity.User;
import com.axonactive.leave_management.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    private final LeaveRequestService leaveRequestService;
    private final LeaveBalanceService leaveBalanceService;
    private final UserRepository userRepository;

    @GetMapping("/team-requests")
    public ResponseEntity<List<LeaveRequestResponse>> getTeamRequests(
            @AuthenticationPrincipal UserDetails principal) {
        Long managerId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.getTeamRequests(managerId));
    }

    @GetMapping("/pending-requests")
    public ResponseEntity<List<LeaveRequestResponse>> getPendingRequests(
            @AuthenticationPrincipal UserDetails principal) {
        Long managerId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.getPendingByManager(managerId));
    }

    @PostMapping("/leave-requests/{id}/approve")
    public ResponseEntity<LeaveRequestResponse> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        Long managerId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.approve(id, managerId));
    }

    @PostMapping("/leave-requests/{id}/reject")
    public ResponseEntity<LeaveRequestResponse> reject(
            @PathVariable Long id,
            @RequestBody RejectRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        Long managerId = resolveUserId(principal);
        return ResponseEntity.ok(leaveRequestService.reject(id, managerId, req.getNote()));
    }

    @GetMapping("/team-balances")
    public ResponseEntity<List<LeaveBalanceResponse>> getTeamBalances(
            @AuthenticationPrincipal UserDetails principal) {
        Long managerId = resolveUserId(principal);
        return ResponseEntity.ok(leaveBalanceService.getTeamBalances(managerId));
    }

    private Long resolveUserId(UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getUsername()));
        return user.getId();
    }
}
