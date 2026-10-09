import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  SlidersHorizontal,
  Calendar,
  X,
  Check
} from 'lucide-react';

const COMMON_AMENITIES = [
  'Whiteboard',
  '4K TV & Video Conf',
  'Projector',
  'Fume hood',
  'Oscilloscope',
  'Soldering station',
  '3D printer',
  'GPU workstation',
  'Sound Isolation',
  'Dual Displays'
];

export default function FilterToolbar({
  selectedDate,
  setSelectedDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  availableOnly,
  setAvailableOnly,
  // Detailed filter props
  selectedType,
  setSelectedType,
  minCapacity,
  setMinCapacity,
  restrictedOnly,
  setRestrictedOnly,
  selectedFeatures = [],
  setSelectedFeatures,
  onResetFilters
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const toggleFeature = (feat) => {
    if (!setSelectedFeatures) return;
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const activeFiltersCount =
    (selectedType ? 1 : 0) +
    (minCapacity ? 1 : 0) +
    (restrictedOnly ? 1 : 0) +
    (selectedFeatures?.length || 0);

  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      {/* Single White Rounded Bar */}
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
        {/* Left: Date Navigation Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleToday}
            className="btn btn-outline btn-sm"
            style={{ fontWeight: 600 }}
          >
            Today
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={handlePrevDay}
              className="btn-ghost btn-sm"
              title="Previous Day"
              style={{ padding: '6px', minWidth: '32px', borderRadius: '6px' }}
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
                style={{
                  minHeight: '34px',
                  height: '34px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  width: '138px',
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="btn-ghost btn-sm"
              title="Next Day"
              style={{ padding: '6px', minWidth: '32px', borderRadius: '6px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Center: Time Window Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime?.(e.target.value)}
            className="input-field"
            style={{
              minHeight: '34px',
              height: '34px',
              padding: '4px 8px',
              fontSize: '13px',
              width: '95px',
            }}
          />

          <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />

          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime?.(e.target.value)}
            className="input-field"
            style={{
              minHeight: '34px',
              height: '34px',
              padding: '4px 8px',
              fontSize: '13px',
              width: '95px',
            }}
          />
        </div>

        {/* Right: Available Toggle & More Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {/* "Available only" Toggle Switch */}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '13px',
              color: 'var(--text-strong)',
              fontWeight: 500,
            }}
          >
            <div
              onClick={() => setAvailableOnly(!availableOnly)}
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '9999px',
                backgroundColor: availableOnly ? 'var(--primary)' : '#D1D5DB',
                position: 'relative',
                transition: 'background-color var(--transition-fast)',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: '2px',
                  left: availableOnly ? '18px' : '2px',
                  transition: 'left var(--transition-fast)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              />
            </div>
            <span>Available only</span>
          </label>

          {/* "More filters" Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={`btn btn-outline btn-sm ${drawerOpen ? 'btn-secondary' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              backgroundColor: drawerOpen ? 'var(--bg-subtle)' : 'transparent',
            }}
          >
            <SlidersHorizontal size={14} />
            <span>More filters</span>
            {activeFiltersCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Popover / Panel */}
      {drawerOpen && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '100%',
            maxWidth: '460px',
            padding: '20px',
            zIndex: 'var(--z-dropdown)',
            boxShadow: 'var(--shadow-popover)',
            animation: 'fadeIn 120ms ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-strong)' }}>
              Filter Resources
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn-ghost"
              style={{ padding: '4px', border: 'none', cursor: 'pointer' }}
            >
              <X size={16} color="var(--text-muted)" />
            </button>
          </div>

          {/* Resource Type */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Resource Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType?.(e.target.value)}
              className="select-field"
            >
              <option value="">All Spaces &amp; Equipment</option>
              <option value="MEETING_ROOM">Meeting Rooms</option>
              <option value="LAB">Laboratories</option>
              <option value="EQUIPMENT">Specialized Equipment</option>
              <option value="CONFERENCE_HALL">Auditoriums &amp; Halls</option>
            </select>
          </div>

          {/* Minimum Capacity */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Minimum Capacity</label>
            <select
              value={minCapacity}
              onChange={(e) => setMinCapacity?.(e.target.value)}
              className="select-field"
            >
              <option value="">Any Capacity</option>
              <option value="4">4+ People</option>
              <option value="8">8+ People</option>
              <option value="15">15+ People</option>
              <option value="50">50+ People</option>
            </select>
          </div>

          {/* Restricted Only */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text-strong)',
              }}
            >
              <input
                type="checkbox"
                checked={restrictedOnly}
                onChange={(e) => setRestrictedOnly?.(e.target.checked)}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <span>Restricted only (requires approvals)</span>
            </label>
          </div>

          {/* Features Multiselect */}
          {setSelectedFeatures && (
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Equipment &amp; Facilities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {COMMON_AMENITIES.map((feat) => {
                  const isSelected = selectedFeatures.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: isSelected ? 'var(--accent-lime-soft)' : 'var(--bg-subtle)',
                        color: isSelected ? 'var(--text-strong)' : 'var(--text-body)',
                        fontSize: '12px',
                        fontWeight: isSelected ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {feat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={onResetFilters}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Reset Filters
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn btn-primary btn-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
