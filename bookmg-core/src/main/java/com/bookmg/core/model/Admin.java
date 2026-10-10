package com.bookmg.core.model;

/**
 * Concrete user subclass representing system administrators with enterprise-wide authority.
 * Demonstrates inheritance, constructor chaining using super, and method overriding.
 */
public class Admin extends User {

    public Admin() {
        super();
    }

    public Admin(String name, String email, String department) {
        super(name, email, department);
    }

    public Admin(String id, String name, String email, String department) {
        super(id, name, email, department);
    }

    @Override
    public Role getRole() {
        return Role.ROLE_ADMIN;
    }

    @Override
    public boolean canApproveBookings() {
        return true;
    }

    @Override
    public int getMaxBookingHours() {
        return 24; // Unrestricted all-day reservations
    }

    @Override
    public String displayRoleSummary() {
        return "Administrator: global enterprise authority, cross-department approvals, and unrestricted reservations.";
    }
}
