package com.bookmg.booking.config;

import com.bookmg.booking.model.Booking;
import com.bookmg.booking.model.BookingStatus;
import com.bookmg.booking.model.RecurrenceType;
import com.bookmg.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final BookingRepository bookingRepository;

    @Override
    public void run(String... args) {
        if (bookingRepository.count() == 0) {
            log.info("Seeding initial bookings into booking database...");

            LocalDate today = LocalDate.now();

            List<Booking> seedBookings = List.of(
                    // Confirmed booking today
                    Booking.builder()
                            .title("Sprint Planning & Backlog Grooming")
                            .description("Biweekly agile sprint planning session")
                            .resourceId(2L)
                            .resourceName("Innovation Huddle 1")
                            .userId(3L)
                            .userEmail("user@bookmg.com")
                            .department("ENGINEERING")
                            .startTime(today.atTime(10, 0))
                            .endTime(today.atTime(11, 30))
                            .status(BookingStatus.CONFIRMED)
                            .recurrenceType(RecurrenceType.NONE)
                            .checkedIn(false)
                            .build(),

                    // Checked-in booking today
                    Booking.builder()
                            .title("Product Strategy Sync")
                            .description("Q4 roadmap alignment")
                            .resourceId(3L)
                            .resourceName("Innovation Huddle 2")
                            .userId(2L)
                            .userEmail("manager@bookmg.com")
                            .department("ENGINEERING")
                            .startTime(today.atTime(14, 0))
                            .endTime(today.atTime(15, 0))
                            .status(BookingStatus.CHECKED_IN)
                            .checkedIn(true)
                            .checkedInAt(today.atTime(13, 55))
                            .recurrenceType(RecurrenceType.NONE)
                            .build(),

                    // Pending approval booking on a restricted resource (Boardroom Alpha)
                    Booking.builder()
                            .title("Executive All-Hands Dry Run")
                            .description("Rehearsal for quarterly town hall")
                            .resourceId(1L)
                            .resourceName("Executive Boardroom Alpha")
                            .userId(3L)
                            .userEmail("user@bookmg.com")
                            .department("ENGINEERING")
                            .startTime(today.plusDays(1).atTime(11, 0))
                            .endTime(today.plusDays(1).atTime(13, 0))
                            .status(BookingStatus.PENDING_APPROVAL)
                            .recurrenceType(RecurrenceType.NONE)
                            .checkedIn(false)
                            .build(),

                    // Auto-released historical booking (demonstrating no-show release)
                    Booking.builder()
                            .title("Missed Client Briefing")
                            .description("No-show meeting released automatically")
                            .resourceId(2L)
                            .resourceName("Innovation Huddle 1")
                            .userId(5L)
                            .userEmail("sales@bookmg.com")
                            .department("SALES")
                            .startTime(today.minusDays(1).atTime(11, 0))
                            .endTime(today.minusDays(1).atTime(12, 0))
                            .status(BookingStatus.AUTO_RELEASED)
                            .recurrenceType(RecurrenceType.NONE)
                            .checkedIn(false)
                            .build()
            );

            bookingRepository.saveAll(seedBookings);
            log.info("Successfully seeded {} sample bookings", seedBookings.size());
        }
    }
}
