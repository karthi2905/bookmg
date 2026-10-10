package com.bookmg.core.model;

import java.util.Objects;

/**
 * Domain entity representing an enterprise user eligible to reserve resources.
 * Demonstrates encapsulation, input validation, constructor chaining, static ID generation,
 * and standard object contracts.
 */
public class User {
    private static int userCounter = 1000;

    private String id;
    private String name;
    private String email;
    private Role role;
    private String department;

    /**
     * Default constructor for serialization / framework reflection.
     */
    public User() {
    }

    /**
     * Convenience constructor demonstrating constructor chaining and static counter ID generation.
     *
     * @param name       full name of the user
     * @param email      corporate email address
     * @param role       assigned authorization role
     * @param department organizational department
     */
    public User(String name, String email, Role role, String department) {
        this(generateNextId(), name, email, role, department);
    }

    /**
     * Full primary constructor with encapsulation validations.
     *
     * @param id         unique user identifier
     * @param name       full name of the user
     * @param email      corporate email address
     * @param role       assigned authorization role
     * @param department organizational department
     */
    public User(String id, String name, String email, Role role, String department) {
        setId(id);
        setName(name);
        setEmail(email);
        setRole(role);
        setDepartment(department);
    }

    /**
     * Generates a sequential unique user identifier.
     */
    public static synchronized String generateNextId() {
        return "USR-" + (++userCounter);
    }

    /**
     * Resets the static counter (useful in testing scenarios).
     */
    public static synchronized void resetCounter(int base) {
        userCounter = base;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        this.id = id.trim();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("User name cannot be blank");
        }
        this.name = name.trim();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (email == null || !email.contains("@") || !email.contains(".")) {
            throw new IllegalArgumentException("Invalid corporate email address: " + email);
        }
        this.email = email.trim().toLowerCase();
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        if (role == null) {
            throw new IllegalArgumentException("User role cannot be null");
        }
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        if (department == null || department.trim().isEmpty()) {
            throw new IllegalArgumentException("Department cannot be blank");
        }
        this.department = department.trim().toUpperCase();
    }

    /**
     * Overridable helper to determine if the user has approval permissions.
     */
    public boolean canApproveBookings() {
        return role == Role.ROLE_ADMIN || role == Role.ROLE_MANAGER;
    }

    /**
     * Overridable helper for maximum reservation hours.
     */
    public int getMaxBookingHours() {
        return switch (role) {
            case ROLE_ADMIN -> 24;
            case ROLE_MANAGER -> 8;
            case ROLE_EMPLOYEE -> 4;
        };
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("User[id='%s', name='%s', email='%s', role=%s, dept='%s']",
                id, name, email, role, department);
    }
}
