package com.bookmg.booking.controller;

import com.bookmg.booking.dto.AvailabilityResponse;
import com.bookmg.booking.dto.BookingResponse;
import com.bookmg.booking.dto.CreateBookingRequest;
import com.bookmg.booking.security.UserPrincipal;
import com.bookmg.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Endpoints for resource bookings, recurring reservations, check-in, and calendar availability")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a single or recurring booking with atomic conflict detection")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        BookingResponse response = bookingService.createBooking(request, user);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking details by ID")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable(name = "id") Long id) {
        BookingResponse response = bookingService.getBookingById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @Operation(summary = "Get all bookings created by the authenticated user")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal UserPrincipal user) {
        List<BookingResponse> responses = bookingService.getUserBookings(user);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/resource/{resourceId}")
    @Operation(summary = "Get bookings for a specific resource within an optional time range")
    public ResponseEntity<List<BookingResponse>> getResourceBookings(
            @PathVariable(name = "resourceId") Long resourceId,
            @RequestParam(name = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(name = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        List<BookingResponse> responses = bookingService.getBookingsForResource(resourceId, start, end);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a specific booking")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable(name = "id") Long id,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        BookingResponse response = bookingService.cancelBooking(id, user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/series/{recurrenceGroupId}")
    @Operation(summary = "Cancel an entire recurring series of future bookings")
    public ResponseEntity<List<BookingResponse>> cancelRecurringSeries(
            @PathVariable(name = "recurrenceGroupId") String recurrenceGroupId,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        List<BookingResponse> responses = bookingService.cancelRecurringSeries(recurrenceGroupId, user);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/checkin")
    @Operation(summary = "Check in to a booked meeting room within the 15-min window")
    public ResponseEntity<BookingResponse> checkIn(
            @PathVariable(name = "id") Long id,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        BookingResponse response = bookingService.checkIn(id, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/availability")
    @Operation(summary = "Inspect daily booked and available open slots for a resource")
    public ResponseEntity<AvailabilityResponse> getAvailability(
            @RequestParam(name = "resourceId") Long resourceId,
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        AvailabilityResponse response = bookingService.getAvailability(resourceId, date);
        return ResponseEntity.ok(response);
    }
}
