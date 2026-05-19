package com.axonactive.leave_management.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String role;
    private String fullName;
    private long expiresIn;
}