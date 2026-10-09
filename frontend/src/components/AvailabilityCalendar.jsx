import React, { useState, useEffect } from 'react';
import { resourceApi, bookingApi } from '../api/client';
import { RESOURCE_IMAGE_MAP } from '../constants/facilities';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Building,
  Lock,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

// Time intervals from 08:00 to 19:00 (every 30 mins)
const TIME_SLOTS = [];
for (let hour = 8; hour < 19; hour++) {
  const hStr = hour < 10 ? `0${hour}` : `${hour}`;
  TIME_SLOTS.push(`${hStr}:00`);
  TIME_SLOTS.push(`${hStr}:30`);
}

export default function AvailabilityCalendar({ onQuickBook }) {
  const [resources, setResources] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'week'
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [bookingsMap, setBookingsMap] = useState({}); // keyed by resourceId
  const [loading, setLoading] = useState(true);

  // Load resources
  useEffect(() => {
    const loadResources = async () => {
      try {
        const res = await resourceApi.getResources();
        const list = res.data || [];
        setResources(list);
        if (list.length > 0 && !selectedResourceId) {
          setSelectedResourceId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      }
    };
    loadResources();
  }, []);

  // Fetch bookings for the selected date across resources
  const fetchCalendarData = async () => {
    if (resources.length === 0) return;
    setLoading(true);
    try {
      const map = {};
      // Fetch availability for each resource on this date
      await Promise.all(
        resources.map(async (r) => {
          try {
            const res = await bookingApi.getAvailability(r.id, selectedDate);
            map[r.id] = res.data?.bookedSlots || [];
          } catch {
            map[r.id] = [];
          }
        })
      );
      setBookingsMap(map);
    } catch (err) {
      console.error('Failed to load availability grid:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resources.length > 0) {
      fetchCalendarData();
    }
  }, [resources, selectedDate]);

  const changeDateBy = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Helper to check if a 30-min slot is booked
  const getSlotBooking = (resourceId, slotTime) => {
    const list = bookingsMap[resourceId] || [];
    const slotMinutes = timeToMinutes(slotTime);

    return list.find((b) => {
      const s = timeToMinutes(b.startTime.split('T')[1]?.substring(0, 5));
      const e = timeToMinutes(b.endTime.split('T')[1]?.substring(0, 5));
      return slotMinutes >= s && slotMinutes < e;
    });
  };

  const isWorkingHours = (slotTime) => {
    const min = timeToMinutes(slotTime);
    return min >= 9 * 60 && min < 18 * 60; // 09:00 to 18:00
  };

  function timeToMinutes(tStr) {
    if (!tStr) return 0;
    const [h, m] = tStr.split(':').map(Number);
    return h * 60 + m;
  }

  // Get days for week view
  const getWeekDays = () => {
    const curr = new Date(selectedDate);
    const firstDay = curr.getDate() - curr.getDay() + 1; // Monday
    const week = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(curr.setDate(firstDay + i));
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays();
  const selectedResource = resources.find((r) => r.id === Number(selectedResourceId)) || resources[0];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title & View Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>
            Availability Calendar
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Timeline view of all room and equipment bookings across standard operating hours.
          </p>
        </div>

        {/* View Mode Toggle (Day / Week) */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-button)',
            border: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className="btn btn-sm"
            style={{
              backgroundColor: viewMode === 'day' ? 'var(--bg-card)' : 'transparent',
              color: viewMode === 'day' ? 'var(--text-strong)' : 'var(--text-muted)',
              boxShadow: viewMode === 'day' ? 'var(--shadow-sm)' : 'none',
              fontWeight: 600,
            }}
          >
            Day Timeline
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className="btn btn-sm"
            style={{
              backgroundColor: viewMode === 'week' ? 'var(--bg-card)' : 'transparent',
              color: viewMode === 'week' ? 'var(--text-strong)' : 'var(--text-muted)',
              boxShadow: viewMode === 'week' ? 'var(--shadow-sm)' : 'none',
              fontWeight: 600,
            }}
          >
            Week View
          </button>
        </div>
      </div>

      {/* Date Control Bar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="btn btn-outline btn-sm"
            style={{ fontWeight: 600 }}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => changeDateBy(-1)}
            className="btn-ghost btn-sm"
            title="Previous Day"
            style={{ padding: '6px' }}
          >
            <ChevronLeft size={16} />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
            style={{ minHeight: '34px', height: '34px', width: '140px', padding: '4px 10px', fontSize: '13px', fontWeight: 600 }}
          />

          <button
            type="button"
            onClick={() => changeDateBy(1)}
            className="btn-ghost btn-sm"
            title="Next Day"
            style={{ padding: '6px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--booked-bg)', border: '1px solid var(--booked-border)' }} />
            <span>Booked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--warning-soft)', border: '1px dashed var(--warning)' }} />
            <span>Pending Approval</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: 'var(--unavailable-bg)',
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(154,162,184,0.3) 3px, rgba(154,162,184,0.3) 6px)',
              }}
            />
            <span>Closed / Unavailable</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid var(--border)', backgroundColor: '#FFFFFF' }} />
            <span>Free (Click +)</span>
          </div>
        </div>
      </div>

      {/* Main Timeline Card Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {viewMode === 'day' ? (
          /* DAY VIEW: Resources as columns, 30-min time slots as rows */
          <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `80px repeat(${Math.max(1, resources.length)}, minmax(180px, 1fr))`,
                minWidth: `${80 + resources.length * 180}px`,
                position: 'relative',
              }}
            >
              {/* Sticky Top-Left Empty Gutter Header */}
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  left: 0,
                  zIndex: 25,
                  backgroundColor: 'var(--bg-card)',
                  borderBottom: '1px solid var(--border)',
                  borderRight: '1px solid var(--border)',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                Time
              </div>

              {/* Sticky Column Headers for Resources */}
              {resources.map((r) => {
                const img = RESOURCE_IMAGE_MAP[r.name];
                return (
                  <div
                    key={r.id}
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 20,
                      backgroundColor: 'var(--bg-card)',
                      borderBottom: '1px solid var(--border)',
                      borderRight: '1px solid var(--border)',
                      height: '70px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    {/* Small image or fallback icon */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'var(--bg-subtle)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {img ? (
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Building size={18} color="var(--primary)" />
                      )}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        title={r.name}
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-strong)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {r.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <span>{r.capacity} Seats</span>
                        {r.restricted && <Lock size={10} color="var(--warning)" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Time Rows */}
              {TIME_SLOTS.map((slot) => {
                const isWorking = isWorkingHours(slot);
                const isHourMark = slot.endsWith(':00');

                return (
                  <React.Fragment key={slot}>
                    {/* Sticky Time Gutter (Left) */}
                    <div
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 15,
                        backgroundColor: 'var(--bg-card)',
                        borderRight: '1px solid var(--border)',
                        borderBottom: isHourMark ? '1px dashed var(--border)' : '1px solid #F1F3F5',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: isHourMark ? 600 : 400,
                        color: isHourMark ? 'var(--text-strong)' : 'var(--text-muted)',
                      }}
                    >
                      {slot}
                    </div>

                    {/* Cells for Each Resource */}
                    {resources.map((r) => {
                      const booking = getSlotBooking(r.id, slot);
                      const isBooked = !!booking;

                      if (!isWorking && !isBooked) {
                        return (
                          <div
                            key={r.id + '-' + slot}
                            className="slot-unavailable"
                            style={{
                              height: '48px',
                              borderRight: '1px solid var(--border)',
                              borderBottom: isHourMark ? '1px dashed var(--border)' : '1px solid #F1F3F5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                            }}
                          >
                            <span style={{ opacity: 0.6 }}>Closed</span>
                          </div>
                        );
                      }

                      if (isBooked) {
                        const isPending = booking.status === 'PENDING_APPROVAL';
                        const isCheckedIn = booking.status === 'CHECKED_IN';

                        return (
                          <div
                            key={r.id + '-' + slot}
                            className={isPending ? 'slot-pending' : isCheckedIn ? 'slot-checkedin' : 'slot-booked'}
                            style={{
                              height: '48px',
                              borderRight: '1px solid var(--border)',
                              borderBottom: isHourMark ? '1px dashed var(--border)' : '1px solid #F1F3F5',
                              padding: '6px 8px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}
                            title={`${booking.bookingTitle || 'Reserved'} (${booking.startTime?.split('T')[1]?.substring(0, 5)} - ${booking.endTime?.split('T')[1]?.substring(0, 5)})`}
                          >
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {booking.bookingTitle || 'Occupied'}
                            </div>
                            <div style={{ fontSize: '10px', opacity: 0.75, whiteSpace: 'nowrap' }}>
                              {booking.startTime?.split('T')[1]?.substring(0, 5)} - {booking.endTime?.split('T')[1]?.substring(0, 5)}
                            </div>
                          </div>
                        );
                      }

                      // Free Cell: hoverable with subtle "+"
                      return (
                        <div
                          key={r.id + '-' + slot}
                          onClick={() => onQuickBook(r, selectedDate, slot)}
                          style={{
                            height: '48px',
                            borderRight: '1px solid var(--border)',
                            borderBottom: isHourMark ? '1px dashed var(--border)' : '1px solid #F1F3F5',
                            backgroundColor: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color var(--transition-fast)',
                          }}
                          className="calendar-free-cell"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                          }}
                          title={`Click to reserve ${r.name} at ${slot}`}
                        >
                          <Plus size={16} color="var(--primary)" className="cell-hover-plus" style={{ opacity: 0 }} />
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ) : (
          /* WEEK VIEW: Selected Resource across Monday - Friday */
          <div style={{ padding: '20px' }}>
            {/* Resource Picker for Week View */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>
                Active Resource:
              </span>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="select-field"
                style={{ maxWidth: '320px' }}
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ overflowX: 'auto', width: '100%' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px repeat(5, minmax(160px, 1fr))',
                  minWidth: '880px',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {/* Header Gutter */}
                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Time
                </div>

                {/* Day Headers (Mon - Fri) */}
                {weekDays.map((d) => {
                  const dStr = d.toISOString().split('T')[0];
                  const isToday = new Date().toDateString() === d.toDateString();
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

                  return (
                    <div
                      key={dStr}
                      style={{
                        backgroundColor: isToday ? 'var(--accent-lime-soft)' : 'var(--bg-subtle)',
                        padding: '12px',
                        borderBottom: '1px solid var(--border)',
                        borderRight: '1px solid var(--border)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>
                        {dayName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}

                {/* Time Slots for Week View (09:00 - 18:00) */}
                {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((hourSlot) => (
                  <React.Fragment key={hourSlot}>
                    <div
                      style={{
                        padding: '10px',
                        borderBottom: '1px solid var(--border)',
                        borderRight: '1px solid var(--border)',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-strong)',
                        backgroundColor: 'var(--bg-card)',
                      }}
                    >
                      {hourSlot}
                    </div>

                    {weekDays.map((d) => {
                      const dStr = d.toISOString().split('T')[0];
                      return (
                        <div
                          key={dStr + '-' + hourSlot}
                          onClick={() => onQuickBook(selectedResource, dStr, hourSlot)}
                          style={{
                            padding: '8px',
                            borderBottom: '1px solid var(--border)',
                            borderRight: '1px solid var(--border)',
                            backgroundColor: '#FFFFFF',
                            cursor: 'pointer',
                            minHeight: '48px',
                            transition: 'background-color var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                        >
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Available
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .calendar-free-cell:hover .cell-hover-plus {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
