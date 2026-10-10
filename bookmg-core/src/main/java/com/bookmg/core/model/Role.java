package com.bookmg.core.model;

/**
 * Standard enterprise user roles within the BookMg ecosystem.
 */
public enum Role {
    ROLE_EMPLOYEE("Employee", "Standard resource reservation permissions"),
    ROLE_MANAGER("Manager", "Department-level approval and extended reservation window"),
    ROLE_ADMIN("Administrator", "Unrestricted global resource management and approval authority");

    private final String displayName;
    private final String description;

    Role(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
