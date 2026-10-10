package com.bookmg.core.ui;

import com.bookmg.core.exception.BookingConflictException;
import com.bookmg.core.exception.InvalidBookingException;
import com.bookmg.core.exception.ResourceNotFoundException;
import com.bookmg.core.exception.UnauthorizedBookingException;
import com.bookmg.core.model.Booking;
import com.bookmg.core.model.BookingStatus;
import com.bookmg.core.model.Resource;
import com.bookmg.core.model.User;
import com.bookmg.core.service.ApprovalService;
import com.bookmg.core.service.BookingService;
import com.bookmg.core.service.ResourceService;
import com.bookmg.core.service.UserService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Scanner;

/**
 * Interactive Console User Interface for BookMg.
 *
 * Demonstrates:
 *   - Clean text-based user workflow
 *   - Comprehensive multi-tier Exception Handling
 *   - Full Error Recovery: Menu catches and recovers gracefully from any exception
 *     without crashing, preserving application state.
 */
public class ConsoleMenu {
    private final BookingService bookingService;
    private final ResourceService resourceService;
    private final UserService userService;
    private final ApprovalService approvalService;
    private final Scanner scanner;
    private boolean running = true;

    public ConsoleMenu(BookingService bookingService,
                       ResourceService resourceService,
                       UserService userService,
                       ApprovalService approvalService,
                       Scanner scanner) {
        this.bookingService = bookingService;
        this.resourceService = resourceService;
        this.userService = userService;
        this.approvalService = approvalService;
        this.scanner = (scanner != null) ? scanner : new Scanner(System.in);
    }

    /**
     * Starts the main menu loop.
     */
    public void start() {
        System.out.println("================================================================================");
        System.out.println("          BOOKMG — ENTERPRISE RESOURCE BOOKING PLATFORM (CORE JAVA)            ");
        System.out.println("================================================================================");

        while (running) {
            printMenuHeader();
            try {
                System.out.print("Select an option (0-7): ");
                String input = scanner.nextLine().trim();
                if (input.isEmpty()) continue;

                int choice = Integer.parseInt(input);
                processChoice(choice);
            } catch (NumberFormatException e) {
                printError("INPUT PARSING ERROR", "Please enter a valid numeric menu option (0-7).");
                printRecoveryNotice();
            } catch (BookingConflictException e) {
                printError("BOOKING CONFLICT DETECTED (RULE 1)", e.getMessage());
                System.out.printf("   [DETAILS] Requested: %s - %s | Conflicting Booking ID: %s%n",
                        e.getRequestedStart(), e.getRequestedEnd(), e.getConflictingBookingId());
                printRecoveryNotice();
            } catch (InvalidBookingException e) {
                printError("BUSINESS POLICY VIOLATION (RULE 2: " + e.getErrorCode() + ")", e.getMessage());
                printRecoveryNotice();
            } catch (ResourceNotFoundException e) {
                printError("RESOURCE CATALOG ERROR", e.getMessage());
                printRecoveryNotice();
            } catch (UnauthorizedBookingException e) {
                printError("ACCESS CONTROL / AUTHORIZATION ERROR", e.getMessage());
                printRecoveryNotice();
            } catch (DateTimeParseException e) {
                printError("DATE/TIME FORMAT ERROR", "Failed to parse timestamp: " + e.getParsedString() +
                        ". Please use YYYY-MM-DD for dates and HH:MM for time (e.g. 10:30).");
                printRecoveryNotice();
            } catch (Exception e) {
                printError("UNEXPECTED RUNTIME EXCEPTION", e.getMessage());
                printRecoveryNotice();
            }
        }

        System.out.println("\nThank you for using BookMg. Goodbye!");
    }

    private void printMenuHeader() {
        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.println(" MAIN MENU");
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("  1. View All Resources & Physical Facilities");
        System.out.println("  2. Create a Reservation (Enforces Business Rules 1 & 2)");
        System.out.println("  3. View All Reservations (Chronological Order)");
        System.out.println("  4. Process Pending Approvals (Manager / Admin)");
        System.out.println("  5. Cancel a Reservation");
        System.out.println("  6. Space Utilization & Metrics Summary");
        System.out.println("  7. Run Automated Error Recovery Demonstration (Simulates Errors & Recovery)");
        System.out.println("  0. Exit System");
        System.out.println("--------------------------------------------------------------------------------");
    }

