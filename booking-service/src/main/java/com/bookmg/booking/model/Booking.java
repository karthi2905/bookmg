package com.bookmg.booking.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_booking_resource_time", columnList = "resource_id, start_time, end_time"),
        @Index(name = "idx_booking_status", columnList = "status"),
        @Index(name = "idx_booking_user", columnList = "user_id"),
        @Index(name = "idx_booking_recurrence", columnList = "recurrence_group_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(name = "resource_name", nullable = false, length = 120)
    private String resourceName;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_email", nullable = false, length = 120)
    private String userEmail;

    @Column(name = "department", nullable = false, length = 50)
    private String department;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BookingStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type", nullable = false, length = 30)
    private RecurrenceType recurrenceType;

    @Column(name = "recurrence_group_id", length = 64)
    private String recurrenceGroupId;

    @Builder.Default
    @Column(name = "checked_in", nullable = false)
    private boolean checkedIn = false;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "approver_email", length = 120)
    private String approverEmail;

    @Column(name = "approval_note", length = 500)
    private String approvalNote;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Version
    @Column(name = "version")
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public TimeSlot toTimeSlot() {
        return new TimeSlot(startTime, endTime);
    }
}
