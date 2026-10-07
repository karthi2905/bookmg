package com.bookmg.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponse {
    private Long resourceId;
    private String resourceName;
    private LocalDate date;
    private int workingHoursStart;
    private int workingHoursEnd;
    private List<TimeSlotDto> bookedSlots;
    private List<TimeSlotDto> availableSlots;
}
