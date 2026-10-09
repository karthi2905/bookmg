import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api/client';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Trash2, 
  Repeat, 
  AlertCircle,
  Building,
  RefreshCw
} from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingApi.checkIn(bookingId);
      setActionMessage({ text: 'Check-in confirmed! Meeting room is active.', type: 'success' });
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed.';
      setActionMessage({ text: msg, type: 'error' });
    }
  };

  const handleCancelSingle = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingApi.cancelBooking(bookingId);
      setActionMessage({ text: 'Booking cancelled successfully.', type: 'success' });
      fetchBookings();
    } catch (err) {
      setActionMessage({ text: err.response?.data?.message || 'Failed to cancel.', type: 'error' });
    }
  };

  const handleCancelSeries = async (groupId) => {
    if (!window.confirm('Are you sure you want to cancel all future occurrences in this recurring series?')) return;
    try {
      await bookingApi.cancelSeries(groupId);
      setActionMessage({ text: 'Recurring series cancelled successfully.', type: 'success' });
      fetchBookings();
    } catch (err) {
      setActionMessage({ text: err.response?.data?.message || 'Failed to cancel series.', type: 'error' });
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

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (filter === 'PENDING') return b.status === 'PENDING_APPROVAL';
    if (filter === 'CHECKED_IN') return b.status === 'CHECKED_IN';
    if (filter === 'AUTO_RELEASED') return b.status === 'AUTO_RELEASED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      {/* Title & Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            My Reservations & Check-in
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px' }}>
            Manage room reservations, confirm presence with 15-min check-in, or cancel bookings.
          </p>
        </div>

        <button onClick={fetchBookings} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {/* Action Alert Banner */}
      {actionMessage.text && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: actionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${actionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: actionMessage.type === 'success' ? '#34d399' : '#f87171',
            fontSize: '0.88rem'
          }}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage({ text: '', type: '' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL', 'CONFIRMED', 'CHECKED_IN', 'PENDING', 'AUTO_RELEASED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="btn btn-sm"
            style={{
              background: filter === f ? '#6366f1' : '#1e293b',
              color: filter === f ? '#ffffff' : '#94a3b8',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.78rem'
            }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
          No reservations found for the selected filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredBookings.map((b) => {
            const checkInActive = isCheckInOpen(b);
            const dateStr = b.startTime.split('T')[0];
            const startTimeStr = b.startTime.split('T')[1].substring(0, 5);
            const endTimeStr = b.endTime.split('T')[1].substring(0, 5);

            return (
              <div
                key={b.id}
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  flexWrap: 'wrap',
                  borderLeft: checkInActive ? '4px solid #10b981' : undefined
                }}
              >
                {/* Left side: title and details */}
                <div style={{ flex: '1 1 380px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span className={`badge ${
                      b.status === 'CONFIRMED' ? 'badge-confirmed' :
                      b.status === 'PENDING_APPROVAL' ? 'badge-pending' :
                      b.status === 'CHECKED_IN' ? 'badge-checkedin' :
                      b.status === 'AUTO_RELEASED' ? 'badge-autoreleased' :
                      b.status === 'REJECTED' ? 'badge-rejected' : 'badge-cancelled'
                    }`}>
                      {b.status.replace('_', ' ')}
                    </span>

                    {b.recurrenceType && b.recurrenceType !== 'NONE' && (
                      <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
                        <Repeat size={10} /> {b.recurrenceType}
                      </span>
                    )}

                    {checkInActive && (
                      <span className="badge badge-confirmed" style={{ animation: 'pulse 1.5s infinite', background: '#059669', color: '#fff' }}>
                        Check-in Window Open!
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                    {b.title}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e2e8f0', fontWeight: 600 }}>
                      <Building size={14} color="#6366f1" /> {b.resourceName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} color="#06b6d4" /> {dateStr}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} color="#a855f7" /> {startTimeStr} - {endTimeStr}
                    </span>
                  </div>

                  {b.rejectionReason && (
                    <div style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '8px' }}>
                      Rejection Reason: {b.rejectionReason}
                    </div>
                  )}
                  {b.approvalNote && (
                    <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '8px' }}>
                      Approver Note: {b.approvalNote}
                    </div>
                  )}
                </div>

                {/* Right side: Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Check in button */}
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCheckIn(b.id)}
                      disabled={!checkInActive}
                      className={`btn btn-sm ${checkInActive ? 'btn-success' : 'btn-secondary'}`}
                      style={{ opacity: checkInActive ? 1 : 0.6 }}
                      title={checkInActive ? 'Confirm room presence' : 'Available within 15 min of start'}
                    >
                      <CheckCircle2 size={16} /> Check In
                    </button>
                  )}

                  {/* Cancel Single */}
                  {b.status !== 'CANCELLED' && b.status !== 'AUTO_RELEASED' && b.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleCancelSingle(b.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }}
                    >
                      <Trash2 size={14} /> Cancel
                    </button>
                  )}

                  {/* Cancel Series if recurring */}
                  {b.recurrenceGroupId && b.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancelSeries(b.recurrenceGroupId)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}
                      title="Cancel all future occurrences in series"
                    >
                      <Repeat size={14} /> Cancel Series
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

