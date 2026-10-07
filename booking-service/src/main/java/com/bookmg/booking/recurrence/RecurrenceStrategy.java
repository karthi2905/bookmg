package com.bookmg.booking.recurrence;

import com.bookmg.booking.model.TimeSlot;

import java.time.LocalDateTime;
import java.util.List;

public interface RecurrenceStrategy {
    List<TimeSlot> generateSlots(LocalDateTime start, LocalDateTime end, LocalDateTime until);
}
