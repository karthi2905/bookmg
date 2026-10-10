package com.bookmg.core.service;

import com.bookmg.core.exception.UnauthorizedBookingException;
import com.bookmg.core.model.Booking;
import com.bookmg.core.model.BookingStatus;
import com.bookmg.core.model.Manager;
import com.bookmg.core.model.User;
import com.bookmg.core.repository.InMemoryRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing review, approval, and rejection of restricted resource bookings.
 */
public class ApprovalService {
    private final InMemoryRepository<Booking> bookingRepository;

    public ApprovalService(InMemoryRepository<Booking> bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<Booking> getPendingBookings() {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING_APPROVAL)
                .sorted()
                .collect(Collectors.toList());
    }

    public Booking approveBooking(String bookingId, User approver) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        validateApproverAuthority(approver, booking);

        booking.setStatus(BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(String bookingId, User approver, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        validateApproverAuthority(approver, booking);

        booking.setStatus(BookingStatus.REJECTED);
        return bookingRepository.save(booking);
    }

    private void validateApproverAuthority(User approver, Booking booking) {
        if (approver == null || !approver.canApproveBookings()) {
            throw new UnauthorizedBookingException(
                    (approver != null ? approver.getId() : "null"),
                    "ROLE_MANAGER or ROLE_ADMIN",
                    "User does not possess approval authority.");
        }

        if (approver instanceof Manager manager) {
            String requesterDept = booking.getUser().getDepartment();
            if (!manager.canApproveForDepartment(requesterDept)) {
                throw new UnauthorizedBookingException(
                        manager.getId(),
                        "Department Match: " + requesterDept,
                        "Managers can only review requests within their own department (" + manager.getDepartment() + ").");
            }
        }
    }
}
