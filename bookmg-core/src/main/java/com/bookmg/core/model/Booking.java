package com.bookmg.core.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Domain entity representing a scheduled reservation of a Resource by a User.
 * Extends BaseEntity to inherit unified identity, audit timestamps, and state tracking.
 * Implements Comparable to enable natural chronological ordering.
 */
public class Booking extends BaseEntity implements Comparable<Booking> {
    private static int bookingCounter = 1000;

    protected User user;
    protected Resource resource;
    protected LocalDate date;
    protected LocalTime startTime;
    protected LocalTime endTime;
    protected BookingStatus status;
    protected String purpose;

    /**
     * Default constructor for serialization / reflection.
     */
    public Booking() {
        super();
    }

    /**
     * Convenience constructor chaining to full constructor with static ID generation and initial status.
     */
    public Booking(User user, Resource resource, LocalDate date, LocalTime startTime, LocalTime endTime, String purpose) {
        this(generateNextId(), user, resource, date, startTime, endTime, BookingStatus.CONFIRMED, purpose, LocalDateTime.now());
    }

    /**
     * Primary constructor with strict validation of time bounds and entity relationships.
     */
    public Booking(String id, User user, Resource resource, LocalDate date,
                   LocalTime startTime, LocalTime endTime, BookingStatus status,
                   String purpose, LocalDateTime createdAt) {
        super(id);
        setUser(user);
        setResource(resource);
        setDate(date);
        setTimeSlot(startTime, endTime);
        setStatus(status);
        setPurpose(purpose);
        if (createdAt != null) {
            setCreatedAt(createdAt);
        }
    }

    /**
     * Generates a sequential unique booking identifier.
     */
    public static synchronized String generateNextId() {
        return "BKG-" + (++bookingCounter);
    }

    /**
     * Resets the static counter (useful in testing scenarios).
     */
    public static synchronized void resetCounter(int base) {
        bookingCounter = base;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        this.user = user;
        markUpdated();
    }

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        if (resource == null) {
            throw new IllegalArgumentException("Resource cannot be null");
        }
        this.resource = resource;
        markUpdated();
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("Booking date cannot be null");
        }
        this.date = date;
        markUpdated();
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    /**
     * Validates and sets start and end times together to maintain interval invariant.
     */
    public void setTimeSlot(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time cannot be null");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time (" + startTime + ") must be before end time (" + endTime + ")");
        }
        this.startTime = startTime;
        this.endTime = endTime;
        markUpdated();
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Booking status cannot be null");
        }
        this.status = status;
        markUpdated();
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        if (purpose == null || purpose.trim().isEmpty()) {
            throw new IllegalArgumentException("Meeting purpose cannot be blank");
        }
        this.purpose = purpose.trim();
        markUpdated();
    }

    /**
     * Checks if this booking overlaps with a given date and time window.
     * True interval overlap formula: S1 < E2 AND E1 > S2.
     */
    public boolean overlaps(LocalDate queryDate, LocalTime queryStart, LocalTime queryEnd) {
        if (!this.date.equals(queryDate) || !this.status.isActive()) {
            return false;
        }
        return queryStart.isBefore(this.endTime) && queryEnd.isAfter(this.startTime);
    }

    @Override
    public int compareTo(Booking other) {
        if (other == null) return 1;
        int dateCmp = this.date.compareTo(other.date);
        if (dateCmp != 0) return dateCmp;
        int timeCmp = this.startTime.compareTo(other.startTime);
        if (timeCmp != 0) return timeCmp;
        return this.id.compareTo(other.id);
    }

    @Override
    public String toString() {
        return String.format("Booking[id='%s', user='%s', res='%s', date=%s, time=%s-%s, status=%s, purpose='%s']",
                id, (user != null ? user.getName() : "N/A"),
                (resource != null ? resource.getName() : "N/A"),
                date, startTime, endTime, status, purpose);
    }
}
