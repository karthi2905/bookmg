package com.bookmg.booking;

import com.bookmg.booking.model.TimeSlot;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TimeSlotTest {

    @Test
    @DisplayName("Should detect overlapping time slots correctly")
    void testOverlaps() {
        LocalDateTime base = LocalDateTime.of(2026, 10, 5, 10, 0);

        TimeSlot slot1 = new TimeSlot(base, base.plusHours(2)); // 10:00 - 12:00
        TimeSlot overlapping1 = new TimeSlot(base.plusHours(1), base.plusHours(3)); // 11:00 - 13:00
        TimeSlot overlapping2 = new TimeSlot(base.minusHours(1), base.plusHours(1)); // 09:00 - 11:00
        TimeSlot contained = new TimeSlot(base.plusMinutes(30), base.plusMinutes(90)); // 10:30 - 11:30
        TimeSlot adjacentAfter = new TimeSlot(base.plusHours(2), base.plusHours(4)); // 12:00 - 14:00 (exact touch, no overlap)
        TimeSlot adjacentBefore = new TimeSlot(base.minusHours(2), base); // 08:00 - 10:00 (exact touch, no overlap)

        assertTrue(slot1.overlaps(overlapping1));
        assertTrue(slot1.overlaps(overlapping2));
        assertTrue(slot1.overlaps(contained));
        assertFalse(slot1.overlaps(adjacentAfter), "Adjacent slot starting exactly at end time should not overlap");
        assertFalse(slot1.overlaps(adjacentBefore), "Adjacent slot ending exactly at start time should not overlap");
    }

    @Test
    @DisplayName("Should reject invalid time slot where start is after end")
    void testInvalidTimeSlot() {
        LocalDateTime start = LocalDateTime.of(2026, 10, 5, 12, 0);
        LocalDateTime end = LocalDateTime.of(2026, 10, 5, 10, 0);

        assertThrows(IllegalArgumentException.class, () -> new TimeSlot(start, end));
    }

    @Test
    @DisplayName("Should correctly calculate duration")
    void testDuration() {
        LocalDateTime start = LocalDateTime.of(2026, 10, 5, 10, 0);
        LocalDateTime end = LocalDateTime.of(2026, 10, 5, 12, 30);
        TimeSlot slot = new TimeSlot(start, end);

        assertEquals(Duration.ofMinutes(150), slot.duration());
    }
}
