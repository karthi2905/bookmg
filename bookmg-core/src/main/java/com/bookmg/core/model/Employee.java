package com.bookmg.core.model;

/**
 * Concrete user subclass representing standard corporate employees.
 * Demonstrates inheritance, constructor chaining using super, and method overriding.
 */
public class Employee extends User {

    public Employee() {
        super();
    }

    public Employee(String name, String email, String department) {
        super(name, email, department);
    }

    public Employee(String id, String name, String email, String department) {
        super(id, name, email, department);
    }

    @Override
    public Role getRole() {
        return Role.ROLE_EMPLOYEE;
    }

    @Override
    public boolean canApproveBookings() {
        return false;
    }

    @Override
    public int getMaxBookingHours() {
        return 4;
    }

    @Override
    public String displayRoleSummary() {
        return "Employee: standard access to open meeting rooms and resources up to 4 hours per slot.";
    }
}
