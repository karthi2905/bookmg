package com.bookmg.booking.dto;

import com.bookmg.booking.model.Booking;
import com.bookmg.booking.model.BookingStatus;
import com.bookmg.booking.model.RecurrenceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String title;
    private String description;
    private Long resourceId;
    private String resourceName;
    private Long userId;
    private String userEmail;
    private String department;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
    private RecurrenceType recurrenceType;
    private String recurrenceGroupId;
    private boolean checkedIn;
    private LocalDateTime checkedInAt;
    private String approverEmail;
    private String approvalNote;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookingResponse fromEntity(Booking booking) {
        if (booking == null) {
            return null;
        }
        return BookingResponse.builder()
                .id(booking.getId())
                .title(booking.getTitle())
                .description(booking.getDescription())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .userId(booking.getUserId())
                .userEmail(booking.getUserEmail())
                .department(booking.getDepartment())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus())
                .recurrenceType(booking.getRecurrenceType())
                .recurrenceGroupId(booking.getRecurrenceGroupId())
                .checkedIn(booking.isCheckedIn())
                .checkedInAt(booking.getCheckedInAt())
                .approverEmail(booking.getApproverEmail())
                .approvalNote(booking.getApprovalNote())
                .rejectionReason(booking.getRejectionReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