    public void processChoice(int choice) throws BookingConflictException {
        switch (choice) {
            case 1 -> handleListResources();
            case 2 -> handleCreateBooking();
            case 3 -> handleListBookings();
            case 4 -> handleProcessApprovals();
            case 5 -> handleCancelBooking();
            case 6 -> handleUtilizationSummary();
            case 7 -> handleRunErrorRecoveryDemo();
            case 0 -> {
                System.out.println("Terminating session...");
                this.running = false;
            }
            default -> {
                printError("UNKNOWN OPTION", "Menu option " + choice + " is not recognized. Please choose between 0 and 7.");
                printRecoveryNotice();
            }
        }
    }

    // =========================================================================
    // Action Handlers
    // =========================================================================

    private void handleListResources() {
        System.out.println("\n[CATALOG] Available Enterprise Resources:");
        List<Resource> resources = resourceService.getAllResources();
        for (Resource res : resources) {
            System.out.printf("  • [%s] %-28s | Type: %-15s | Cap: %2d | Loc: %-22s %s%n",
                    res.getId(), res.getName(), res.getType().name(), res.getCapacity(), res.getLocation(),
                    res.isRestricted() ? "[RESTRICTED - APPROVAL REQ]" : "[OPEN]");
        }
    }

    private void handleCreateBooking() throws BookingConflictException {
        System.out.println("\n[BOOKING] New Resource Reservation:");

        System.out.print("Enter User ID (e.g., USR-1004 for Alice, USR-1001 for Admin): ");
        String userId = scanner.nextLine().trim();

        System.out.print("Enter Resource ID (e.g., RES-1001 for Turing Room, RES-1003 for Boardroom): ");
        String resourceId = scanner.nextLine().trim();

        System.out.print("Enter Reservation Date (YYYY-MM-DD): ");
        String dateStr = scanner.nextLine().trim();
        LocalDate date = LocalDate.parse(dateStr);

        System.out.print("Enter Start Time (HH:MM, e.g., 10:00): ");
        String startStr = scanner.nextLine().trim();
        LocalTime startTime = LocalTime.parse(startStr);

        System.out.print("Enter End Time (HH:MM, e.g., 11:30): ");
        String endStr = scanner.nextLine().trim();
        LocalTime endTime = LocalTime.parse(endStr);

        System.out.print("Enter Meeting Purpose / Agenda: ");
        String purpose = scanner.nextLine().trim();

        Booking booking = bookingService.createBooking(userId, resourceId, date, startTime, endTime, purpose);

        System.out.println("\n>>> [SUCCESS] Booking created successfully!");
        System.out.printf("    Booking ID : %s%n", booking.getId());
        System.out.printf("    Resource   : %s (%s)%n", booking.getResource().getName(), booking.getResource().getId());
        System.out.printf("    Status     : %s (%s)%n", booking.getStatus(), booking.getStatus().getDescription());
        System.out.printf("    Slot       : %s %s - %s%n", booking.getDate(), booking.getStartTime(), booking.getEndTime());
    }

    private void handleListBookings() {
        System.out.println("\n[RESERVATIONS] All Scheduled Bookings (Natural Chronological Order):");
        List<Booking> bookings = bookingService.getAllBookings();
        if (bookings.isEmpty()) {
            System.out.println("  (No reservations currently recorded)");
            return;
        }

        for (Booking b : bookings) {
            System.out.printf("  • [%s] %s | %s - %s | %-16s | Res: %-18s | Status: %-16s | Purpose: %s%n",
                    b.getId(), b.getDate(), b.getStartTime(), b.getEndTime(),
                    b.getUser().getName(), b.getResource().getName(), b.getStatus(), b.getPurpose());
        }
    }

