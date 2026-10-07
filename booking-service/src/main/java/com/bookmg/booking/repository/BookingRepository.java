package com.bookmg.booking.repository;

import com.bookmg.booking.model.Booking;
import com.bookmg.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    @Query("""
        SELECT b FROM Booking b
        WHERE b.resourceId = :resourceId
          AND b.status IN (com.bookmg.booking.model.BookingStatus.CONFIRMED, com.bookmg.booking.model.BookingStatus.PENDING_APPROVAL, com.bookmg.booking.model.BookingStatus.CHECKED_IN)
          AND b.startTime < :endTime
          AND b.endTime > :startTime
          AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId)
    """)
    List<Booking> findConflictingBookings(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeBookingId") Long excludeBookingId
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE b.status = com.bookmg.booking.model.BookingStatus.CONFIRMED
          AND b.checkedIn = false
          AND b.startTime <= :threshold
          AND b.endTime > :now
    """)
    List<Booking> findNoShowBookings(
            @Param("threshold") LocalDateTime threshold,
            @Param("now") LocalDateTime now
    );

    List<Booking> findByStatusOrderByStartTimeAsc(BookingStatus status);

    List<Booking> findByStatusAndDepartmentIgnoreCaseOrderByStartTimeAsc(BookingStatus status, String department);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.resourceId = :resourceId
          AND b.status IN (com.bookmg.booking.model.BookingStatus.CONFIRMED, com.bookmg.booking.model.BookingStatus.CHECKED_IN, com.bookmg.booking.model.BookingStatus.PENDING_APPROVAL)
          AND b.startTime >= :dayStart
          AND b.endTime <= :dayEnd
        ORDER BY b.startTime ASC
    """)
    List<Booking> findBookingsForResourceOnDate(
            @Param("resourceId") Long resourceId,
            @Param("dayStart") LocalDateTime dayStart,
            @Param("dayEnd") LocalDateTime dayEnd
    );

    List<Booking> findByRecurrenceGroupIdOrderByStartTimeAsc(String recurrenceGroupId);

    List<Booking> findByRecurrenceGroupIdAndStartTimeGreaterThanEqual(String recurrenceGroupId, LocalDateTime fromTime);

    List<Booking> findByUserIdOrderByStartTimeDesc(Long userId);

    List<Booking> findByUserEmailOrderByStartTimeDesc(String userEmail);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.startTime >= :startDate AND b.endTime <= :endDate
        ORDER BY b.startTime ASC
    """)
    List<Booking> findBookingsBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
