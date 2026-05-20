package com.axonactive.leave_management.leave_balance.entity;

import com.axonactive.leave_management.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_balances")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_days", nullable = false)
    private Double totalDays = 12.0;

    @Column(name = "used_days", nullable = false)
    private Double usedDays = 0.0;

    @Column(name = "carried_over_days", nullable = false)
    private Double carriedOverDays = 0.0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
