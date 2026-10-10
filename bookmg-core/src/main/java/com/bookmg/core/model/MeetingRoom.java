package com.bookmg.core.model;

/**
 * Specialized Resource representing a physical room equipped for meetings.
 */
public class MeetingRoom extends Resource {
    private String roomNumber;
    private boolean videoConferenceEnabled;

    public MeetingRoom(String name, ResourceType type, int capacity, String location,
                       boolean restricted, String roomNumber, boolean videoConferenceEnabled) {
        super(name, type, capacity, location, restricted);
        this.roomNumber = roomNumber;
        this.videoConferenceEnabled = videoConferenceEnabled;
    }

    public MeetingRoom(String id, String name, ResourceType type, int capacity, String location,
                       boolean restricted, String roomNumber, boolean videoConferenceEnabled) {
        super(id, name, type, capacity, location, restricted);
        this.roomNumber = roomNumber;
        this.videoConferenceEnabled = videoConferenceEnabled;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
        markUpdated();
    }

    public boolean isVideoConferenceEnabled() {
        return videoConferenceEnabled;
    }

    public void setVideoConferenceEnabled(boolean videoConferenceEnabled) {
        this.videoConferenceEnabled = videoConferenceEnabled;
        markUpdated();
    }

    @Override
    public String getDisplayDetails() {
        return super.getDisplayDetails() + String.format(" [Room: %s, VC: %b]", roomNumber, videoConferenceEnabled);
    }
}
