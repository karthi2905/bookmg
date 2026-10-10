package com.bookmg.core.model;

/**
 * Concrete user subclass representing department managers with approval authority.
 * Demonstrates inheritance, constructor chaining using super, and method overriding.
 */
public class Manager extends User {

    public Manager() {
        super();
    }

    public Manager(String name, String email, String department) {
        super(name, email, department);
    }

    public Manager(String id, String name, String email, String department) {
        super(id, name, email, department);
    }

    @Override
    public Role getRole() {
        return Role.ROLE_MANAGER;
    }

    @Override
    public boolean canApproveBookings() {
        return true;
    }

    @Override
    public int getMaxBookingHours() {
        return 8;
    }

    /**
     * Checks if this manager can approve requests from a specified department.
     * Managers can approve requests for their own department.
     */
    public boolean canApproveForDepartment(String targetDept) {
        if (targetDept == null) return false;
        return this.department.equalsIgnoreCase(targetDept.trim());
    }

    @Override
    public String displayRoleSummary() {
        return "Manager: departmental approval authority for " + department +
                " and extended reservation capacity up to 8 hours.";
    }
}
