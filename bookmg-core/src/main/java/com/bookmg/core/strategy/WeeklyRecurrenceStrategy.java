package com.bookmg.core.strategy;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Strategy implementation generating weekly booking occurrences (every 7 days).
 */
public class WeeklyRecurrenceStrategy implements RecurrenceStrategy {

    @Override
    public List<LocalDate> generateDates(LocalDate startDate, LocalDate untilDate) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(untilDate)) {
            dates.add(current);
            current = current.plusWeeks(1);
        }
        return dates;
    }

    @Override
    public String getRecurrenceName() {
        return "WEEKLY";
    }
}
