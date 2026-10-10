package com.bookmg.core.exception;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Custom checked exception thrown when a requested reservation overlaps with an existing active booking.
 * Enforces Business Rule 1 (Double-Booking / Interval Conflict Prevention).
 *
 * Being a checked exception, callers are required by the Java compiler to explicitly handle
 * or declare it, ensuring transactional recovery.
 */
public class BookingConflictException extends Exception {
    private final String resourceId;
    private final LocalDate date;
    private final LocalTime requestedStart;
    private final LocalTime requestedEnd;
    private final String conflictingBookingId;

    public BookingConflictException(String message) {
        super(message);
        this.resourceId = null;
        this.date = null;
        this.requestedStart = null;
        this.requestedEnd = null;
        this.conflictingBookingId = null;
    }

    public BookingConflictException(String resourceId, LocalDate date,
                                    LocalTime requestedStart, LocalTime requestedEnd,
                                    String conflictingBookingId) {
        super(String.format("Resource '%s' is already booked on %s during requested window %s - %s (Conflicts with reservation: %s)",
                resourceId, date, requestedStart, requestedEnd, conflictingBookingId));
        this.resourceId = resourceId;
        this.date = date;
        this.requestedStart = requestedStart;
        this.requestedEnd = requestedEnd;
        this.conflictingBookingId = conflictingBookingId;
    }

    public String getResourceId() {
        return resourceId;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalTime getRequestedStart() {
        return requestedStart;
    }

    public LocalTime getRequestedEnd() {
        return requestedEnd;
    }

    public String getConflictingBookingId() {
        return conflictingBookingId;
    }
}
