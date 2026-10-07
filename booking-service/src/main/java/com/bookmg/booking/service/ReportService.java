package com.bookmg.booking.service;

import com.bookmg.booking.dto.DepartmentStats;
import com.bookmg.booking.dto.ResourceUtilisationStats;
import com.bookmg.booking.dto.UtilisationReportResponse;
import com.bookmg.booking.model.Booking;
import com.bookmg.booking.model.BookingStatus;
import com.bookmg.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final BookingRepository bookingRepository;

    @Value("${booking.working-hours.start:9}")
    private int workingHoursStart;

    @Value("${booking.working-hours.end:18}")
    private int workingHoursEnd;

    @Transactional(readOnly = true)
    public UtilisationReportResponse generateUtilisationReport(LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(LocalTime.MAX);

        List<Booking> bookings = bookingRepository.findBookingsBetween(startDateTime, endDateTime);

        long totalBookings = bookings.size();

        double totalHoursBooked = bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED && b.getStatus() != BookingStatus.REJECTED)
                .mapToDouble(b -> Duration.between(b.getStartTime(), b.getEndTime()).toMinutes() / 60.0)
                .sum();

        long noShowCount = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.AUTO_RELEASED)
                .count();

        double noShowRatePercent = totalBookings > 0
                ? Math.round((noShowCount * 100.0 / totalBookings) * 10.0) / 10.0
                : 0.0;

        long daysInPeriod = Math.max(1, ChronoUnit.DAYS.between(start, end) + 1);
        double workingHoursPerDay = Math.max(1, workingHoursEnd - workingHoursStart);

        // Department Breakdown using Java Streams
        Map<String, List<Booking>> byDepartment = bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED && b.getStatus() != BookingStatus.REJECTED)
                .collect(Collectors.groupingBy(b -> b.getDepartment() != null ? b.getDepartment() : "GENERAL"));

        List<DepartmentStats> departmentBreakdown = byDepartment.entrySet().stream()
                .map(entry -> {
                    String dept = entry.getKey();
                    List<Booking> deptBookings = entry.getValue();
                    long count = deptBookings.size();
                    double hours = deptBookings.stream()
                            .mapToDouble(b -> Duration.between(b.getStartTime(), b.getEndTime()).toMinutes() / 60.0)
                            .sum();
                    double pct = totalHoursBooked > 0
                            ? Math.round((hours * 100.0 / totalHoursBooked) * 10.0) / 10.0
                            : 0.0;
                    return DepartmentStats.builder()
                            .department(dept)
                            .bookingCount(count)
                            .totalHours(Math.round(hours * 10.0) / 10.0)
                            .percentageOfTotal(pct)
                            .build();
                })
                .sorted(Comparator.comparingDouble(DepartmentStats::getTotalHours).reversed())
                .toList();

        // Resource Breakdown using Java Streams
        Map<Long, List<Booking>> byResource = bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED && b.getStatus() != BookingStatus.REJECTED)
                .collect(Collectors.groupingBy(Booking::getResourceId));

        List<ResourceUtilisationStats> resourceBreakdown = byResource.entrySet().stream()
                .map(entry -> {
                    Long resId = entry.getKey();
                    List<Booking> resBookings = entry.getValue();
                    String resName = resBookings.get(0).getResourceName();
                    long count = resBookings.size();
                    double hours = resBookings.stream()
                            .mapToDouble(b -> Duration.between(b.getStartTime(), b.getEndTime()).toMinutes() / 60.0)
                            .sum();
                    double totalAvailableResourceHours = daysInPeriod * workingHoursPerDay;
                    double utilPct = Math.min(100.0, Math.round((hours * 100.0 / totalAvailableResourceHours) * 10.0) / 10.0);

                    return ResourceUtilisationStats.builder()
                            .resourceId(resId)
                            .resourceName(resName)
                            .bookingCount(count)
                            .totalHours(Math.round(hours * 10.0) / 10.0)
                            .utilisationPercent(utilPct)
                            .build();
                })
                .sorted(Comparator.comparingDouble(ResourceUtilisationStats::getUtilisationPercent).reversed())
                .toList();

        // Overall Utilisation
        int uniqueResourcesCount = Math.max(1, byResource.size());
        double totalCapacityHours = daysInPeriod * workingHoursPerDay * uniqueResourcesCount;
        double overallUtilisationRate = totalCapacityHours > 0
                ? Math.min(100.0, Math.round((totalHoursBooked * 100.0 / totalCapacityHours) * 10.0) / 10.0)
                : 0.0;

        // Hourly Peak Distribution
        Map<Integer, Long> hourlyPeakDistribution = new TreeMap<>();
        for (int h = workingHoursStart; h <= workingHoursEnd; h++) {
            hourlyPeakDistribution.put(h, 0L);
        }

        bookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED && b.getStatus() != BookingStatus.REJECTED)
                .forEach(b -> {
                    int startHour = Math.max(workingHoursStart, b.getStartTime().getHour());
                    int endHour = Math.min(workingHoursEnd, b.getEndTime().getHour());
                    for (int h = startHour; h < endHour; h++) {
                        hourlyPeakDistribution.put(h, hourlyPeakDistribution.getOrDefault(h, 0L) + 1);
                    }
                });

        return UtilisationReportResponse.builder()
                .startDate(start)
                .endDate(end)
                .totalBookings(totalBookings)
                .totalHoursBooked(Math.round(totalHoursBooked * 10.0) / 10.0)
                .overallUtilisationRatePercent(overallUtilisationRate)
                .noShowRatePercent(noShowRatePercent)
                .noShowCount(noShowCount)
                .departmentBreakdown(departmentBreakdown)
                .resourceBreakdown(resourceBreakdown)
                .hourlyPeakDistribution(hourlyPeakDistribution)
                .build();
    }
}
