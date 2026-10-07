package com.bookmg.booking.recurrence;

import com.bookmg.booking.model.TimeSlot;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MonthlyRecurrenceStrategy implements RecurrenceStrategy {

    @Override
    public List<TimeSlot> generateSlots(LocalDateTime start, LocalDateTime end, LocalDateTime until) {
        List<TimeSlot> slots = new ArrayList<>();
        Duration slotDuration = Duration.between(start, end);

        LocalDateTime currentStart = start;
        while (!currentStart.isAfter(until)) {
            LocalDateTime currentEnd = currentStart.plus(slotDuration);
            slots.add(new TimeSlot(currentStart, currentEnd));
            currentStart = currentStart.plusMonths(1);
        }
        return slots;
    }
}
