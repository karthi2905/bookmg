package com.bookmg.core.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Day 4 — Core Entity Models (User, Resource, Booking)")
class Day4EntityModelTest {

    @BeforeEach
    void setup() {
        User.resetCounter(1000);
        Resource.resetCounter(1000);
        Booking.resetCounter(1000);
    }

    // =========================================================================
    // User Entity Tests
    // =========================================================================

    @Test
    @DisplayName("User constructor chaining generates sequential IDs")
    void testUserConstructorChainingAndSequentialId() {
        User u1 = User.of("Alice Smith", "alice@bookmg.com", Role.ROLE_EMPLOYEE, "Engineering");
        User u2 = User.of("Bob Manager", "bob@bookmg.com", Role.ROLE_MANAGER, "Sales");

        assertEquals("USR-1001", u1.getId());
        assertEquals("USR-1002", u2.getId());
        assertEquals("Alice Smith", u1.getName());
        assertEquals("alice@bookmg.com", u1.getEmail());
        assertEquals(Role.ROLE_EMPLOYEE, u1.getRole());
        assertEquals("ENGINEERING", u1.getDepartment());
    }

    @Test
    @DisplayName("User encapsulation rejects blank name or invalid email")
    void testUserEncapsulationValidation() {
        assertThrows(IllegalArgumentException.class,
                () -> User.of("", "valid@bookmg.com", Role.ROLE_EMPLOYEE, "IT"));

        assertThrows(IllegalArgumentException.class,
                () -> User.of("Valid Name", "invalid-email-address", Role.ROLE_EMPLOYEE, "IT"));

        assertThrows(IllegalArgumentException.class,
                () -> User.of("Valid Name", "valid@bookmg.com", null, "IT"));
    }

    @Test
    @DisplayName("User equals and hashCode depend on unique ID")
    void testUserEqualsAndHashCode() {
        User u1 = User.of("USR-999", "Alice", "alice@bookmg.com", Role.ROLE_EMPLOYEE, "IT");
        User u2 = User.of("USR-999", "Alice Modified", "alice2@bookmg.com", Role.ROLE_MANAGER, "HR");
        User u3 = User.of("USR-888", "Alice", "alice@bookmg.com", Role.ROLE_EMPLOYEE, "IT");

        assertEquals(u1, u2);
        assertEquals(u1.hashCode(), u2.hashCode());
        assertNotEquals(u1, u3);
    }

    // =========================================================================
    // Resource Entity Tests
    // =========================================================================

    @Test
    @DisplayName("Resource constructor chaining generates sequential IDs")
    void testResourceConstructorChainingAndSequentialId() {
        Resource r1 = new Resource("Turing Room", ResourceType.MEETING_ROOM, 10, "Floor 2", false);
        Resource r2 = new Resource("Executive Boardroom", ResourceType.EXECUTIVE_BOARDROOM, 25, "Floor 5", true);

        assertEquals("RES-1001", r1.getId());
        assertEquals("RES-1002", r2.getId());
        assertFalse(r1.isRestricted());
        assertTrue(r2.isRestricted());
        assertEquals(10, r1.getCapacity());
    }

    @Test
    @DisplayName("Resource encapsulation rejects non-positive capacity and blank name")
    void testResourceEncapsulationValidation() {
        assertThrows(IllegalArgumentException.class,
                () -> new Resource("Invalid Room", ResourceType.MEETING_ROOM, 0, "Floor 1", false));

        assertThrows(IllegalArgumentException.class,
                () -> new Resource("Invalid Room", ResourceType.MEETING_ROOM, -5, "Floor 1", false));

        assertThrows(IllegalArgumentException.class,
                () -> new Resource("   ", ResourceType.MEETING_ROOM, 10, "Floor 1", false));
    }

    @Test
    @DisplayName("Resource equals and hashCode depend on unique ID")
    void testResourceEqualsAndHashCode() {
        Resource r1 = new Resource("RES-500", "Room A", ResourceType.MEETING_ROOM, 10, "Building 1", false);
        Resource r2 = new Resource("RES-500", "Room B", ResourceType.TRAINING_LAB, 30, "Building 2", true);

        assertEquals(r1, r2);
        assertEquals(r1.hashCode(), r2.hashCode());
    }

    // =========================================================================
    // Booking Entity Tests
    // =========================================================================

