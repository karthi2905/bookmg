package com.bookmg.core.model;

/**
 * Specialized Resource representing portable hardware / audiovisual equipment.
 */
public class Equipment extends Resource {
    private String serialNumber;
    private boolean portable;

    public Equipment(String name, ResourceType type, int capacity, String location,
                     boolean restricted, String serialNumber, boolean portable) {
        super(name, type, capacity, location, restricted);
        this.serialNumber = serialNumber;
        this.portable = portable;
    }

    public Equipment(String id, String name, ResourceType type, int capacity, String location,
                     boolean restricted, String serialNumber, boolean portable) {
        super(id, name, type, capacity, location, restricted);
        this.serialNumber = serialNumber;
        this.portable = portable;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
        markUpdated();
    }

    public boolean isPortable() {
        return portable;
    }

    public void setPortable(boolean portable) {
        this.portable = portable;
        markUpdated();
    }

    @Override
    public String getDisplayDetails() {
        return super.getDisplayDetails() + String.format(" [S/N: %s, Portable: %b]", serialNumber, portable);
    }
}
