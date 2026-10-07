package com.bookmg.booking.scheduler;

import com.bookmg.booking.model.Booking;
import com.bookmg.booking.model.BookingStatus;
import com.bookmg.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AutoReleaseScheduler {

    private final BookingRepository bookingRepository;

    @Value("${booking.auto-release-after-minutes:15}")
    private int autoReleaseAfterMinutes;

    @Scheduled(fixedRate = 60000) // Check every 60 seconds
    @Transactional
    public void releaseNoShowBookings() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.minusMinutes(autoReleaseAfterMinutes);

        List<Booking> noShows = bookingRepository.findNoShowBookings(threshold, now);

        if (!noShows.isEmpty()) {
            log.info("Auto-Release Scheduler: Found {} un-checked-in bookings past the {}-minute grace window",
                    noShows.size(), autoReleaseAfterMinutes);

            for (Booking booking : noShows) {
                booking.setStatus(BookingStatus.AUTO_RELEASED);
                log.info("Auto-released booking ID {} for resource '{}' (booked by {}) due to no-show",
                        booking.getId(), booking.getResourceName(), booking.getUserEmail());
            }

            bookingRepository.saveAll(noShows);
        }
    }
}
