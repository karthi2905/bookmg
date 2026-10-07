package com.bookmg.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStats {
    private String department;
    private long bookingCount;
    private double totalHours;
    private double percentageOfTotal;
}
