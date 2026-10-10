package com.bookmg.core.model;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Abstract foundational entity establishing standard identity, audit timestamps,
 * and lifecycle attributes across all BookMg domain models.
 *
 * Demonstrates abstraction, code reusability, and common object contract implementation.
 */
public abstract class BaseEntity {
    protected String id;
    protected LocalDateTime createdAt;
    protected LocalDateTime updatedAt;
    protected boolean active;

    /**
     * Default constructor initializing audit timestamps and active state.
     */
    protected BaseEntity() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        this.active = true;
    }

    /**
     * Base constructor initializing identity along with audit timestamps.
     *
     * @param id unique system identifier
     */
    protected BaseEntity(String id) {
        this();
        setId(id);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Entity ID cannot be null or empty");
        }
        this.id = id.trim();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = (createdAt != null) ? createdAt : LocalDateTime.now();
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
        markUpdated();
    }

    /**
     * Touch helper updating the audit timestamp to the current instant.
     */
    public void markUpdated() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BaseEntity that = (BaseEntity) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("%s[id='%s', active=%b, createdAt=%s]",
                getClass().getSimpleName(), id, active, createdAt);
    }
}
