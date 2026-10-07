package com.bookmg.booking.approval;

import com.bookmg.booking.client.ResourceDto;
import com.bookmg.booking.model.BookingStatus;
import com.bookmg.booking.security.UserPrincipal;
import org.springframework.stereotype.Component;

@Component
public class ApprovalPolicyFactory {

    public BookingStatus determineInitialStatus(ResourceDto resource, UserPrincipal user) {
        if (resource == null) {
            return BookingStatus.CONFIRMED;
        }

        // If the resource is not restricted, it is automatically confirmed
        if (!resource.isRestricted()) {
            return BookingStatus.CONFIRMED;
        }

        // Admin bookings for restricted resources are auto-approved
        if ("ROLE_ADMIN".equals(user.getRole())) {
            return BookingStatus.CONFIRMED;
        }

        // Otherwise, restricted resources require approval
        return BookingStatus.PENDING_APPROVAL;
    }

    public boolean canApprove(UserPrincipal approver, String bookingDepartment) {
        if (approver == null || approver.getRole() == null) {
            return false;
        }

        if ("ROLE_ADMIN".equals(approver.getRole())) {
            return true;
        }

        if ("ROLE_MANAGER".equals(approver.getRole())) {
            // Managers can approve bookings in their own department (or general if same)
            return approver.getDepartment() != null &&
                    approver.getDepartment().equalsIgnoreCase(bookingDepartment);
        }

        return false;
    }
}
