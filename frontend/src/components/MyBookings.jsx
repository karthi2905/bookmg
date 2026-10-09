import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../api/client';
import { RESOURCE_IMAGE_MAP } from '../constants/facilities';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Repeat,
  AlertCircle,
  Building,
  RefreshCw,
  MoreVertical,
  X,
  DoorClosed,
  HelpCircle,
  LogIn
} from 'lucide-react';

export default function MyBookings({ onOpenAuthModal }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'cancelled'
  const [actionAlert, setActionAlert] = useState({ text: '', type: '' });

  // Cancel Dialog state
  const [cancelModalBooking, setCancelModalBooking] = useState(null);

  // Kebab menu open per row on mobile
  const [mobileKebabId, setMobileKebabId] = useState(null);

  const fetchBookings = async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.warn('Could not load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingApi.checkIn(bookingId);
      setActionAlert({ text: 'Check-in confirmed! Meeting space is now marked active.', type: 'success' });
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed.';
      setActionAlert({ text: msg, type: 'error' });
    }
  };

  const handleCancelSingle = async (bookingId) => {
    try {
      await bookingApi.cancelBooking(bookingId);
      setActionAlert({ text: 'Booking successfully cancelled.', type: 'success' });
      setCancelModalBooking(null);
      fetchBookings();
    } catch (err) {
      setActionAlert({ text: err.response?.data?.message || 'Failed to cancel booking.', type: 'error' });
    }
  };

  const handleCancelSeries = async (recurrenceGroupId) => {
    try {
      await bookingApi.cancelSeries(recurrenceGroupId);
      setActionAlert({ text: 'All occurrences in recurring series cancelled.', type: 'success' });
      setCancelModalBooking(null);
      fetchBookings();
    } catch (err) {
      setActionAlert({ text: err.response?.data?.message || 'Failed to cancel series.', type: 'error' });
    }
  };

  const isCheckInOpen = (booking) => {
    if (booking.status !== 'CONFIRMED' || booking.checkedIn) return false;
    const now = new Date();
    const start = new Date(booking.startTime);
    const earliest = new Date(start.getTime() - 15 * 60000);
    const latest = new Date(start.getTime() + 15 * 60000);
    return now >= earliest && now <= latest;
  };

  // Filter bookings according to activeTab
  const now = new Date();
  const upcomingList = bookings.filter((b) => {
    const isCancelled = b.status === 'CANCELLED' || b.status === 'REJECTED' || b.status === 'AUTO_RELEASED';
    const isPast = new Date(b.endTime) < now && b.status !== 'PENDING_APPROVAL';
    return !isCancelled && !isPast;
  });

  const pastList = bookings.filter((b) => {
    const isCancelled = b.status === 'CANCELLED' || b.status === 'REJECTED' || b.status === 'AUTO_RELEASED';
    const isPast = new Date(b.endTime) < now;
    return isPast && !isCancelled;
  });

  const cancelledList = bookings.filter((b) => {
    return b.status === 'CANCELLED' || b.status === 'REJECTED' || b.status === 'AUTO_RELEASED';
  });

  const currentList =
    activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'past'
      ? pastList
      : cancelledList;

  const renderBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="badge badge-confirmed">
            <span className="badge-dot" /> Confirmed
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="badge badge-checkedin">
            <span className="badge-dot" /> Checked In
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="badge badge-pending">
            <span className="badge-dot" /> Pending Approval
          </span>
        );
      case 'AUTO_RELEASED':
        return (
          <span className="badge badge-autoreleased">
            <span className="badge-dot" /> Auto-Released (No-show)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="badge badge-rejected">
            <span className="badge-dot" /> Rejected
          </span>
        );
      case 'CANCELLED':
      default:
        return (
          <span className="badge badge-cancelled">
            <span className="badge-dot" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title & Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>
            My Bookings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            View your upcoming sessions, confirm presence with check-in, or manage cancellations.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="btn btn-outline btn-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionAlert.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: actionAlert.type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)',
            border: `1px solid ${actionAlert.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
            color: actionAlert.type === 'success' ? 'var(--success)' : 'var(--danger)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{actionAlert.text}</span>
          <button
            type="button"
            onClick={() => setActionAlert({ text: '', type: '' })}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Underline Sub-Navigation Tabs */}
      <div className="underline-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`underline-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
        >
          Upcoming ({upcomingList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`underline-tab ${activeTab === 'past' ? 'active' : ''}`}
        >
          Past ({pastList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cancelled')}
          className={`underline-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
        >
          Cancelled ({cancelledList.length})
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading your reservations...
        </div>
      ) : currentList.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={22} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-strong)' }}>
            No {activeTab} bookings
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            You do not have any reservations currently listed in this category.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentList.map((b) => {
            const checkInActive = isCheckInOpen(b);
            const dateStr = b.startTime.split('T')[0];
            const startTimeStr = b.startTime.split('T')[1]?.substring(0, 5);
            const endTimeStr = b.endTime.split('T')[1]?.substring(0, 5);
            const thumb = RESOURCE_IMAGE_MAP[b.resourceName];
            const isKebabOpen = mobileKebabId === b.id;

            return (
              <div
                key={b.id}
                className="card"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  borderLeft: checkInActive ? '4px solid var(--success)' : '1px solid var(--border)',
                }}
              >
                {/* Left: Resource Thumb + Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 360px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-image)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-subtle)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {thumb ? (
                      <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <DoorClosed size={24} color="var(--primary)" />
                    )}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      {renderBadge(b.status)}

                      {b.recurrenceType && b.recurrenceType !== 'NONE' && (
                        <span className="badge" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-body)' }}>
                          <Repeat size={11} /> {b.recurrenceType}
                        </span>
                      )}

                      {checkInActive && (
                        <span className="badge badge-confirmed" style={{ fontWeight: 700 }}>
                          Check-in Ready
                        </span>
                      )}
                    </div>

                    <h3
                      title={b.title}
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--text-strong)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '4px',
                      }}
                    >
                      {b.title}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-strong)', fontWeight: 500 }}>
                        <Building size={13} color="var(--text-muted)" /> {b.resourceName}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {dateStr}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {startTimeStr} — {endTimeStr}
                      </span>
                    </div>

                    {b.rejectionReason && (
                      <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>
                        Rejection reason: {b.rejectionReason}
                      </div>
                    )}
                    {b.approvalNote && (
                      <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px' }}>
                        Approver note: {b.approvalNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions Aligned Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                  {/* Check-in button */}
                  {b.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => handleCheckIn(b.id)}
                      disabled={!checkInActive}
                      className={`btn btn-sm ${checkInActive ? 'btn-primary' : 'btn-outline'}`}
                      style={{ opacity: checkInActive ? 1 : 0.6 }}
                      title={checkInActive ? 'Confirm presence in room' : 'Available within 15 mins of meeting start'}
                    >
                      <CheckCircle2 size={14} /> Check In
                    </button>
                  )}

                  {/* Cancel Button (opens cancel dialog) */}
                  {b.status !== 'CANCELLED' && b.status !== 'AUTO_RELEASED' && b.status !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => setCancelModalBooking(b)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)', borderColor: '#FECACA' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Dialog (This booking / Whole series) */}
      {cancelModalBooking && (
        <div className="modal-overlay" onClick={() => setCancelModalBooking(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '440px',
              padding: 0,
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 64px rgba(11, 36, 32, 0.22)',
            }}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-strong)' }}>
                Cancel Reservation
              </h3>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="btn-ghost"
                style={{ padding: '4px', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} color="var(--text-muted)" />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.5 }}>
                Are you sure you want to cancel the reservation for{' '}
                <strong>"{cancelModalBooking.title}"</strong> at {cancelModalBooking.resourceName}?
              </p>

              {cancelModalBooking.recurrenceGroupId && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  This booking is part of a recurring series. Would you like to cancel only this instance or all future sessions?
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="btn btn-secondary btn-sm"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={() => handleCancelSingle(cancelModalBooking.id)}
                className="btn btn-danger btn-sm"
              >
                Cancel This Session
              </button>

              {cancelModalBooking.recurrenceGroupId && (
                <button
                  type="button"
                  onClick={() => handleCancelSeries(cancelModalBooking.recurrenceGroupId)}
                  className="btn btn-danger-solid btn-sm"
                >
                  Cancel Whole Series
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
