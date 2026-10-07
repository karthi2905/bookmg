package com.bookmg.booking.service;

import com.bookmg.booking.approval.ApprovalPolicyFactory;
import com.bookmg.booking.dto.ApprovalActionRequest;
import com.bookmg.booking.dto.BookingResponse;
import com.bookmg.booking.exception.BadRequestException;
import com.bookmg.booking.exception.ConflictException;
import com.bookmg.booking.exception.ResourceNotFoundException;
import com.bookmg.booking.model.Booking;
import com.bookmg.booking.model.BookingStatus;
import com.bookmg.booking.repository.BookingRepository;
import com.bookmg.booking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final BookingRepository bookingRepository;
    private final ApprovalPolicyFactory approvalPolicyFactory;

    @Transactional(readOnly = true)
    public List<BookingResponse> getPendingApprovals(UserPrincipal user) {
        List<Booking> pending;
        if ("ROLE_ADMIN".equals(user.getRole())) {
            pending = bookingRepository.findByStatusOrderByStartTimeAsc(BookingStatus.PENDING_APPROVAL);
        } else if ("ROLE_MANAGER".equals(user.getRole()) && user.getDepartment() != null) {
            pending = bookingRepository.findByStatusAndDepartmentIgnoreCaseOrderByStartTimeAsc(
                    BookingStatus.PENDING_APPROVAL, user.getDepartment()
            );
        } else {
            throw new BadRequestException("Only managers and admins can review approval queues");
        }

        return pending.stream().map(BookingResponse::fromEntity).toList();
    }

    @Transactional
    public BookingResponse approveBooking(Long id, ApprovalActionRequest request, UserPrincipal user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!approvalPolicyFactory.canApprove(user, booking.getDepartment())) {
            throw new BadRequestException("You do not have permission to approve bookings for department: " + booking.getDepartment());
        }

        if (booking.getStatus() != BookingStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Only PENDING_APPROVAL bookings can be approved. Current status: " + booking.getStatus());
        }

        // Re-check conflict before final confirmation
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), booking.getId()
        );
        boolean hasOverlap = conflicts.stream().anyMatch(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.CHECKED_IN);
        if (hasOverlap) {
            throw new ConflictException("Cannot approve: resource has a conflicting confirmed booking during this period");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setApproverEmail(user.getEmail());
        booking.setApprovalNote(request != null ? request.getNote() : null);

        Booking saved = bookingRepository.save(booking);
        log.info("Booking ID {} approved by {}", id, user.getEmail());
        return BookingResponse.fromEntity(saved);
    }

    @Transactional
    public BookingResponse rejectBooking(Long id, ApprovalActionRequest request, UserPrincipal user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!approvalPolicyFactory.canApprove(user, booking.getDepartment())) {
            throw new BadRequestException("You do not have permission to reject bookings for department: " + booking.getDepartment());
        }

        if (booking.getStatus() != BookingStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Only PENDING_APPROVAL bookings can be rejected. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setApproverEmail(user.getEmail());
        booking.setRejectionReason(request != null ? request.getNote() : "Rejected by approver");

        Booking saved = bookingRepository.save(booking);
        log.info("Booking ID {} rejected by {}", id, user.getEmail());
        return BookingResponse.fromEntity(saved);
    }
}
