package com.bookmg.core.strategy;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Strategy implementation generating consecutive daily booking occurrences.
 */
public class DailyRecurrenceStrategy implements RecurrenceStrategy {

    @Override
    public List<LocalDate> generateDates(LocalDate startDate, LocalDate untilDate) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(untilDate)) {
            dates.add(current);
            current = current.plusDays(1);
        }
        return dates;
    }

    @Override
    public String getRecurrenceName() {
        return "DAILY";
    }
}
