package com.bookmg.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilisationReportResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private long totalBookings;
    private double totalHoursBooked;
    private double overallUtilisationRatePercent;
    private double noShowRatePercent;
    private long noShowCount;
    private List<DepartmentStats> departmentBreakdown;
    private List<ResourceUtilisationStats> resourceBreakdown;
    private Map<Integer, Long> hourlyPeakDistribution;
}
