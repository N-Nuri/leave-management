package com.axonactive.leave_management.leave_balance.service;

import com.axonactive.leave_management.leave_balance.dto.LeaveBalanceResponse;
import com.axonactive.leave_management.leave_balance.entity.LeaveBalance;
import com.axonactive.leave_management.leave_balance.repository.LeaveBalanceRepository;
import com.axonactive.leave_management.user.entity.User;
import com.axonactive.leave_management.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveBalanceServiceImpl implements LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final UserRepository userRepository;

    @Override
    public LeaveBalanceResponse getMyBalance(Long userId) {
        int year = LocalDate.now().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByUser_IdAndYear(userId, year)
                .orElseGet(() -> createBalance(userId, year));
        return toResponse(balance);
    }

    @Override
    public List<LeaveBalanceResponse> getTeamBalances(Long managerId) {
        int year = LocalDate.now().getYear();
        List<User> teamMembers = userRepository.findByManager_Id(managerId);
        return teamMembers.stream()
                .map(user -> {
                    LeaveBalance balance = leaveBalanceRepository
                            .findByUser_IdAndYear(user.getId(), year)
                            .orElseGet(() -> createBalance(user.getId(), year));
                    return toResponse(balance);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateUsedDays(Long userId, double days, boolean add) {
        int year = LocalDate.now().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByUser_IdAndYear(userId, year)
                .orElseGet(() -> createBalance(userId, year));
        if (add) {
            balance.setUsedDays(balance.getUsedDays() + days);
        } else {
            balance.setUsedDays(Math.max(0, balance.getUsedDays() - days));
        }
        balance.setUpdatedAt(LocalDateTime.now());
        leaveBalanceRepository.save(balance);
    }

    @Override
    @Scheduled(cron = "0 0 1 1 1 *")
    @Transactional
    public void runYearEndAccumulation() {
        int prevYear = LocalDate.now().getYear() - 1;
        int newYear = LocalDate.now().getYear();
        List<LeaveBalance> prevBalances = leaveBalanceRepository.findByYear(prevYear);
        for (LeaveBalance prev : prevBalances) {
            double remaining = prev.getTotalDays() + prev.getCarriedOverDays() - prev.getUsedDays();
            double carryOver = Math.max(0, remaining);
            LeaveBalance next = leaveBalanceRepository
                    .findByUser_IdAndYear(prev.getUser().getId(), newYear)
                    .orElseGet(() -> {
                        LeaveBalance b = new LeaveBalance();
                        b.setUser(prev.getUser());
                        b.setYear(newYear);
                        b.setTotalDays(12.0);
                        b.setUsedDays(0.0);
                        b.setCarriedOverDays(0.0);
                        b.setUpdatedAt(LocalDateTime.now());
                        return b;
                    });
            next.setCarriedOverDays(next.getCarriedOverDays() + carryOver);
            next.setUpdatedAt(LocalDateTime.now());
            leaveBalanceRepository.save(next);
            log.info("Year-end carry-over: {} days for {} ({} -> {})",
                    carryOver, prev.getUser().getEmail(), prevYear, newYear);
        }
    }

    private LeaveBalance createBalance(Long userId, int year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        LeaveBalance balance = LeaveBalance.builder()
                .user(user)
                .year(year)
                .totalDays(12.0)
                .usedDays(0.0)
                .carriedOverDays(0.0)
                .updatedAt(LocalDateTime.now())
                .build();
        return leaveBalanceRepository.save(balance);
    }

    private LeaveBalanceResponse toResponse(LeaveBalance b) {
        return LeaveBalanceResponse.builder()
                .userId(b.getUser().getId())
                .fullName(b.getUser().getFullName())
                .year(b.getYear())
                .totalDays(b.getTotalDays())
                .usedDays(b.getUsedDays())
                .carriedOverDays(b.getCarriedOverDays())
                .remainingDays(b.getTotalDays() + b.getCarriedOverDays() - b.getUsedDays())
                .build();
    }
}
