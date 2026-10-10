package com.bookmg.core.model;

import java.util.Objects;

/**
 * Domain entity representing a reservable meeting room, laboratory, or AV equipment.
 * Demonstrates encapsulation, input validation, constructor chaining, static ID generation,
 * and standard object contracts.
 */
public class Resource {
    private static int resourceCounter = 1000;

    private String id;
    private String name;
    private ResourceType type;
    private int capacity;
    private String location;
    private boolean restricted;

    /**
     * Default constructor for serialization / framework reflection.
     */
    public Resource() {
    }

    /**
     * Convenience constructor chaining to full constructor with static ID generation.
     *
     * @param name       human-readable resource label
     * @param type       classification of the resource
     * @param capacity   maximum attendee / occupancy limit
     * @param location   physical campus building or floor
     * @param restricted whether reservation requires managerial authorization
     */
    public Resource(String name, ResourceType type, int capacity, String location, boolean restricted) {
        this(generateNextId(), name, type, capacity, location, restricted);
    }

    /**
     * Full primary constructor with encapsulation validations.
     *
     * @param id         unique resource identifier
     * @param name       human-readable resource label
     * @param type       classification of the resource
     * @param capacity   maximum attendee / occupancy limit
     * @param location   physical campus building or floor
     * @param restricted whether reservation requires managerial authorization
     */
    public Resource(String id, String name, ResourceType type, int capacity, String location, boolean restricted) {
        setId(id);
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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Resource ID cannot be null or empty");
        }
        this.id = id.trim();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Resource name cannot be blank");
        }
        this.name = name.trim();
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        if (type == null) {
            throw new IllegalArgumentException("Resource type cannot be null");
        }
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        if (capacity <= 0) {
            throw new IllegalArgumentException("Resource capacity must be greater than zero. Provided: " + capacity);
        }
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        if (location == null || location.trim().isEmpty()) {
            throw new IllegalArgumentException("Location cannot be blank");
        }
        this.location = location.trim();
    }

    public boolean isRestricted() {
        return restricted;
    }

    public void setRestricted(boolean restricted) {
        this.restricted = restricted;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Resource resource = (Resource) o;
        return Objects.equals(id, resource.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("Resource[id='%s', name='%s', type=%s, cap=%d, loc='%s', restricted=%b]",
                id, name, type, capacity, location, restricted);
    }
}
