package com.bookmg.core;

import com.bookmg.core.model.*;
import com.bookmg.core.strategy.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Day 5 — BaseEntity, Role Hierarchy & Strategy Pattern")
class Day5HierarchyAndStrategyTest {

    private Employee employee;
    private Manager manager;
    private Admin admin;
    private Resource regularRoom;
    private Resource restrictedBoardroom;

    @BeforeEach
    void setup() {
        User.resetCounter(1000);
        Resource.resetCounter(1000);
        Booking.resetCounter(1000);

        employee = new Employee("Alice Developer", "alice@bookmg.com", "ENGINEERING");
        manager = new Manager("Bob Director", "bob@bookmg.com", "ENGINEERING");
        admin = new Admin("Charlie Admin", "charlie@bookmg.com", "IT");

        regularRoom = new MeetingRoom("Turing Room", ResourceType.MEETING_ROOM, 12, "Floor 2", false, "201", true);
        restrictedBoardroom = new Resource("Executive Suite", ResourceType.EXECUTIVE_BOARDROOM, 30, "Floor 5", true);
    }

    // =========================================================================
    // BaseEntity Inheritance Tests
    // =========================================================================

    @Test
    @DisplayName("All models extend BaseEntity and inherit audit timestamps")
    void testBaseEntityInheritance() {
        assertTrue(employee instanceof BaseEntity, "User must extend BaseEntity");
        assertTrue(regularRoom instanceof BaseEntity, "Resource must extend BaseEntity");

        Booking booking = new Booking(employee, regularRoom, LocalDate.now().plusDays(1),
                LocalTime.of(10, 0), LocalTime.of(11, 0), "1-on-1");
        assertTrue(booking instanceof BaseEntity, "Booking must extend BaseEntity");

        assertNotNull(employee.getCreatedAt());
        assertNotNull(employee.getUpdatedAt());
        assertTrue(employee.isActive());

        // Test state transition update
        employee.setActive(false);
        assertFalse(employee.isActive());
    }

    // =========================================================================
    // Role Hierarchy & Polymorphism Tests
    // =========================================================================

    @Test
    @DisplayName("Role hierarchy provides dynamic dispatch for permissions and limits")
    void testRoleHierarchyPolymorphism() {
        // Test via base User references
        User u1 = employee;
        User u2 = manager;
        User u3 = admin;

        // Role verification
        assertEquals(Role.ROLE_EMPLOYEE, u1.getRole());
        assertEquals(Role.ROLE_MANAGER, u2.getRole());
        assertEquals(Role.ROLE_ADMIN, u3.getRole());

        // Polymorphic approval rights
        assertFalse(u1.canApproveBookings(), "Employee cannot approve bookings");
        assertTrue(u2.canApproveBookings(), "Manager can approve bookings");
        assertTrue(u3.canApproveBookings(), "Admin can approve bookings");

        // Polymorphic booking duration limits
        assertEquals(4, u1.getMaxBookingHours(), "Employee limited to 4 hours");
        assertEquals(8, u2.getMaxBookingHours(), "Manager limited to 8 hours");
        assertEquals(24, u3.getMaxBookingHours(), "Admin has 24 hours unrestricted limit");

        // Manager departmental scoping
        assertTrue(manager.canApproveForDepartment("ENGINEERING"));
        assertFalse(manager.canApproveForDepartment("MARKETING"));
    }

    @Test
    @DisplayName("Resource hierarchy adds specialized properties")
    void testResourceHierarchy() {
        MeetingRoom room = new MeetingRoom("Lovelace Room", ResourceType.CONFERENCE_ROOM, 16,
                "Floor 3", false, "305", true);
        Equipment equip = new Equipment("4K Laser Projector", ResourceType.AV_EQUIPMENT, 1,
                "IT Depot", false, "SN-98231", true);

        assertEquals("305", room.getRoomNumber());
        assertTrue(room.isVideoConferenceEnabled());
        assertEquals("SN-98231", equip.getSerialNumber());
        assertTrue(equip.isPortable());
    }

    // =========================================================================
    // Strategy Pattern Tests
    // =========================================================================

    @Test
    @DisplayName("AutoApprovalStrategy immediately confirms standard resources")
    void testAutoApprovalStrategy() {
        ApprovalStrategy autoStrategy = new AutoApprovalStrategy();
        Booking booking = new Booking(employee, regularRoom, LocalDate.now().plusDays(2),
                LocalTime.of(14, 0), LocalTime.of(15, 0), "Sync");

        BookingStatus status = autoStrategy.evaluateApproval(booking, employee, regularRoom);
        assertEquals(BookingStatus.CONFIRMED, status);
        assertEquals("AUTO_APPROVAL", autoStrategy.getStrategyName());
    }

    @Test
    @DisplayName("ManagerApprovalStrategy requires approval for employee on restricted asset")
    void testManagerApprovalStrategyEmployee() {
        ApprovalStrategy managerStrategy = new ManagerApprovalStrategy();
        Booking booking = new Booking(employee, restrictedBoardroom, LocalDate.now().plusDays(3),
                LocalTime.of(9, 0), LocalTime.of(11, 0), "All Hands");

        BookingStatus status = managerStrategy.evaluateApproval(booking, employee, restrictedBoardroom);
        assertEquals(BookingStatus.PENDING_APPROVAL, status);
        assertEquals("MANAGER_APPROVAL_GATEWAY", managerStrategy.getStrategyName());
    }

    @Test
    @DisplayName("ManagerApprovalStrategy auto-confirms when requester is Admin")
    void testManagerApprovalStrategyAdminBypass() {
        ApprovalStrategy managerStrategy = new ManagerApprovalStrategy();
        Booking booking = new Booking(admin, restrictedBoardroom, LocalDate.now().plusDays(3),
                LocalTime.of(9, 0), LocalTime.of(11, 0), "Executive Briefing");

        BookingStatus status = managerStrategy.evaluateApproval(booking, admin, restrictedBoardroom);
        assertEquals(BookingStatus.CONFIRMED, status, "Admin overrides restricted approval requirement");
    }

    @Test
    @DisplayName("ApprovalPolicyEngine dynamically resolves appropriate strategy")
    void testApprovalPolicyEngineResolution() {
        ApprovalStrategy s1 = ApprovalPolicyEngine.resolveStrategy(regularRoom);
        ApprovalStrategy s2 = ApprovalPolicyEngine.resolveStrategy(restrictedBoardroom);

        assertInstanceOf(AutoApprovalStrategy.class, s1);
        assertInstanceOf(ManagerApprovalStrategy.class, s2);
    }

    @Test
    @DisplayName("Recurrence Strategy implementations generate correct calendar series")
    void testRecurrenceStrategies() {
        LocalDate start = LocalDate.of(2026, 11, 1);
        LocalDate untilDaily = LocalDate.of(2026, 11, 5);
        LocalDate untilWeekly = LocalDate.of(2026, 11, 29);

        RecurrenceStrategy daily = new DailyRecurrenceStrategy();
        List<LocalDate> dailyDates = daily.generateDates(start, untilDaily);
        assertEquals(5, dailyDates.size(), "Nov 1 to Nov 5 daily should have 5 dates");
        assertEquals("DAILY", daily.getRecurrenceName());

        RecurrenceStrategy weekly = new WeeklyRecurrenceStrategy();
        List<LocalDate> weeklyDates = weekly.generateDates(start, untilWeekly);
        assertEquals(5, weeklyDates.size(), "Nov 1, 8, 15, 22, 29 should have 5 dates");
        assertEquals("WEEKLY", weekly.getRecurrenceName());
    }
}
