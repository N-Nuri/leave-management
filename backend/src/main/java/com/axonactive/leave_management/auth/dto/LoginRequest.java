package com.axonactive.leave_management.auth.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}