package com.bookmg.booking.model;

import java.time.Duration;
import java.time.LocalDateTime;

public record TimeSlot(LocalDateTime startTime, LocalDateTime endTime) {

    public TimeSlot {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time must not be null");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be strictly before end time: " + startTime + " >= " + endTime);
        }
    }

    public boolean overlaps(TimeSlot other) {
        if (other == null) {
            return false;
        }
        return this.startTime.isBefore(other.endTime()) && this.endTime.isAfter(other.startTime());
    }

    public Duration duration() {
        return Duration.between(startTime, endTime);
    }

    public boolean isWithinWorkingHours(int startHour, int endHour) {
        boolean validStart = startTime.getHour() >= startHour;
        boolean validEnd = (endTime.getHour() < endHour) || (endTime.getHour() == endHour && endTime.getMinute() == 0);
        return validStart && validEnd;
    }
}
