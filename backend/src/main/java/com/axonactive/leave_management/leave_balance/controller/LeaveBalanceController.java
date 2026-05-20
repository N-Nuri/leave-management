package com.axonactive.leave_management.leave_balance.controller;

import com.axonactive.leave_management.common.exception.ResourceNotFoundException;
import com.axonactive.leave_management.leave_balance.dto.LeaveBalanceResponse;
import com.axonactive.leave_management.leave_balance.service.LeaveBalanceService;
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
@RequestMapping("/api/leave-balance")
@RequiredArgsConstructor
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER')")
    public ResponseEntity<LeaveBalanceResponse> getMyBalance(
            @AuthenticationPrincipal UserDetails principal) {
        Long userId = resolveUserId(principal);
        return ResponseEntity.ok(leaveBalanceService.getMyBalance(userId));
    }

    @GetMapping("/team")
    @PreAuthorize("hasRole('MANAGER')")
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
