package com.bookmg.core.exception;

/**
 * Custom unchecked exception thrown when a user attempts an action not permitted by their role hierarchy.
 */
public class UnauthorizedBookingException extends RuntimeException {
    private final String userId;
    private final String requiredRole;

    public UnauthorizedBookingException(String message) {
        super(message);
        this.userId = null;
        this.requiredRole = null;
    }

    public UnauthorizedBookingException(String userId, String requiredRole, String message) {
        super(String.format("User '%s' is unauthorized: requires '%s'. %s", userId, requiredRole, message));
        this.userId = userId;
        this.requiredRole = requiredRole;
    }

    public String getUserId() {
        return userId;
    }

    public String getRequiredRole() {
        return requiredRole;
    }
}
