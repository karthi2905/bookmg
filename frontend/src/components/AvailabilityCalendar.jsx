import React, { useState, useEffect } from 'react';
import { resourceApi, bookingApi } from '../api/client';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight,
  Layers
} from 'lucide-react';

export default function AvailabilityCalendar({ onQuickBook }) {
  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const res = await resourceApi.getResources();
        setResources(res.data);
        if (res.data.length > 0) {
          setSelectedResourceId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load resources for calendar:', err);
      }
    };
    loadResources();
  }, []);

  const fetchAvailability = async () => {
    if (!selectedResourceId) return;
    setLoading(true);
    try {
      const res = await bookingApi.getAvailability(selectedResourceId, selectedDate);
      setAvailability(res.data);
    } catch (err) {
      console.error('Failed to load availability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedResourceId, selectedDate]);

  const changeDateBy = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const selectedResource = resources.find((r) => r.id === Number(selectedResourceId));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      {/* Control bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          {/* Resource Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>Resource:</span>
            <select
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              className="select-field"
              style={{ width: '280px', fontWeight: 600 }}
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => changeDateBy(-1)}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
                style={{ padding: '6px 12px', fontSize: '0.88rem', fontWeight: 600 }}
              />
            </div>

            <button
              onClick={() => changeDateBy(1)}
              className="btn btn-secondary btn-sm"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="btn btn-secondary btn-sm"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Main Availability Grid */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
              {selectedResource ? selectedResource.name : 'Select Resource'}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
              Date: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{selectedDate}</span> • Working Window: 09:00 - 18:00
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Available Free Window
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> Booked Reserved Slot
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>Calculating real-time slots...</div>
        ) : !availability ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>No slot data available.</div>
        ) : (
          <div>
            {/* Visual Timeline Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {/* Available Slots */}
              {availability.availableSlots?.map((slot, idx) => {
                const sTime = slot.startTime.split('T')[1].substring(0, 5);
                const eTime = slot.endTime.split('T')[1].substring(0, 5);
                return (
                  <div
                    key={'avail-' + idx}
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <span className="badge badge-confirmed" style={{ marginBottom: '8px' }}>
                        Free Window
                      </span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>
                        {sTime} - {eTime}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        Ready for instant booking
                      </div>
                    </div>

                    <button
                      onClick={() => onQuickBook(selectedResource, selectedDate, sTime, eTime)}
                      className="btn btn-success btn-sm"
                      style={{ width: '100%' }}
                    >
                      <PlusCircle size={14} /> Book Window
                    </button>
                  </div>
                );
              })}

              {/* Booked Slots */}
              {availability.bookedSlots?.map((slot, idx) => {
                const sTime = slot.startTime.split('T')[1].substring(0, 5);
                const eTime = slot.endTime.split('T')[1].substring(0, 5);
                return (
                  <div
                    key={'booked-' + idx}
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <span className="badge badge-pending" style={{ marginBottom: '8px' }}>
                        Reserved Slot
                      </span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>
                        {sTime} - {eTime}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginTop: '4px' }}>
                        {slot.bookingTitle || 'Scheduled Meeting'}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Resource occupied during this time
                    </div>
                  </div>
                );
              })}
            </div>

            {availability.availableSlots?.length === 0 && availability.bookedSlots?.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                All working hours free and available for booking today!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

