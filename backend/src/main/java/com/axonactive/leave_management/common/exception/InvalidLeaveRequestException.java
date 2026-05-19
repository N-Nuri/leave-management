package com.axonactive.leave_management.common.exception;

public class InvalidLeaveRequestException extends RuntimeException {
    public InvalidLeaveRequestException(String message) {
        super(message);
    }
}
