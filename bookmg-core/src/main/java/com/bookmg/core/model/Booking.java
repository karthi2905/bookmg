package com.bookmg.core.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

/**
 * Domain entity representing a scheduled reservation of a Resource by a User.
 * Demonstrates encapsulation, validation, constructor chaining, static ID generation,
 * Comparable implementation, and standard object contracts.
 */
public class Booking implements Comparable<Booking> {
    private static int bookingCounter = 1000;

    private String id;
    private User user;
    private Resource resource;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private BookingStatus status;
    private String purpose;
    private LocalDateTime createdAt;

    /**
     * Default constructor for serialization / reflection.
     */
    public Booking() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Convenience constructor chaining to full constructor with static ID generation and initial status.
     *
     * @param user      user creating the reservation
     * @param resource  resource being booked
     * @param date      scheduled calendar date
     * @param startTime reservation start time
     * @param endTime   reservation end time
     * @param purpose   meeting agenda / description
     */
    public Booking(User user, Resource resource, LocalDate date, LocalTime startTime, LocalTime endTime, String purpose) {
        this(generateNextId(), user, resource, date, startTime, endTime, BookingStatus.CONFIRMED, purpose, LocalDateTime.now());
    }

    /**
     * Primary constructor with strict validation of time bounds and entity relationships.
     *
     * @param id        unique reservation ID
     * @param user      user creating the reservation
     * @param resource  resource being booked
     * @param date      scheduled calendar date
     * @param startTime reservation start time
     * @param endTime   reservation end time
     * @param status    initial lifecycle state
     * @param purpose   meeting agenda / description
     * @param createdAt creation audit timestamp
     */
    public Booking(String id, User user, Resource resource, LocalDate date,
                   LocalTime startTime, LocalTime endTime, BookingStatus status,
                   String purpose, LocalDateTime createdAt) {
        setId(id);
        setUser(user);
        setResource(resource);
        setDate(date);
        setTimeSlot(startTime, endTime);
        setStatus(status);
        setPurpose(purpose);
        this.createdAt = (createdAt != null) ? createdAt : LocalDateTime.now();
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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Booking ID cannot be null or empty");
        }
        this.id = id.trim();
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        this.user = user;
    }

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        if (resource == null) {
            throw new IllegalArgumentException("Resource cannot be null");
        }
        this.resource = resource;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("Booking date cannot be null");
        }
        this.date = date;
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
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Booking status cannot be null");
        }
        this.status = status;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        if (purpose == null || purpose.trim().isEmpty()) {
            throw new IllegalArgumentException("Meeting purpose cannot be blank");
        }
        this.purpose = purpose.trim();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Booking booking = (Booking) o;
        return Objects.equals(id, booking.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("Booking[id='%s', user='%s', res='%s', date=%s, time=%s-%s, status=%s, purpose='%s']",
                id, (user != null ? user.getName() : "N/A"),
                (resource != null ? resource.getName() : "N/A"),
                date, startTime, endTime, status, purpose);
    }
}
