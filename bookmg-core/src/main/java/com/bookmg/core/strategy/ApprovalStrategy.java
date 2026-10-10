package com.bookmg.core.strategy;

import com.bookmg.core.model.Booking;
import com.bookmg.core.model.BookingStatus;
import com.bookmg.core.model.Resource;
import com.bookmg.core.model.User;

/**
 * Strategy interface defining the contract for evaluating reservation approval workflows.
 * Demonstrates the Gang-of-Four (GoF) Strategy Pattern in Core Java.
 */
public interface ApprovalStrategy {

    /**
     * Evaluates the requested booking against policy rules and determines the lifecycle status.
     *
     * @param booking   the scheduled booking
     * @param requester the user requesting the reservation
     * @param resource  the target resource being booked
     * @return {@link BookingStatus#CONFIRMED} if immediate approval is granted,
     *         or {@link BookingStatus#PENDING_APPROVAL} if managerial sign-off is required
     */
    BookingStatus evaluateApproval(Booking booking, User requester, Resource resource);

    /**
     * Human-readable identifier for the strategy.
     */
    String getStrategyName();

    /**
     * Policy description explaining the approval decision logic.
     */
    String getRuleDescription();
}
