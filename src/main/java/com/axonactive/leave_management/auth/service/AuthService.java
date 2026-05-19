package com.axonactive.leave_management.auth.service;

import com.axonactive.leave_management.auth.dto.LoginRequest;
import com.axonactive.leave_management.auth.dto.LoginResponse;
import com.axonactive.leave_management.auth.util.JwtUtil;
import com.axonactive.leave_management.user.entity.User;
import com.axonactive.leave_management.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name());

        return new LoginResponse(
                token,
                user.getRole().name(),
                user.getFullName(),
                28800000L);
    }
}