import React, { useState, useEffect, useMemo } from 'react';
import { bookingApi, resourceApi } from '../api/client';
import {
  LAB_REQUIREMENTS_MAP,
  DEFAULT_LAB_REQUIREMENTS,
  RESOURCE_IMAGE_MAP,
  FEATURE_INFO
} from '../constants/facilities';
import {
  X,
  Calendar,
  Clock,
  Repeat,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Users,
  ShieldAlert,
  ChevronDown,
  Plus,
  Minus,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Tv,
  Video,
  Wind,
  ShieldCheck,
  Printer,
  Activity,
  Zap,
  Cpu,
  Edit3,
  Wifi,
  Monitor
} from 'lucide-react';

export default function BookingModal({
  resource: initialResource,
  initialDate,
  initialStartTime,
  onClose,
  onBookingSuccess
}) {
  const [allResources, setAllResources] = useState([]);
  const [currentResource, setCurrentResource] = useState(initialResource);

  // Load all resources so user can switch resource via dropdown
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await resourceApi.getResources();
        setAllResources(res.data || []);
      } catch (err) {
        console.warn('Could not load all resources:', err);
      }
    };
    fetchAll();
  }, []);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(initialDate || defaultDateStr);
  const [startTime, setStartTime] = useState(initialStartTime || '10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [attendeesCount, setAttendeesCount] = useState(4);

  // Recurrence
  const [recurrenceType, setRecurrenceType] = useState('NONE'); // 'NONE' | 'DAILY' | 'WEEKLY'
  const defaultUntil = new Date(tomorrow);
  defaultUntil.setDate(defaultUntil.getDate() + 28);
  const [recurrenceUntil, setRecurrenceUntil] = useState(defaultUntil.toISOString().split('T')[0]);
  const [selectedWeekdays, setSelectedWeekdays] = useState(['Mon', 'Wed']);

  // Lab Requirements Checklist State
  const requirementsList = useMemo(() => {
    if (!currentResource.restricted) return [];
    return LAB_REQUIREMENTS_MAP[currentResource.name] || DEFAULT_LAB_REQUIREMENTS;
  }, [currentResource]);

  const [checkedRequirements, setCheckedRequirements] = useState({});

  useEffect(() => {
    // Reset checklist when resource changes
    setCheckedRequirements({});
  }, [currentResource]);

  const allRequirementsChecked = useMemo(() => {
    if (!currentResource.restricted || requirementsList.length === 0) return true;
    return requirementsList.every((req) => !!checkedRequirements[req]);
  }, [currentResource, requirementsList, checkedRequirements]);

  // Availability strip slots for the selected day
  const [dayBookings, setDayBookings] = useState([]);
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await bookingApi.getAvailability(currentResource.id, date);
        setDayBookings(res.data?.bookedSlots || []);
      } catch {
        setDayBookings([]);
      }
    };
    if (currentResource?.id && date) {
      fetchAvailability();
    }
  }, [currentResource, date]);

  // Calculate Duration
  const durationLabel = useMemo(() => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const diffMin = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMin <= 0) return 'Invalid';
    const hrs = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${hrs}h ${mins}m`;
  }, [startTime, endTime]);

  // Recurrence Dates Preview (up to 3 months cap)
  const previewDates = useMemo(() => {
    if (recurrenceType === 'NONE' || !recurrenceUntil) return [];
    const dates = [];
    const curr = new Date(date);
    const until = new Date(recurrenceUntil);
    const maxDate = new Date(curr);
    maxDate.setDate(maxDate.getDate() + 90); // 3 months cap

    const targetUntil = until < maxDate ? until : maxDate;

    let testDate = new Date(curr);
    while (testDate <= targetUntil && dates.length < 12) {
      if (recurrenceType === 'DAILY') {
        dates.push(testDate.toISOString().split('T')[0]);
        testDate.setDate(testDate.getDate() + 1);
      } else if (recurrenceType === 'WEEKLY') {
        dates.push(testDate.toISOString().split('T')[0]);
        testDate.setDate(testDate.getDate() + 7);
      } else {
        break;
      }
    }
    return dates;
  }, [date, recurrenceType, recurrenceUntil]);

  // Conflict Check
  const conflictSlots = useMemo(() => {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    return dayBookings.filter((b) => {
      const bs = timeToMinutes(b.startTime.split('T')[1]?.substring(0, 5));
      const be = timeToMinutes(b.endTime.split('T')[1]?.substring(0, 5));
      return (startMin < be && endMin > bs);
    });
  }, [dayBookings, startTime, endTime]);

  function timeToMinutes(tStr) {
    if (!tStr) return 0;
    const [h, m] = tStr.split(':').map(Number);
    return h * 60 + m;
  }

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a booking title or meeting purpose');
      return;
    }

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    if (startDateTime >= endDateTime) {
      setErrorMsg('Start time must be before end time');
      return;
    }

    if (conflictSlots.length > 0) {
      setErrorMsg('The selected time window conflicts with an existing reservation.');
      return;
    }

    if (currentResource.restricted && !allRequirementsChecked) {
      setErrorMsg('You must acknowledge all lab and safety requirements before submitting.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      resourceId: currentResource.id,
      startTime: startDateTime,
      endTime: endDateTime,
      recurrenceType: recurrenceType !== 'NONE' ? recurrenceType : 'NONE',
      recurrenceUntil: recurrenceType !== 'NONE' && recurrenceUntil ? `${recurrenceUntil}T${endTime}:00` : undefined,
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

  const currentImageUrl = RESOURCE_IMAGE_MAP[currentResource.name];

  // Helper for feature icon
  const getFeatureIcon = (featName) => {
    switch (featName) {
      case '4K TV & Video Conf':
      case 'Video conferencing':
        return <Video size={16} color="var(--primary)" />;
      case 'Whiteboard':
        return <Edit3 size={16} color="var(--primary)" />;
      case 'Projector':
        return <Tv size={16} color="var(--primary)" />;
      case 'Fume hood':
        return <Wind size={16} color="var(--primary)" />;
      case 'Safety shower':
        return <ShieldCheck size={16} color="var(--primary)" />;
      case '3D printer':
        return <Printer size={16} color="var(--primary)" />;
      case 'Oscilloscope':
        return <Activity size={16} color="var(--primary)" />;
      case 'Soldering station':
        return <Zap size={16} color="var(--primary)" />;
      case 'GPU workstation':
        return <Cpu size={16} color="var(--primary)" />;
      default:
        return <CheckCircle2 size={16} color="var(--primary)" />;
    }
  };

  // 30-min strip segments from 08:00 to 19:00 (22 segments)
  const stripSegments = [];
  for (let h = 8; h < 19; h++) {
    stripSegments.push(`${h < 10 ? '0' : ''}${h}:00`);
    stripSegments.push(`${h < 10 ? '0' : ''}${h}:30`);
  }

  const selectedStartMin = timeToMinutes(startTime);
  const selectedEndMin = timeToMinutes(endTime);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1060px',
          width: '95vw',
          maxHeight: '92vh',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(11, 36, 32, 0.22), 0 8px 24px rgba(16, 24, 40, 0.08)',
        }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-strong)' }}>
              Reserve Workplace Resource
            </span>
            <span
              className={`badge ${currentResource.restricted ? 'badge-pending' : 'badge-confirmed'}`}
            >
              <span className="badge-dot" />
              {currentResource.restricted ? 'Requires Signoff' : 'Instant Confirmation'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '6px', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* Modal Body: 2 Columns Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '28px',
            padding: '24px',
            overflowY: 'auto',
          }}
          className="booking-modal-grid"
        >
          {/* LEFT COLUMN: Resource Details, 30m Availability Strip, Features, Lab Requirements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title with dropdown to switch resource */}
            <div>
              <label className="form-label">Selected Resource</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={currentResource.id}
                  onChange={(e) => {
                    const found = allResources.find((r) => r.id === Number(e.target.value));
                    if (found) setCurrentResource(found);
                  }}
                  className="select-field"
                  style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-strong)' }}
                >
                  {allResources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} • {r.type.replace('_', ' ')} ({r.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Large Image Header / Gradient */}
            <div
              style={{
                width: '100%',
                height: '180px',
                borderRadius: 'var(--radius-image)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-subtle)',
                position: 'relative',
              }}
            >
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={currentResource.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #EEF2F6 0%, #E2E8F0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Cpu size={48} color="var(--primary)" strokeWidth={1.5} />
                </div>
              )}

              {/* Resource Badges */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  display: 'flex',
                  gap: '6px',
                }}
              >
                <span className="badge badge-lime">
                  {currentResource.type.replace('_', ' ')}
                </span>
                <span className="badge" style={{ backgroundColor: '#FFFFFF', color: 'var(--text-strong)' }}>
                  <Users size={12} /> {currentResource.capacity} Seats
                </span>
              </div>
            </div>

            {/* 30-minute availability strip for the selected day */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-strong)' }}>
                  Day Availability Strip ({date})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  08:00 — 19:00
                </span>
              </div>

              {/* Strip Segments */}
              <div
                style={{
                  display: 'flex',
                  height: '24px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {stripSegments.map((segTime) => {
                  const segMin = timeToMinutes(segTime);
                  const isBooked = dayBookings.some((b) => {
                    const s = timeToMinutes(b.startTime.split('T')[1]?.substring(0, 5));
                    const e = timeToMinutes(b.endTime.split('T')[1]?.substring(0, 5));
                    return segMin >= s && segMin < e;
                  });
                  const isSelected = segMin >= selectedStartMin && segMin < selectedEndMin;

                  let bg = '#E2E8F0'; // free
                  let border = 'none';

                  if (isBooked) {
                    bg = 'var(--danger)'; // red booked
                  } else if (isSelected) {
                    bg = 'var(--accent-lime)'; // green/lime selected
                    border = '1px solid var(--primary)';
                  }

                  return (
                    <div
                      key={segTime}
                      title={`${segTime}: ${isBooked ? 'Booked' : isSelected ? 'Your Selected Range' : 'Free'}`}
                      style={{
                        flex: 1,
                        backgroundColor: bg,
                        border: border,
                        transition: 'background-color var(--transition-fast)',
                      }}
                    />
                  );
                })}
              </div>

              {/* Hour Legend */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                }}
              >
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>16:00</span>
                <span>18:00</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.5 }}>
                {currentResource.description ||
                  'Enterprise managed workspace equipped with climate control, high-speed connectivity, and calendar integration.'}
              </p>
            </div>

            {/* Facilities & Equipment Grid (2 columns) */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '8px' }}>
                Facilities &amp; Equipment
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                }}
              >
                {(currentResource.features?.length > 0
                  ? currentResource.features
                  : ['4K TV & Video Conf', 'Whiteboard', 'Wi-Fi']
                ).map((feat) => (
                  <div
                    key={feat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                      color: 'var(--text-strong)',
                    }}
                  >
                    {getFeatureIcon(feat)}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Requirements Checklist (Section 8) */}
            {currentResource.restricted && requirementsList.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--warning-soft)',
                  border: '1px solid var(--warning-border)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--warning)',
                    marginBottom: '6px',
                  }}
                >
                  <ShieldAlert size={16} />
                  <span>Mandatory Lab &amp; Safety Acknowledgement</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-body)', marginBottom: '12px' }}>
                  This facility requires supervisor signoff. You must verify and check all protocols below:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {requirementsList.map((req, idx) => {
                    const isChecked = !!checkedRequirements[req];
                    return (
                      <label
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text-strong)',
                          userSelect: 'none',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setCheckedRequirements({
                              ...checkedRequirements,
                              [req]: e.target.checked,
                            })
                          }
                          style={{
                            marginTop: '2px',
                            accentColor: 'var(--primary)',
                            width: '15px',
                            height: '15px',
                          }}
                        />
                        <span style={{ lineHeight: 1.35 }}>{req}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Booking Form Panel */}
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              height: 'fit-content',
            }}
          >
            {/* Restricted Info Banner */}
            {currentResource.restricted && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--warning-soft)',
                  border: '1px solid var(--warning-border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--text-strong)',
                }}
              >
                <ShieldAlert size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>This request goes to an approver. The slot is held while pending.</span>
              </div>
            )}

            {/* Conflict Alert Banner */}
            {conflictSlots.length > 0 && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--danger-soft)',
                  border: '1px solid var(--danger)',
                  fontSize: '12px',
                  color: 'var(--danger)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <AlertCircle size={15} /> Time Conflict Detected
                </div>
                <div style={{ marginTop: '4px' }}>
                  Conflicting with {conflictSlots.length} slot:
                  {conflictSlots.map((c, i) => (
                    <div key={i} style={{ fontWeight: 600, marginTop: '2px' }}>
                      • {c.startTime?.split('T')[1]?.substring(0, 5)} - {c.endTime?.split('T')[1]?.substring(0, 5)}: {c.bookingTitle || 'Booked'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--danger-soft)',
                  border: '1px solid var(--danger)',
                  fontSize: '12px',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Meeting Title / Purpose */}
              <div>
                <label className="form-label">Booking Purpose / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Sprint Planning or PCB Assembly"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* Date & Time with Duration Chip */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Date &amp; Schedule</label>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--accent-lime-soft)',
                      color: 'var(--text-strong)',
                    }}
                  >
                    Dur: {durationLabel}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 8px' }}
                    required
                  />

                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 8px' }}
                    required
                  />

                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '13px', padding: '6px 8px' }}
                    required
                  />
                </div>
              </div>

              {/* Attendees Stepper */}
              <div>
                <label className="form-label">Estimated Attendees</label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-input)',
                    padding: '4px 8px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-strong)' }}>
                    {attendeesCount} participants
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setAttendeesCount(Math.max(1, attendeesCount - 1))}
                      className="btn-ghost"
                      style={{ width: '28px', height: '28px', padding: 0, borderRadius: '6px', cursor: 'pointer', border: 'none' }}
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendeesCount(Math.min(currentResource.capacity, attendeesCount + 1))}
                      className="btn-ghost"
                      style={{ width: '28px', height: '28px', padding: 0, borderRadius: '6px', cursor: 'pointer', border: 'none' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recurrence Selector */}
              <div>
                <label className="form-label">Recurrence Cadence</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '8px' }}>
                  {['NONE', 'DAILY', 'WEEKLY'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setRecurrenceType(mode)}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: recurrenceType === mode ? 'var(--primary)' : 'var(--bg-card)',
                        color: recurrenceType === mode ? '#FFFFFF' : 'var(--text-body)',
                        borderColor: recurrenceType === mode ? 'var(--primary)' : 'var(--border)',
                        fontWeight: 600,
                        fontSize: '12px',
                      }}
                    >
                      {mode === 'NONE' ? 'Single' : mode.charAt(0) + mode.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                {recurrenceType !== 'NONE' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Repeat until:</span>
                      <input
                        type="date"
                        value={recurrenceUntil}
                        onChange={(e) => setRecurrenceUntil(e.target.value)}
                        className="input-field"
                        style={{ height: '32px', minHeight: '32px', fontSize: '12px', width: '130px' }}
                      />
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Note: Recurring reservations capped at 3 months (90 days).
                    </div>

                    {/* Preview dates list */}
                    {previewDates.length > 0 && (
                      <div
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          color: 'var(--text-body)',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>Scheduled dates:</span>{' '}
                        {previewDates.slice(0, 4).join(', ')}
                        {previewDates.length > 4 && ` (+${previewDates.length - 4} more)`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional Notes */}
              <div>
                <label className="form-label">Special Notes &amp; Logistics (Optional)</label>
                <textarea
                  placeholder="Attach agenda, special hardware request, or setup requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea-field"
                  rows={2}
                  style={{ fontSize: '13px' }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || (currentResource.restricted && !allRequirementsChecked)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  fontWeight: 600,
                  fontSize: '14px',
                  marginTop: '8px',
                }}
              >
                {submitting
                  ? 'Reserving slot...'
                  : currentResource.restricted
                  ? 'Request Booking'
                  : 'Book Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
