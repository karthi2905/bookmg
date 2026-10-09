import React, { useState } from 'react';
import { bookingApi } from '../api/client';
import { 
  X, 
  Calendar, 
  Clock, 
  Repeat, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Users, 
  ShieldAlert 
} from 'lucide-react';

export default function BookingModal({ resource, initialDate, onClose, onBookingSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Default to tomorrow 10:00 AM - 11:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(initialDate || defaultDateStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('WEEKLY');
  
  // Default recurring until date: 4 weeks out
  const defaultUntil = new Date(tomorrow);
  defaultUntil.setDate(defaultUntil.getDate() + 28);
  const [recurrenceUntil, setRecurrenceUntil] = useState(defaultUntil.toISOString().split('T')[0]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a booking title');
      return;
    }

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    if (startDateTime >= endDateTime) {
      setErrorMsg('Start time must be before end time');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      resourceId: resource.id,
      startTime: startDateTime,
      endTime: endDateTime,
      recurrenceType: isRecurring ? recurrenceType : 'NONE',
      recurrenceUntil: isRecurring && recurrenceUntil ? `${recurrenceUntil}T${endTime}:00` : undefined,
    };

    setSubmitting(true);
    try {
      await bookingApi.createBooking(payload);
      onBookingSuccess();
      onClose();
    } catch (err) {
      console.error('Booking failed:', err);
      const backendMessage = err.response?.data?.message || 'Failed to complete booking reservation.';
      setErrorMsg(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Reserve Resource
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{resource.name}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} /> {resource.location}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Users size={12} /> {resource.capacity} Seats</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Restricted Warning */}
        {resource.restricted && (
          <div style={{ margin: '16px 24px 0 24px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#fbbf24' }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>This is a restricted resource. Your booking will be submitted for manager approval.</span>
          </div>
        )}

        {/* Conflict / Validation Error Banner */}
        {errorMsg && (
          <div style={{ margin: '16px 24px 0 24px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: '#fda4af' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Meeting / Session Title *</label>
            <input
              type="text"
              placeholder="e.g. Q4 Strategy Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Purpose / Notes (Optional)</label>
            <textarea
              placeholder="Add agenda or AV requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-field"
              rows={2}
            />
          </div>

          {/* Date and Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="form-label">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="form-label">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '18px' }}>
            Working hours: 09:00 - 18:00 • Maximum booking duration: 8 hours
          </div>

          {/* Recurrence Toggle */}
          <div style={{ background: '#0b1120', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isRecurring ? '14px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={16} color="#6366f1" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Recurring Reservation</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', color: '#94a3b8' }}>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  style={{ accentColor: '#6366f1', width: '16px', height: '16px' }}
                />
                Enable
              </label>
            </div>

            {isRecurring && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Cadence</label>
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value)}
                    className="select-field"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Biweekly (Every 2 wks)</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Repeat Until (Max 90 Days)</label>
                  <input
                    type="date"
                    value={recurrenceUntil}
                    onChange={(e) => setRecurrenceUntil(e.target.value)}
                    className="input-field"
                    required={isRecurring}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Verifying & Booking...' : resource.restricted ? 'Submit for Approval' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