    @Test
    @DisplayName("Booking constructor chaining, ID generation and defaults")
    void testBookingConstructorChaining() {
        User user = User.of("Alice", "alice@bookmg.com", Role.ROLE_EMPLOYEE, "Engineering");
        Resource resource = new Resource("Ada Lab", ResourceType.TRAINING_LAB, 20, "Floor 3", true);
        LocalDate date = LocalDate.now().plusDays(2);
        LocalTime start = LocalTime.of(10, 0);
        LocalTime end = LocalTime.of(11, 30);

        Booking booking = new Booking(user, resource, date, start, end, "Sprint Retro");

        assertEquals("BKG-1001", booking.getId());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());
        assertEquals("Sprint Retro", booking.getPurpose());
        assertEquals(user, booking.getUser());
        assertEquals(resource, booking.getResource());
    }

    @Test
    @DisplayName("Booking validates start time must be before end time")
    void testBookingIntervalValidation() {
        User user = User.of("Alice", "alice@bookmg.com", Role.ROLE_EMPLOYEE, "Engineering");
        Resource resource = new Resource("Ada Lab", ResourceType.TRAINING_LAB, 20, "Floor 3", true);
        LocalDate date = LocalDate.now().plusDays(1);

        assertThrows(IllegalArgumentException.class, () ->
                new Booking(user, resource, date, LocalTime.of(14, 0), LocalTime.of(13, 0), "Backwards time"));

        assertThrows(IllegalArgumentException.class, () ->
                new Booking(user, resource, date, LocalTime.of(14, 0), LocalTime.of(14, 0), "Equal start and end"));
    }

    @Test
    @DisplayName("Booking natural ordering implements Comparable by date and time")
    void testBookingComparable() {
        User user = User.of("Alice", "alice@bookmg.com", Role.ROLE_EMPLOYEE, "Engineering");
        Resource resource = new Resource("Room", ResourceType.MEETING_ROOM, 10, "Floor 1", false);
        LocalDate today = LocalDate.now();

        Booking b1 = new Booking("BKG-01", user, resource, today, LocalTime.of(14, 0), LocalTime.of(15, 0),
                BookingStatus.CONFIRMED, "Afternoon", null);
        Booking b2 = new Booking("BKG-02", user, resource, today, LocalTime.of(9, 0), LocalTime.of(10, 0),
                BookingStatus.CONFIRMED, "Morning", null);
        Booking b3 = new Booking("BKG-03", user, resource, today.plusDays(1), LocalTime.of(8, 0), LocalTime.of(9, 0),
                BookingStatus.CONFIRMED, "Tomorrow", null);

        List<Booking> list = new ArrayList<>(List.of(b1, b2, b3));
        Collections.sort(list);

        assertEquals("BKG-02", list.get(0).getId(), "Today morning should be first");
        assertEquals("BKG-01", list.get(1).getId(), "Today afternoon should be second");
        assertEquals("BKG-03", list.get(2).getId(), "Tomorrow should be third");
    }

    @Test
    @DisplayName("Booking interval overlap formula behaves accurately")
    void testBookingOverlapCalculation() {
        User user = User.of("Alice", "alice@bookmg.com", Role.ROLE_EMPLOYEE, "Engineering");
        Resource resource = new Resource("Room", ResourceType.MEETING_ROOM, 10, "Floor 1", false);
        LocalDate today = LocalDate.now();

        Booking existing = new Booking(user, resource, today, LocalTime.of(10, 0), LocalTime.of(11, 0), "Team Sync");

        // Overlapping requests
        assertTrue(existing.overlaps(today, LocalTime.of(10, 30), LocalTime.of(11, 30)), "Partial right overlap");
        assertTrue(existing.overlaps(today, LocalTime.of(9, 30), LocalTime.of(10, 30)), "Partial left overlap");
        assertTrue(existing.overlaps(today, LocalTime.of(9, 0), LocalTime.of(12, 0)), "Complete containment");
        assertTrue(existing.overlaps(today, LocalTime.of(10, 15), LocalTime.of(10, 45)), "Inside existing");

        // Non-overlapping (adjacent) requests
        assertFalse(existing.overlaps(today, LocalTime.of(9, 0), LocalTime.of(10, 0)), "Adjacent before ends at 10:00");
        assertFalse(existing.overlaps(today, LocalTime.of(11, 0), LocalTime.of(12, 0)), "Adjacent after starts at 11:00");
        assertFalse(existing.overlaps(today.plusDays(1), LocalTime.of(10, 0), LocalTime.of(11, 0)), "Different date");
    }
}
