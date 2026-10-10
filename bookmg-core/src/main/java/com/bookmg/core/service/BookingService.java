package com.bookmg.core.service;

import com.bookmg.core.exception.BookingConflictException;
import com.bookmg.core.exception.InvalidBookingException;
import com.bookmg.core.exception.ResourceNotFoundException;
import com.bookmg.core.exception.UnauthorizedBookingException;
import com.bookmg.core.model.Booking;
import com.bookmg.core.model.BookingStatus;
import com.bookmg.core.model.Resource;
import com.bookmg.core.model.User;
import com.bookmg.core.repository.InMemoryRepository;
import com.bookmg.core.strategy.ApprovalPolicyEngine;
import com.bookmg.core.strategy.ApprovalStrategy;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core business service responsible for reservation management, conflict checking,
 * and policy rule enforcement.
 *
 * Enforces:
 *   - Business Rule 1: Double-Booking / Interval Conflict Prevention (checked {@link BookingConflictException})
 *   - Business Rule 2: Operating Hours, Duration & Role Policy Constraints (unchecked {@link InvalidBookingException})
 */
public class BookingService {
    public static final LocalTime OPERATING_HOURS_START = LocalTime.of(8, 0);
    public static final LocalTime OPERATING_HOURS_END = LocalTime.of(20, 0);
    public static final int MAX_ADVANCE_DAYS = 90;
    public static final int MIN_DURATION_MINUTES = 15;

    private final InMemoryRepository<Booking> bookingRepository;
    private final ResourceService resourceService;
    private final UserService userService;

    public BookingService(InMemoryRepository<Booking> bookingRepository,
                          ResourceService resourceService,
                          UserService userService) {
        this.bookingRepository = bookingRepository;
        this.resourceService = resourceService;
        this.userService = userService;
    }

    // =========================================================================
    // Overloaded Reservation Creation Methods (Compile-time Polymorphism)
    // =========================================================================

    /**
     * Primary booking creation method taking entity instances.
     *
     * @throws BookingConflictException checked exception when interval conflict is detected (Rule 1)
     * @throws InvalidBookingException  unchecked exception when booking rules are violated (Rule 2)
     */
    public Booking createBooking(User user, Resource resource, LocalDate date,
                                 LocalTime startTime, LocalTime endTime, String purpose)
            throws BookingConflictException {

        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        if (resource == null) {
            throw new IllegalArgumentException("Resource cannot be null");
        }

        // =====================================================================
        // ENFORCE BUSINESS RULE 2: Operational Bounds, Duration & Role Caps
        // =====================================================================
        enforceBusinessRule2(user, resource, date, startTime, endTime, purpose);

        // =====================================================================
        // ENFORCE BUSINESS RULE 1: Double-Booking / Interval Overlap Conflict
        // =====================================================================
        enforceBusinessRule1(resource, date, startTime, endTime);

        // =====================================================================
        // Evaluate Lifecycle Status via Strategy Pattern
        // =====================================================================
        ApprovalStrategy strategy = ApprovalPolicyEngine.resolveStrategy(resource);
        Booking booking = new Booking(Booking.generateNextId(), user, resource, date,
                startTime, endTime, BookingStatus.CONFIRMED, purpose, LocalDateTime.now());

        BookingStatus initialStatus = strategy.evaluateApproval(booking, user, resource);
        booking.setStatus(initialStatus);

        return bookingRepository.save(booking);
    }

    /**
     * Overloaded booking creation method resolving entities by ID.
     */
    public Booking createBooking(String userId, String resourceId, LocalDate date,
                                 LocalTime startTime, LocalTime endTime, String purpose)
            throws BookingConflictException {

        User user = userService.getUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User ID '" + userId + "' does not exist."));
        Resource resource = resourceService.getResourceById(resourceId);

        return createBooking(user, resource, date, startTime, endTime, purpose);
    }

    // =========================================================================
    // Business Rule Enforcement Logic
    // =========================================================================

    /**
     * Enforces Business Rule 1: No double bookings.
     * Mathematical interval overlap: S1 < E2 AND E1 > S2.
     */
    private void enforceBusinessRule1(Resource resource, LocalDate date,
                                     LocalTime startTime, LocalTime endTime)
            throws BookingConflictException {

        List<Booking> existingBookings = getBookingsForResource(resource.getId(), date);
        for (Booking existing : existingBookings) {
            if (existing.getStatus().isActive() && existing.overlaps(date, startTime, endTime)) {
                throw new BookingConflictException(resource.getId(), date, startTime, endTime, existing.getId());
            }
        }
    }

