package com.bookmg.booking.recurrence;

import com.bookmg.booking.model.RecurrenceType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.Map;

@Component
public class RecurrenceStrategyFactory {

    public static final int MAX_RECURRENCE_DAYS_CAP = 90; // 3-month maximum cap

    private final Map<RecurrenceType, RecurrenceStrategy> strategies = new EnumMap<>(RecurrenceType.class);

    public RecurrenceStrategyFactory() {
        strategies.put(RecurrenceType.DAILY, new DailyRecurrenceStrategy());
        strategies.put(RecurrenceType.WEEKLY, new WeeklyRecurrenceStrategy());
        strategies.put(RecurrenceType.BIWEEKLY, new BiweeklyRecurrenceStrategy());
        strategies.put(RecurrenceType.MONTHLY, new MonthlyRecurrenceStrategy());
    }

    public RecurrenceStrategy getStrategy(RecurrenceType type) {
        if (type == null || type == RecurrenceType.NONE) {
            return null;
        }
        RecurrenceStrategy strategy = strategies.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported recurrence type: " + type);
        }
        return strategy;
    }

    public LocalDateTime calculateEffectiveUntilDate(LocalDateTime start, LocalDateTime requestedUntil) {
        LocalDateTime maxCapDate = start.plusDays(MAX_RECURRENCE_DAYS_CAP);
        if (requestedUntil == null || requestedUntil.isAfter(maxCapDate)) {
            return maxCapDate;
        }
        return requestedUntil;
    }
}
