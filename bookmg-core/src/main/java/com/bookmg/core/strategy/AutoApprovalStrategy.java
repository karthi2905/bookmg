package com.bookmg.core.strategy;

import com.bookmg.core.model.Admin;
import com.bookmg.core.model.Booking;
import com.bookmg.core.model.BookingStatus;
import com.bookmg.core.model.Resource;
import com.bookmg.core.model.User;

/**
 * Concrete Strategy 1: Automatic Immediate Approval.
 * Applied to standard un-restricted resources or whenever an Administrator makes a booking.
 */
public class AutoApprovalStrategy implements ApprovalStrategy {

    @Override
    public BookingStatus evaluateApproval(Booking booking, User requester, Resource resource) {
        // Open resources and Admin requests are always approved immediately
        return BookingStatus.CONFIRMED;
    }

    @Override
    public String getStrategyName() {
        return "AUTO_APPROVAL";
    }

    @Override
    public String getRuleDescription() {
        return "Unrestricted standard resource — booking is confirmed instantly with zero managerial wait.";
    }
}
