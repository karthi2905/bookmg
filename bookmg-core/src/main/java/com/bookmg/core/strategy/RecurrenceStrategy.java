package com.bookmg.core.strategy;

import java.time.LocalDate;
import java.util.List;

/**
 * Strategy interface for generating calendar occurrence dates for recurring meeting series.
 */
public interface RecurrenceStrategy {

    /**
     * Generates all occurrences from the start date up to the bounded ceiling date.
     *
     * @param startDate initial meeting date
     * @param untilDate maximum ceiling date (capped at 90 days)
     * @return list of chronological occurrence dates
     */
    List<LocalDate> generateDates(LocalDate startDate, LocalDate untilDate);

    /**
     * Name identifier for the recurrence interval.
     */
    String getRecurrenceName();
}
