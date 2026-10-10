package com.bookmg.core;

import com.bookmg.core.exception.BookingConflictException;
import com.bookmg.core.exception.InvalidBookingException;
import com.bookmg.core.exception.ResourceNotFoundException;
import com.bookmg.core.exception.UnauthorizedBookingException;
import com.bookmg.core.model.*;
import com.bookmg.core.repository.InMemoryRepository;
import com.bookmg.core.service.ApprovalService;
import com.bookmg.core.service.BookingService;
import com.bookmg.core.service.ResourceService;
import com.bookmg.core.service.UserService;
import com.bookmg.core.ui.ConsoleMenu;
import com.bookmg.core.util.DataInitializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Day 6 — Custom Exceptions, 2 Business Rules & Resilient Menu Recovery")
class Day6ExceptionsAndBusinessRulesTest {

    private InMemoryRepository<User> userRepo;
    private InMemoryRepository<Resource> resourceRepo;
    private InMemoryRepository<Booking> bookingRepo;

    private UserService userService;
    private ResourceService resourceService;
    private BookingService bookingService;
    private ApprovalService approvalService;

    private Employee employeeAlice;
    private Manager managerBob;
    private Admin adminCharlie;
    private MeetingRoom turingRoom;
    private Resource restrictedBoardroom;

    @BeforeEach
    void setup() {
        userRepo = new InMemoryRepository<>();
        resourceRepo = new InMemoryRepository<>();
        bookingRepo = new InMemoryRepository<>();

        DataInitializer.initialize(userRepo, resourceRepo);

        userService = new UserService(userRepo);
        resourceService = new ResourceService(resourceRepo);
        bookingService = new BookingService(bookingRepo, resourceService, userService);
        approvalService = new ApprovalService(bookingRepo);

        employeeAlice = (Employee) userRepo.findById("USR-1004").orElseThrow();
        managerBob = (Manager) userRepo.findById("USR-1002").orElseThrow();
        adminCharlie = (Admin) userRepo.findById("USR-1001").orElseThrow();

        turingRoom = (MeetingRoom) resourceRepo.findById("RES-1001").orElseThrow();
        restrictedBoardroom = resourceRepo.findById("RES-1003").orElseThrow();
    }

    // =========================================================================
    // BUSINESS RULE 1: Double-Booking / Interval Overlap Conflict (Checked Exception)
    // =========================================================================

    @Test
    @DisplayName("Rule 1: Overlapping time slot throws checked BookingConflictException")
    void testRule1OverlappingSlotThrowsBookingConflictException() throws BookingConflictException {
        LocalDate date = LocalDate.now().plusDays(2);
        LocalTime start = LocalTime.of(10, 0);
        LocalTime end = LocalTime.of(11, 30);

        // Benchmark booking
        Booking b1 = bookingService.createBooking(employeeAlice, turingRoom, date, start, end, "Sprint Planning");
        assertNotNull(b1);

        // Attempt overlapping reservation (10:30 - 12:00)
        BookingConflictException ex = assertThrows(BookingConflictException.class, () ->
                bookingService.createBooking(managerBob, turingRoom, date,
                        LocalTime.of(10, 30), LocalTime.of(12, 0), "Architecture Review"));

        assertEquals(turingRoom.getId(), ex.getResourceId());
        assertEquals(date, ex.getDate());
        assertEquals(LocalTime.of(10, 30), ex.getRequestedStart());
        assertEquals(b1.getId(), ex.getConflictingBookingId());
    }

    @Test
    @DisplayName("Rule 1: Adjacent reservations touch at endpoints without conflict")
    void testRule1AdjacentSlotsSucceed() throws BookingConflictException {
        LocalDate date = LocalDate.now().plusDays(3);

        // 10:00 - 11:00
        Booking first = bookingService.createBooking(employeeAlice, turingRoom, date,
                LocalTime.of(10, 0), LocalTime.of(11, 0), "Session 1");

        // 11:00 - 12:00 (Starts exactly when previous ends)
        Booking second = bookingService.createBooking(managerBob, turingRoom, date,
                LocalTime.of(11, 0), LocalTime.of(12, 0), "Session 2");

        // 09:00 - 10:00 (Ends exactly when first starts)
        Booking third = bookingService.createBooking(adminCharlie, turingRoom, date,
                LocalTime.of(9, 0), LocalTime.of(10, 0), "Early Sync");

        assertNotNull(first);
        assertNotNull(second);
        assertNotNull(third);
        assertEquals(3, bookingService.getBookingsForResource(turingRoom.getId(), date).size());
    }

