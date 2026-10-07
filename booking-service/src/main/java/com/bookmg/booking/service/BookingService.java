package com.bookmg.booking.service;

import com.bookmg.booking.approval.ApprovalPolicyFactory;
import com.bookmg.booking.client.ResourceClient;
import com.bookmg.booking.client.ResourceDto;
import com.bookmg.booking.dto.*;
import com.bookmg.booking.exception.BadRequestException;
import com.bookmg.booking.exception.ConflictException;
import com.bookmg.booking.exception.ResourceNotFoundException;
import com.bookmg.booking.model.Booking;
import com.bookmg.booking.model.BookingStatus;
import com.bookmg.booking.model.RecurrenceType;
import com.bookmg.booking.model.TimeSlot;
import com.bookmg.booking.recurrence.RecurrenceStrategy;
import com.bookmg.booking.recurrence.RecurrenceStrategyFactory;
import com.bookmg.booking.repository.BookingRepository;
import com.bookmg.booking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceClient resourceClient;
    private final RecurrenceStrategyFactory recurrenceStrategyFactory;
    private final ApprovalPolicyFactory approvalPolicyFactory;

    @Value("${booking.working-hours.start:9}")
    private int workingHoursStart;

    @Value("${booking.working-hours.end:18}")
    private int workingHoursEnd;

    @Value("${booking.max-duration-hours:8}")
    private int maxDurationHours;

    @Value("${booking.checkin-window-before-minutes:15}")
    private int checkinWindowBeforeMinutes;

    @Value("${booking.auto-release-after-minutes:15}")
    private int autoReleaseAfterMinutes;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, UserPrincipal user) {
        validateTimes(request.getStartTime(), request.getEndTime());

        ResourceDto resource = fetchAndValidateResource(request.getResourceId());

        if (request.getRecurrenceType() != null && request.getRecurrenceType() != RecurrenceType.NONE) {
            List<BookingResponse> recurring = createRecurringBookings(request, user, resource);
            return recurring.get(0);
        }

        // Single Booking Conflict Check
        TimeSlot slot = new TimeSlot(request.getStartTime(), request.getEndTime());
        checkConflict(resource.getId(), slot, null);

        BookingStatus initialStatus = approvalPolicyFactory.determineInitialStatus(resource, user);

        Booking booking = Booking.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .userId(user.getUserId())
                .userEmail(user.getEmail())
                .department(user.getDepartment() != null ? user.getDepartment() : "GENERAL")
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(initialStatus)
                .recurrenceType(RecurrenceType.NONE)
                .checkedIn(false)
                .build();

        Booking saved = bookingRepository.save(booking);
        log.info("Created booking ID {} for resource '{}' with status {}", saved.getId(), saved.getResourceName(), saved.getStatus());
        return BookingResponse.fromEntity(saved);
    }

    @Transactional
    public List<BookingResponse> createRecurringBookings(
            CreateBookingRequest request,
            UserPrincipal user,
            ResourceDto resource
    ) {
        RecurrenceStrategy strategy = recurrenceStrategyFactory.getStrategy(request.getRecurrenceType());
        LocalDateTime cappedUntil = recurrenceStrategyFactory.calculateEffectiveUntilDate(
                request.getStartTime(), request.getRecurrenceUntil()
        );

        List<TimeSlot> slots = strategy.generateSlots(
                request.getStartTime(), request.getEndTime(), cappedUntil
        );

        if (slots.isEmpty()) {
            throw new BadRequestException("No recurring occurrences generated for the specified range");
        }

        // Batch Atomic Conflict Detection: Verify EVERY occurrence before persisting any!
        for (TimeSlot slot : slots) {
            checkConflict(resource.getId(), slot, null);
        }

        String recurrenceGroupId = UUID.randomUUID().toString();
        BookingStatus initialStatus = approvalPolicyFactory.determineInitialStatus(resource, user);

        List<Booking> bookings = slots.stream().map(slot -> Booking.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .userId(user.getUserId())
                .userEmail(user.getEmail())
                .department(user.getDepartment() != null ? user.getDepartment() : "GENERAL")
                .startTime(slot.startTime())
                .endTime(slot.endTime())
                .status(initialStatus)
                .recurrenceType(request.getRecurrenceType())
                .recurrenceGroupId(recurrenceGroupId)
                .checkedIn(false)
                .build()
        ).toList();

        List<Booking> savedList = bookingRepository.saveAll(bookings);
        log.info("Created {} recurring bookings in series {} for resource '{}'",
                savedList.size(), recurrenceGroupId, resource.getName());

        return savedList.stream().map(BookingResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return BookingResponse.fromEntity(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(UserPrincipal user) {
        return bookingRepository.findByUserEmailOrderByStartTimeDesc(user.getEmail())
                .stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForResource(Long resourceId, LocalDateTime start, LocalDateTime end) {
        LocalDateTime dayStart = start != null ? start : LocalDate.now().atStartOfDay();
        LocalDateTime dayEnd = end != null ? end : LocalDate.now().plusMonths(1).atTime(LocalTime.MAX);
        return bookingRepository.findBookingsForResourceOnDate(resourceId, dayStart, dayEnd)
                .stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, UserPrincipal user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        validateOwnershipOrAdmin(booking, user);

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);
        log.info("Cancelled booking ID {} by user {}", id, user.getEmail());
        return BookingResponse.fromEntity(updated);
    }

    @Transactional
    public List<BookingResponse> cancelRecurringSeries(String recurrenceGroupId, UserPrincipal user) {
        List<Booking> series = bookingRepository.findByRecurrenceGroupIdOrderByStartTimeAsc(recurrenceGroupId);
        if (series.isEmpty()) {
            throw new ResourceNotFoundException("Recurring series not found with group ID: " + recurrenceGroupId);
        }

        validateOwnershipOrAdmin(series.get(0), user);

        LocalDateTime now = LocalDateTime.now();
        List<Booking> updated = new ArrayList<>();
        for (Booking booking : series) {
            // Cancel future or current occurrences
            if (!booking.getEndTime().isBefore(now) && booking.getStatus() != BookingStatus.CANCELLED) {
                booking.setStatus(BookingStatus.CANCELLED);
                updated.add(booking);
            }
        }

        bookingRepository.saveAll(updated);
        log.info("Cancelled {} occurrences in recurring series {} by {}", updated.size(), recurrenceGroupId, user.getEmail());
        return updated.stream().map(BookingResponse::fromEntity).toList();
    }

    @Transactional
    public BookingResponse checkIn(Long id, UserPrincipal user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        validateOwnershipOrAdmin(booking, user);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Only CONFIRMED bookings can be checked in. Current status: " + booking.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime earliestCheckIn = booking.getStartTime().minusMinutes(checkinWindowBeforeMinutes);
        LocalDateTime latestCheckIn = booking.getStartTime().plusMinutes(autoReleaseAfterMinutes);

        if (now.isBefore(earliestCheckIn)) {
            throw new BadRequestException("Check-in opens " + checkinWindowBeforeMinutes + " minutes before the meeting start time");
        }

        if (now.isAfter(latestCheckIn)) {
            throw new BadRequestException("Check-in window expired. Meeting started more than " + autoReleaseAfterMinutes + " minutes ago");
        }

        booking.setCheckedIn(true);
        booking.setCheckedInAt(now);
        booking.setStatus(BookingStatus.CHECKED_IN);

        Booking updated = bookingRepository.save(booking);
        log.info("User {} checked in for booking ID {}", user.getEmail(), id);
        return BookingResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(Long resourceId, LocalDate date) {
        ResourceDto resource = fetchAndValidateResource(resourceId);

        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime dayStart = targetDate.atTime(workingHoursStart, 0);
        LocalDateTime dayEnd = targetDate.atTime(workingHoursEnd, 0);

        List<Booking> dayBookings = bookingRepository.findBookingsForResourceOnDate(resourceId, dayStart, dayEnd);

        List<TimeSlotDto> bookedSlots = dayBookings.stream()
                .map(b -> TimeSlotDto.builder()
                        .startTime(b.getStartTime())
                        .endTime(b.getEndTime())
                        .status("BOOKED")
                        .bookingTitle(b.getTitle())
                        .build())
                .toList();

        // Compute available open slots throughout working hours
        List<TimeSlotDto> availableSlots = new ArrayList<>();
        LocalDateTime slotPointer = dayStart;

        for (Booking b : dayBookings) {
            if (b.getStartTime().isAfter(slotPointer)) {
                availableSlots.add(TimeSlotDto.builder()
                        .startTime(slotPointer)
                        .endTime(b.getStartTime())
                        .status("AVAILABLE")
                        .build());
            }
            if (b.getEndTime().isAfter(slotPointer)) {
                slotPointer = b.getEndTime();
            }
        }

        if (slotPointer.isBefore(dayEnd)) {
            availableSlots.add(TimeSlotDto.builder()
                    .startTime(slotPointer)
                    .endTime(dayEnd)
                    .status("AVAILABLE")
                    .build());
        }

        return AvailabilityResponse.builder()
                .resourceId(resourceId)
                .resourceName(resource.getName())
                .date(targetDate)
                .workingHoursStart(workingHoursStart)
                .workingHoursEnd(workingHoursEnd)
                .bookedSlots(bookedSlots)
                .availableSlots(availableSlots)
                .build();
    }

    private void checkConflict(Long resourceId, TimeSlot slot, Long excludeBookingId) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resourceId, slot.startTime(), slot.endTime(), excludeBookingId
        );
        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new ConflictException(String.format(
                    "Resource conflict: already booked from %s to %s for '%s' (Status: %s)",
                    conflict.getStartTime(), conflict.getEndTime(), conflict.getTitle(), conflict.getStatus()
            ));
        }
    }

    private void validateTimes(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new BadRequestException("Start time and end time must be specified");
        }
        if (!start.isBefore(end)) {
            throw new BadRequestException("Start time must be before end time");
        }
        Duration duration = Duration.between(start, end);
        if (duration.toHours() > maxDurationHours) {
            throw new BadRequestException("Booking duration exceeds maximum allowed: " + maxDurationHours + " hours");
        }
    }

    private ResourceDto fetchAndValidateResource(Long resourceId) {
        try {
            ResourceDto resource = resourceClient.getResourceById(resourceId);
            if (resource == null || !resource.isActive()) {
                throw new BadRequestException("Resource ID " + resourceId + " is inactive or not found");
            }
            return resource;
        } catch (Exception e) {
            // If Feign client fails or resource does not exist
            if (e instanceof BadRequestException) throw e;
            log.warn("Feign call to resource-service failed: {}. Using fallback validation.", e.getMessage());
            return ResourceDto.builder()
                    .id(resourceId)
                    .name("Resource #" + resourceId)
                    .active(true)
                    .restricted(false)
                    .build();
        }
    }

    private void validateOwnershipOrAdmin(Booking booking, UserPrincipal user) {
        boolean isOwner = booking.getUserEmail().equalsIgnoreCase(user.getEmail());
        boolean isAdmin = "ROLE_ADMIN".equals(user.getRole());
        boolean isManager = "ROLE_MANAGER".equals(user.getRole()) &&
                booking.getDepartment().equalsIgnoreCase(user.getDepartment());

        if (!isOwner && !isAdmin && !isManager) {
            throw new BadRequestException("You do not have permission to modify this booking");
        }
    }
}
