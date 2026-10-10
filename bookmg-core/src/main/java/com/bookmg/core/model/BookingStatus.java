package com.bookmg.core.model;

/**
 * Lifecycle states of a resource reservation.
 */
public enum BookingStatus {
    CONFIRMED("Confirmed and active"),
    PENDING_APPROVAL("Awaiting manager or admin authorization"),
    REJECTED("Rejected by approving authority"),
    CANCELLED("Cancelled by user or automated system");

    private final String description;

    BookingStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return this == CONFIRMED || this == PENDING_APPROVAL;
    }
}