    /**
     * Enforces Business Rule 2: Booking constraints (operating hours 08:00 - 20:00,
     * time bounds, min duration 15 min, max role duration limits, and advance window).
     */
    private void enforceBusinessRule2(User user, Resource resource, LocalDate date,
                                     LocalTime startTime, LocalTime endTime, String purpose) {
        if (date == null) {
            throw new InvalidBookingException("NULL_DATE", "Booking date cannot be null.");
        }
        if (startTime == null || endTime == null) {
            throw new InvalidBookingException("NULL_TIME", "Reservation start and end times cannot be null.");
        }
        if (purpose == null || purpose.trim().isEmpty()) {
            throw new InvalidBookingException("EMPTY_PURPOSE", "Reservation purpose must be provided.");
        }

        // 1. Date not in the past
        if (date.isBefore(LocalDate.now())) {
            throw new InvalidBookingException("PAST_DATE",
                    "Cannot create booking in the past. Requested date: " + date);
        }

        // 2. Advance booking ceiling (90 days)
        if (date.isAfter(LocalDate.now().plusDays(MAX_ADVANCE_DAYS))) {
            throw new InvalidBookingException("ADVANCE_LIMIT_EXCEEDED",
                    "Reservations cannot be booked more than " + MAX_ADVANCE_DAYS + " days in advance.");
        }

        // 3. Start time before end time
        if (!startTime.isBefore(endTime)) {
            throw new InvalidBookingException("INVALID_TIME_SEQUENCE",
                    String.format("Start time (%s) must strictly precede end time (%s).", startTime, endTime));
        }

        // 4. Operating hours constraint: 08:00 to 20:00
        if (startTime.isBefore(OPERATING_HOURS_START) || endTime.isAfter(OPERATING_HOURS_END)) {
            throw new InvalidBookingException("OUT_OF_OPERATING_HOURS",
                    String.format("Reservation window %s - %s falls outside enterprise operating hours (08:00 - 20:00).",
                            startTime, endTime));
        }

        // 5. Minimum duration constraint (15 minutes)
        long durationMinutes = Duration.between(startTime, endTime).toMinutes();
        if (durationMinutes < MIN_DURATION_MINUTES) {
            throw new InvalidBookingException("MIN_DURATION_VIOLATION",
                    String.format("Requested duration of %d minutes is below the minimum allowed (%d minutes).",
                            durationMinutes, MIN_DURATION_MINUTES));
        }

        // 6. User role maximum duration cap
        long maxAllowedMinutes = user.getMaxBookingHours() * 60L;
        if (durationMinutes > maxAllowedMinutes) {
            throw new InvalidBookingException("ROLE_DURATION_LIMIT_EXCEEDED",
                    String.format("Requested duration of %d minutes exceeds maximum permitted limit for %s (%d hours / %d minutes).",
                            durationMinutes, user.getRole(), user.getMaxBookingHours(), maxAllowedMinutes));
        }
    }

    // =========================================================================
    // Query & Management Operations
    // =========================================================================

    public List<Booking> getAllBookings() {
        List<Booking> all = bookingRepository.findAll();
        Collections.sort(all);
        return all;
    }

    public List<Booking> getBookingsForResource(String resourceId, LocalDate date) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getResource().getId().equalsIgnoreCase(resourceId) && b.getDate().equals(date))
                .sorted()
                .collect(Collectors.toList());
    }

    public List<Booking> getBookingsForUser(String userId) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getUser().getId().equalsIgnoreCase(userId))
                .sorted()
                .collect(Collectors.toList());
    }

    public boolean cancelBooking(String bookingId, User requester) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        // Validation: user must be the owner, manager, or admin
        if (!booking.getUser().getId().equals(requester.getId()) && !requester.canApproveBookings()) {
            throw new UnauthorizedBookingException(requester.getId(), "ROLE_MANAGER or Owner",
                    "Cannot cancel booking owned by another user.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setActive(false);
        bookingRepository.save(booking);
        return true;
    }
}
