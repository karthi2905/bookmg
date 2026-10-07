package com.bookmg.booking.controller;

import com.bookmg.booking.dto.UtilisationReportResponse;
import com.bookmg.booking.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Endpoints for resource utilisation, department analytics, and peak usage trends")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/utilisation")
    @Operation(summary = "Generate comprehensive resource utilisation metrics, no-show rate, and hourly peak distribution")
    public ResponseEntity<UtilisationReportResponse> getUtilisationReport(
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        UtilisationReportResponse report = reportService.generateUtilisationReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }
}
