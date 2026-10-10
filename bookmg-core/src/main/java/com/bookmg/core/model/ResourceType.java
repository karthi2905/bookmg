package com.bookmg.core.model;

/**
 * Types of physical resources and facilities managed by BookMg.
 */
public enum ResourceType {
    MEETING_ROOM("Meeting Room", false),
    CONFERENCE_ROOM("Conference Room", false),
    EXECUTIVE_BOARDROOM("Executive Boardroom", true),
    TRAINING_LAB("Training Lab", true),
    AV_EQUIPMENT("AV & Video Equipment", false);

    private final String label;
    private final boolean defaultRestricted;

    ResourceType(String label, boolean defaultRestricted) {
        this.label = label;
        this.defaultRestricted = defaultRestricted;
    }

    public String getLabel() {
        return label;
    }

    public boolean isDefaultRestricted() {
        return defaultRestricted;
    }
}
