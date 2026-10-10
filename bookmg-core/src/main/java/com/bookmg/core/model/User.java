package com.bookmg.core.model;

/**
 * Abstract domain entity representing an enterprise user eligible to interact with BookMg.
 * Extends BaseEntity to inherit unified identity and audit timestamps.
 *
 * Serves as the base class for the polymorphic role hierarchy:
 *   - {@link Employee}
 *   - {@link Manager}
 *   - {@link Admin}
 */
public abstract class User extends BaseEntity {
    private static int userCounter = 1000;

    protected String name;
    protected String email;
    protected String department;

    /**
     * Default constructor for frameworks and serialization.
     */
    protected User() {
        super();
    }

    /**
     * Convenience constructor generating automatic sequential ID.
     */
    protected User(String name, String email, String department) {
        this(generateNextId(), name, email, department);
    }

    /**
     * Primary base constructor with encapsulation validation.
     *
     * @param id         unique user identifier
     * @param name       full name of the employee
     * @param email      corporate email
     * @param department assigned organizational unit
     */
    protected User(String id, String name, String email, String department) {
        super(id);
        setName(name);
        setEmail(email);
        setDepartment(department);
    }

    /**
     * Static factory method to instantiate the appropriate concrete subclass based on Role.
     */
    public static User of(String name, String email, Role role, String department) {
        return of(generateNextId(), name, email, role, department);
    }

    /**
     * Static factory method to instantiate concrete subclass with explicit ID.
     */
    public static User of(String id, String name, String email, Role role, String department) {
        if (role == null) {
            throw new IllegalArgumentException("User role cannot be null");
        }
        return switch (role) {
            case ROLE_EMPLOYEE -> new Employee(id, name, email, department);
            case ROLE_MANAGER -> new Manager(id, name, email, department);
            case ROLE_ADMIN -> new Admin(id, name, email, department);
        };
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

    // =========================================================================
    // Polymorphic Abstract Contract
    // =========================================================================

    /**
     * Returns the assigned role for this user subclass.
     */
    public abstract Role getRole();

    /**
     * Indicates whether this user possesses authority to review and approve restricted bookings.
     */
    public abstract boolean canApproveBookings();

    /**
     * Maximum duration in hours this user may reserve a resource in a single booking.
     */
    public abstract int getMaxBookingHours();

    /**
     * Human-readable summary of privileges associated with this user's role.
     */
    public abstract String displayRoleSummary();

    // =========================================================================
    // Encapsulated Properties
    // =========================================================================

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("User name cannot be blank");
        }
        this.name = name.trim();
        markUpdated();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (email == null || !email.contains("@") || !email.contains(".")) {
            throw new IllegalArgumentException("Invalid corporate email address: " + email);
        }
        this.email = email.trim().toLowerCase();
        markUpdated();
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        if (department == null || department.trim().isEmpty()) {
            throw new IllegalArgumentException("Department cannot be blank");
        }
        this.department = department.trim().toUpperCase();
        markUpdated();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User that)) return false;
        return java.util.Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("%s[id='%s', name='%s', email='%s', role=%s, dept='%s']",
                getClass().getSimpleName(), id, name, email, getRole(), department);
    }
}
