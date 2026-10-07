package com.bookmg.booking.controller;

import com.bookmg.booking.dto.ApprovalActionRequest;
import com.bookmg.booking.dto.BookingResponse;
import com.bookmg.booking.security.UserPrincipal;
import com.bookmg.booking.service.ApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
@Tag(name = "Approvals", description = "Endpoints for managing approval requests for restricted resources")
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "View queue of pending approval requests for restricted resources")
    public ResponseEntity<List<BookingResponse>> getPendingApprovals(
            @AuthenticationPrincipal UserPrincipal user
    ) {
        List<BookingResponse> pending = approvalService.getPendingApprovals(user);
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Approve a booking for a restricted resource")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable(name = "id") Long id,
            @RequestBody(required = false) ApprovalActionRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        BookingResponse response = approvalService.approveBooking(id, request, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Reject a booking request for a restricted resource with a reason")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable(name = "id") Long id,
            @RequestBody(required = false) ApprovalActionRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        BookingResponse response = approvalService.rejectBooking(id, request, user);
        return ResponseEntity.ok(response);
    }
}