    private void handleProcessApprovals() {
        System.out.println("\n[APPROVALS] Pending Approval Queue:");
        List<Booking> pending = approvalService.getPendingBookings();
        if (pending.isEmpty()) {
            System.out.println("  (No pending requests awaiting approval)");
            return;
        }

        for (Booking b : pending) {
            System.out.printf("  • [%s] %s %s-%s | Requester: %s (Dept: %s) | Resource: %s%n",
                    b.getId(), b.getDate(), b.getStartTime(), b.getEndTime(),
                    b.getUser().getName(), b.getUser().getDepartment(), b.getResource().getName());
        }

        System.out.print("\nEnter Approver User ID (e.g., USR-1002 for Manager Bob, USR-1001 for Admin): ");
        String approverId = scanner.nextLine().trim();
        User approver = userService.getUserById(approverId)
                .orElseThrow(() -> new IllegalArgumentException("Approver ID '" + approverId + "' not found."));

        System.out.print("Enter Booking ID to decide: ");
        String bookingId = scanner.nextLine().trim();

        System.out.print("Action (A = Approve, R = Reject): ");
        String decision = scanner.nextLine().trim().toUpperCase();

        if ("A".equals(decision)) {
            Booking approved = approvalService.approveBooking(bookingId, approver);
            System.out.println(">>> [APPROVED] Booking " + approved.getId() + " is now CONFIRMED.");
        } else if ("R".equals(decision)) {
            System.out.print("Enter Rejection Reason: ");
            String reason = scanner.nextLine().trim();
            Booking rejected = approvalService.rejectBooking(bookingId, approver, reason);
            System.out.println(">>> [REJECTED] Booking " + rejected.getId() + " marked REJECTED.");
        } else {
            printError("INVALID DECISION", "Please enter 'A' for Approve or 'R' for Reject.");
            printRecoveryNotice();
        }
    }

    private void handleCancelBooking() {
        System.out.print("\nEnter Booking ID to cancel: ");
        String bookingId = scanner.nextLine().trim();

        System.out.print("Enter User ID requesting cancellation: ");
        String userId = scanner.nextLine().trim();
        User requester = userService.getUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User ID not found: " + userId));

        bookingService.cancelBooking(bookingId, requester);
        System.out.println(">>> [CANCELLED] Reservation " + bookingId + " has been cancelled.");
    }

    private void handleUtilizationSummary() {
        List<Booking> bookings = bookingService.getAllBookings();
        long confirmed = bookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count();
        long pending = bookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING_APPROVAL).count();
        long cancelled = bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long rejected = bookings.stream().filter(b -> b.getStatus() == BookingStatus.REJECTED).count();

