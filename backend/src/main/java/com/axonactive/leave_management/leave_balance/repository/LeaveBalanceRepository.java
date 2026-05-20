package com.axonactive.leave_management.leave_balance.repository;

import com.axonactive.leave_management.leave_balance.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    Optional<LeaveBalance> findByUser_IdAndYear(Long userId, Integer year);
    List<LeaveBalance> findByYear(Integer year);
    List<LeaveBalance> findByUser_Manager_IdAndYear(Long managerId, Integer year);
}
