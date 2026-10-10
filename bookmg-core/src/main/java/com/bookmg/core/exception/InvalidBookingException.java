package com.bookmg.core.exception;

/**
 * Custom unchecked exception thrown when reservation parameters violate enterprise policies
 * such as operating business hours (08:00 - 20:00), minimum slot duration, past dates,
 * or role-based maximum duration constraints.
 *
 * Enforces Business Rule 2 (Booking Constraints & Role Policy Enforcement).
 */
public class InvalidBookingException extends RuntimeException {
    private final String errorCode;

    public InvalidBookingException(String message) {
        super(message);
        this.errorCode = "INVALID_BOOKING_POLICY";
    }

    public InvalidBookingException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
