package com.bookmg.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotDto {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // "AVAILABLE" or "BOOKED"
    private String bookingTitle;
}
