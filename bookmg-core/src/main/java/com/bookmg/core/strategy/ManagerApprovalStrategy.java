package com.bookmg.core.strategy;

import com.bookmg.core.model.Admin;
import com.bookmg.core.model.Booking;
import com.bookmg.core.model.BookingStatus;
import com.bookmg.core.model.Manager;
import com.bookmg.core.model.Resource;
import com.bookmg.core.model.User;

/**
 * Concrete Strategy 2: Multi-Tier Managerial Approval.
 * Enforced on restricted assets (e.g., Executive Boardroom, Training Labs).
 * Routes bookings to PENDING_APPROVAL unless overridden by an Administrator.
 */
public class ManagerApprovalStrategy implements ApprovalStrategy {

    @Override
    public BookingStatus evaluateApproval(Booking booking, User requester, Resource resource) {
        // Administrators possess global bypass override
        if (requester instanceof Admin) {
            return BookingStatus.CONFIRMED;
        }

        // For standard employees or cross-department managers, restrict to pending approval
        return BookingStatus.PENDING_APPROVAL;
    }

    @Override
    public String getStrategyName() {
        return "MANAGER_APPROVAL_GATEWAY";
    }

    @Override
    public String getRuleDescription() {
        return "Restricted asset policy: Requires explicit sign-off from department manager or system administrator.";
    }
}
