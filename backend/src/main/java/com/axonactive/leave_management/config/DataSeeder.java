package com.axonactive.leave_management.config;

import com.axonactive.leave_management.user.entity.User;
import com.axonactive.leave_management.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already has data, skipping seed.");
            return;
        }

        User manager = new User();
        manager.setEmail("manager@axon.com");
        manager.setPasswordHash(passwordEncoder.encode("Manager@123"));
        manager.setFullName("Tran Thi Manager");
        manager.setRole(User.Role.MANAGER);
        manager = userRepository.save(manager);

        String[] names  = {"Nguyen Van A", "Le Thi B", "Pham Van C"};
        String[] emails = {"nva@axon.com", "ltb@axon.com", "pvc@axon.com"};

        for (int i = 0; i < 3; i++) {
            User emp = new User();
            emp.setEmail(emails[i]);
            emp.setPasswordHash(passwordEncoder.encode("Employee@123"));
            emp.setFullName(names[i]);
            emp.setRole(User.Role.EMPLOYEE);
            emp.setManager(manager);
            userRepository.save(emp);
        }

        log.info("=== Seed data created ===");
        log.info("Manager  : manager@axon.com  / Manager@123");
        log.info("Employee1: nva@axon.com      / Employee@123");
        log.info("Employee2: ltb@axon.com      / Employee@123");
        log.info("Employee3: pvc@axon.com      / Employee@123");
    }
}
