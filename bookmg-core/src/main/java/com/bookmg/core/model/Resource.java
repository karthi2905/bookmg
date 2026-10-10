package com.bookmg.core.model;

/**
 * Domain entity representing a reservable meeting room, laboratory, or AV equipment.
 * Extends BaseEntity to inherit unified identity, audit timestamps, and state tracking.
 */
public class Resource extends BaseEntity {
    private static int resourceCounter = 1000;

    protected String name;
    protected ResourceType type;
    protected int capacity;
    protected String location;
    protected boolean restricted;

    /**
     * Default constructor for frameworks and serialization.
     */
    public Resource() {
        super();
    }

    /**
     * Convenience constructor chaining to full constructor with static ID generation.
     */
    public Resource(String name, ResourceType type, int capacity, String location, boolean restricted) {
        this(generateNextId(), name, type, capacity, location, restricted);
    }

    /**
     * Full primary constructor with encapsulation validations.
     */
    public Resource(String id, String name, ResourceType type, int capacity, String location, boolean restricted) {
        super(id);
        setName(name);
        setType(type);
        setCapacity(capacity);
        setLocation(location);
        setRestricted(restricted);
    }

    /**
     * Generates a sequential unique resource identifier.
     */
    public static synchronized String generateNextId() {
        return "RES-" + (++resourceCounter);
    }

    /**
     * Resets the static counter (useful in testing scenarios).
     */
    public static synchronized void resetCounter(int base) {
        resourceCounter = base;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Resource name cannot be blank");
        }
        this.name = name.trim();
        markUpdated();
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        if (type == null) {
            throw new IllegalArgumentException("Resource type cannot be null");
        }
        this.type = type;
        markUpdated();
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        if (capacity <= 0) {
            throw new IllegalArgumentException("Resource capacity must be greater than zero. Provided: " + capacity);
        }
        this.capacity = capacity;
        markUpdated();
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        if (location == null || location.trim().isEmpty()) {
            throw new IllegalArgumentException("Location cannot be blank");
        }
        this.location = location.trim();
        markUpdated();
    }

    public boolean isRestricted() {
        return restricted;
    }

    public void setRestricted(boolean restricted) {
        this.restricted = restricted;
        markUpdated();
    }

    public String getDisplayDetails() {
        return String.format("[%s] %s (%s, Cap: %d, Loc: %s%s)",
                id, name, type.getLabel(), capacity, location,
                restricted ? ", RESTRICTED" : "");
    }

    @Override
    public String toString() {
        return String.format("Resource[id='%s', name='%s', type=%s, cap=%d, loc='%s', restricted=%b]",
                id, name, type, capacity, location, restricted);
    }
}