    @Test
    @DisplayName("Rule 1: Cancelled bookings do not trigger conflict")
    void testRule1CancelledBookingDoesNotConflict() throws BookingConflictException {
        LocalDate date = LocalDate.now().plusDays(4);

        Booking b1 = bookingService.createBooking(employeeAlice, turingRoom, date,
                LocalTime.of(14, 0), LocalTime.of(15, 0), "Tentative Meeting");

        // Cancel the booking
        bookingService.cancelBooking(b1.getId(), employeeAlice);
        assertEquals(BookingStatus.CANCELLED, b1.getStatus());

        // New booking in the exact same slot must succeed
        Booking b2 = bookingService.createBooking(managerBob, turingRoom, date,
                LocalTime.of(14, 0), LocalTime.of(15, 0), "Replacement Meeting");

        assertNotNull(b2);
        assertEquals(BookingStatus.CONFIRMED, b2.getStatus());
    }

    // =========================================================================
    // BUSINESS RULE 2: Operational Bounds, Duration & Role Caps (Unchecked Exception)
    // =========================================================================

    @Test
    @DisplayName("Rule 2: Booking outside 08:00 - 20:00 operating hours throws InvalidBookingException")
    void testRule2OutsideOperatingHoursThrowsException() {
        LocalDate date = LocalDate.now().plusDays(2);

        // Too early (07:00)
        InvalidBookingException exEarly = assertThrows(InvalidBookingException.class, () ->
                bookingService.createBooking(employeeAlice, turingRoom, date,
                        LocalTime.of(7, 30), LocalTime.of(8, 30), "Early Bird"));
        assertEquals("OUT_OF_OPERATING_HOURS", exEarly.getErrorCode());

        // Too late (ends after 20:00)
        InvalidBookingException exLate = assertThrows(InvalidBookingException.class, () ->
                bookingService.createBooking(employeeAlice, turingRoom, date,
                        LocalTime.of(19, 30), LocalTime.of(20, 30), "Late Evening"));
        assertEquals("OUT_OF_OPERATING_HOURS", exLate.getErrorCode());
    }

    @Test
    @DisplayName("Rule 2: Booking in past date throws InvalidBookingException")
    void testRule2PastDateThrowsException() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        InvalidBookingException ex = assertThrows(InvalidBookingException.class, () ->
                bookingService.createBooking(employeeAlice, turingRoom, yesterday,
                        LocalTime.of(10, 0), LocalTime.of(11, 0), "Past Event"));