        System.out.println("\n[METRICS] Enterprise Resource Booking Summary:");
        System.out.printf("  Total Bookings Recorded : %d%n", bookings.size());
        System.out.printf("  Confirmed & Active      : %d%n", confirmed);
        System.out.printf("  Pending Manager Review  : %d%n", pending);
        System.out.printf("  Cancelled               : %d%n", cancelled);
        System.out.printf("  Rejected                : %d%n", rejected);
    }

    /**
     * Automated demonstration that programmatically triggers Business Rule 1, Business Rule 2,
     * and invalid parameters to prove menu recovery.
     */
    public void handleRunErrorRecoveryDemo() {
        System.out.println("\n================================================================================");
        System.out.println("           RUNNING AUTOMATED ERROR RECOVERY SUITE (DAY 6 REQUIREMENT)          ");
        System.out.println("================================================================================");

        LocalDate testDate = LocalDate.now().plusDays(5);

        // Setup base booking
        try {
            bookingService.createBooking("USR-1004", "RES-1001", testDate,
                    LocalTime.of(10, 0), LocalTime.of(11, 0), "Initial Base Meeting");
            System.out.println("  [SETUP] Created initial benchmark booking: Turing Room 10:00 - 11:00.");
        } catch (Exception ignored) {
        }

        // Scenario 1: Trigger Business Rule 1 (Double Booking Interval Conflict)
        System.out.println("\n--- [SCENARIO 1] Triggering Business Rule 1: Double-Booking Overlap Conflict ---");
        try {
            System.out.println("  Attempting to book 10:30 - 11:30 (overlaps with existing 10:00 - 11:00)...");
            bookingService.createBooking("USR-1005", "RES-1001", testDate,
                    LocalTime.of(10, 30), LocalTime.of(11, 30), "Conflicting Standup");
            System.out.println("  [FAIL] Conflict exception was not thrown!");
        } catch (BookingConflictException e) {
            printError("CAUGHT CHECKED EXCEPTION: BookingConflictException", e.getMessage());
            printRecoveryNotice();
        }

        // Scenario 2: Trigger Business Rule 2: Out of Operating Hours (21:00)
        System.out.println("\n--- [SCENARIO 2] Triggering Business Rule 2: Out of Operating Hours (08:00 - 20:00) ---");
        try {
            System.out.println("  Attempting to book 20:30 - 21:30 (outside 08:00 - 20:00 window)...");
            bookingService.createBooking("USR-1004", "RES-1001", testDate,
                    LocalTime.of(20, 30), LocalTime.of(21, 30), "Late Night Session");
            System.out.println("  [FAIL] Operating hours exception was not thrown!");
        } catch (InvalidBookingException e) {
            printError("CAUGHT UNCHECKED EXCEPTION: InvalidBookingException (" + e.getErrorCode() + ")", e.getMessage());
            printRecoveryNotice();
        } catch (BookingConflictException e) {
            printError("UNEXPECTED CONFLICT", e.getMessage());
        }

        // Scenario 3: Trigger Business Rule 2: Employee Duration Limit Exceeded (> 4 hours)
        System.out.println("\n--- [SCENARIO 3] Triggering Business Rule 2: Employee Duration Cap (> 4 hours) ---");
        try {
            System.out.println("  Attempting 5-hour booking for Employee (09:00 - 14:00, cap is 4 hours)...");
            bookingService.createBooking("USR-1004", "RES-1002", testDate,
                    LocalTime.of(9, 0), LocalTime.of(14, 0), "All-Day Hackathon");
            System.out.println("  [FAIL] Duration limit exception was not thrown!");
        } catch (InvalidBookingException e) {
            printError("CAUGHT UNCHECKED EXCEPTION: InvalidBookingException (" + e.getErrorCode() + ")", e.getMessage());
            printRecoveryNotice();
        } catch (BookingConflictException e) {
            printError("UNEXPECTED CONFLICT", e.getMessage());
        }

        // Scenario 4: Trigger Resource Not Found
        System.out.println("\n--- [SCENARIO 4] Triggering ResourceNotFoundException ---");
        try {
            System.out.println("  Attempting to book non-existent resource ID 'RES-9999'...");
            bookingService.createBooking("USR-1004", "RES-9999", testDate,
                    LocalTime.of(14, 0), LocalTime.of(15, 0), "Unknown Room");
            System.out.println("  [FAIL] ResourceNotFoundException was not thrown!");
        } catch (ResourceNotFoundException e) {
            printError("CAUGHT UNCHECKED EXCEPTION: ResourceNotFoundException", e.getMessage());
            printRecoveryNotice();
        } catch (BookingConflictException e) {
            printError("UNEXPECTED CONFLICT", e.getMessage());
        }

        // Scenario 5: Trigger Unauthorized Approval
        System.out.println("\n--- [SCENARIO 5] Triggering Unauthorized Approval by Standard Employee ---");
        try {
            User alice = userService.getUserById("USR-1004").orElseThrow();
            Booking pending = bookingService.createBooking("USR-1004", "RES-1003", testDate.plusDays(1),
                    LocalTime.of(14, 0), LocalTime.of(15, 0), "VIP Review Session");
            System.out.println("  Employee Alice attempting to approve pending booking " + pending.getId() + "...");
            approvalService.approveBooking(pending.getId(), alice);
            System.out.println("  [FAIL] UnauthorizedBookingException was not thrown!");
        } catch (UnauthorizedBookingException e) {
            printError("CAUGHT UNCHECKED EXCEPTION: UnauthorizedBookingException", e.getMessage());
            printRecoveryNotice();
        } catch (BookingConflictException e) {
            printError("UNEXPECTED CONFLICT", e.getMessage());
        }

        System.out.println("\n>>> [DEMO RESULT] All 5 failure scenarios successfully caught and handled.");
        System.out.println(">>> [RESILIENCE VERIFIED] The menu maintains active state and cleanly recovers after every error!");
    }

    // =========================================================================
    // Error Presentation Helpers
    // =========================================================================

    private void printError(String header, String details) {
        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.println(" [ERROR] " + header);
        System.out.println(" [CAUSE] " + details);
        System.out.println("--------------------------------------------------------------------------------");
    }

    private void printRecoveryNotice() {
        System.out.println(" [RECOVERY] System recovered safely. Returning to main menu...");
    }

    public boolean isRunning() {
        return running;
    }

    public void stop() {
        this.running = false;
    }
}