        assertEquals("PAST_DATE", ex.getErrorCode());
    }

    @Test
    @DisplayName("Rule 2: Booking beyond 90-day ceiling throws InvalidBookingException")
    void testRule2AdvanceCeilingThrowsException() {
        LocalDate farFuture = LocalDate.now().plusDays(95);

        InvalidBookingException ex = assertThrows(InvalidBookingException.class, () ->
                bookingService.createBooking(employeeAlice, turingRoom, farFuture,
                        LocalTime.of(10, 0), LocalTime.of(11, 0), "Far Ahead"));

        assertEquals("ADVANCE_LIMIT_EXCEEDED", ex.getErrorCode());
    }

    @Test
    @DisplayName("Rule 2: Start time after or equal to end time throws InvalidBookingException")
    void testRule2InvalidTimeSequenceThrowsException() {
        LocalDate date = LocalDate.now().plusDays(2);

        InvalidBookingException ex = assertThrows(InvalidBookingException.class, () ->
                bookingService.createBooking(employeeAlice, turingRoom, date,
                        LocalTime.of(14, 0), LocalTime.of(13, 0), "Inverted Slot"));

        assertEquals("INVALID_TIME_SEQUENCE", ex.getErrorCode());
    }

    @Test
    @DisplayName("Rule 2: Duration below 15-minute floor throws InvalidBookingException")
    void testRule2MinDurationViolationThrowsException() {
        LocalDate date = LocalDate.now().plusDays(2);

        InvalidBookingException ex = assertThrows(InvalidBookingException.class, () ->
                bookingService.createBooking(employeeAlice, turingRoom, date,
                        LocalTime.of(10, 0), LocalTime.of(10, 10), "Quick 10min"));

        assertEquals("MIN_DURATION_VIOLATION", ex.getErrorCode());
    }

    @Test
    @DisplayName("Rule 2: Exceeding user role duration cap throws InvalidBookingException")
    void testRule2RoleDurationLimitExceeded() {
        LocalDate date = LocalDate.now().plusDays(2);

        // Employee has 4-hour max cap. Attempt 5 hours (09:00 - 14:00)
        InvalidBookingException exEmp = assertThrows(InvalidBookingException.class, () ->
                bookingService.createBooking(employeeAlice, turingRoom, date,
                        LocalTime.of(9, 0), LocalTime.of(14, 0), "Employee 5 Hours"));
        assertEquals("ROLE_DURATION_LIMIT_EXCEEDED", exEmp.getErrorCode());

        // Admin has 24-hour cap -> 5 hours succeeds
        assertDoesNotThrow(() ->
                bookingService.createBooking(adminCharlie, turingRoom, date,
                        LocalTime.of(9, 0), LocalTime.of(14, 0), "Admin 5 Hours"));
    }

    // =========================================================================
    // Resource Catalog & Authorization Exceptions
    // =========================================================================

    @Test
    @DisplayName("Querying non-existent resource throws ResourceNotFoundException")
    void testResourceNotFoundException() {
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () ->
                resourceService.getResourceById("RES-UNKNOWN-999"));

        assertEquals("RES-UNKNOWN-999", ex.getResourceId());
    }

    @Test
    @DisplayName("Standard employee cannot approve bookings (throws UnauthorizedBookingException)")
    void testUnauthorizedApprovalByEmployee() throws BookingConflictException {
        // Create pending booking on restricted boardroom
        Booking pending = bookingService.createBooking(employeeAlice, restrictedBoardroom,
                LocalDate.now().plusDays(3), LocalTime.of(10, 0), LocalTime.of(11, 0), "VIP Review");
        assertEquals(BookingStatus.PENDING_APPROVAL, pending.getStatus());

        UnauthorizedBookingException ex = assertThrows(UnauthorizedBookingException.class, () ->
                approvalService.approveBooking(pending.getId(), employeeAlice));

        assertTrue(ex.getMessage().contains("does not possess approval authority"));
    }

    // =========================================================================
    // MENU RESILIENCE & ERROR RECOVERY
    // =========================================================================

    @Test
    @DisplayName("Menu recovers safely from errors without crashing or exiting prematurely")
    void testMenuRecoversAfterErrors() {
        // Simulate interactive menu input feeding:
        // 1. Invalid option "99" (triggers error handling and recovery)
        // 2. Non-numeric input "invalid_text" (triggers NumberFormatException and recovery)
        // 3. Option 7: Run Automated Error Recovery Demonstration (exercises all 5 scenarios)
        // 4. Option 0: Exit
        String simulatedInput = "99\ninvalid_text\n7\n0\n";
        InputStream in = new ByteArrayInputStream(simulatedInput.getBytes());
        Scanner testScanner = new Scanner(in);

        ConsoleMenu menu = new ConsoleMenu(bookingService, resourceService, userService, approvalService, testScanner);

        // Execute menu start - must run through all invalid inputs and exit gracefully
        assertDoesNotThrow(menu::start, "Console menu must catch all exceptions and recover smoothly");
        assertFalse(menu.isRunning(), "Menu terminates only upon option 0");
    }
}
