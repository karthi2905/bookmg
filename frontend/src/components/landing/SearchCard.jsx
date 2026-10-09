import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, Clock, Users, ArrowRight, Lock } from 'lucide-react';

const TABS = [
  { id: '', label: 'All' },
  { id: 'MEETING_ROOM', label: 'Meeting rooms' },
  { id: 'LAB', label: 'Labs' },
  { id: 'EQUIPMENT', label: 'Equipment' },
];

const LOCATION_CHIPS = [
  'Block A',
  'Block B',
  'Block C',
  'Innovation Wing',
  'Ground floor',
  'Floor 2',
];

export default function SearchCard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [minCapacity, setMinCapacity] = useState(4);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (query.trim()) params.set('q', query.trim());
    if (date) params.set('date', date);
    if (startTime) params.set('start', startTime);
    if (endTime) params.set('end', endTime);
    if (minCapacity > 1) params.set('minCapacity', minCapacity);
    if (selectedLocation) params.set('location', selectedLocation);
    if (needsApproval) params.set('restricted', 'true');

    const targetUrl = `/app/resources?${params.toString()}`;

    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent(targetUrl)}`);
    } else {
      navigate(targetUrl);
    }
  };

  const toggleLocation = (loc) => {
    setSelectedLocation((prev) => (prev === loc ? '' : loc));
  };

  return (
    <div className="hero-search-card" role="search">
      {/* Segmented Type Tabs across the top */}
      <div className="search-card-tabs" role="tablist" aria-label="Resource type filter">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={type === tab.id}
            onClick={() => setType(tab.id)}
            className={`search-card-tab ${type === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Search Row */}
      <form onSubmit={handleSearch}>
        <div className="search-card-grid">
          {/* Keyword Field */}
          <div style={{ position: 'relative', minWidth: '140px' }}>
            <label htmlFor="search-keyword" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Resource Name
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="search-keyword"
                type="text"
                placeholder="Search by room, lab or equipment name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '36px', height: '44px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Date Field */}
          <div style={{ minWidth: '140px' }}>
            <label htmlFor="search-date" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Date
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="search-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                style={{ height: '44px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Time Window Field */}
          <div style={{ minWidth: '140px' }}>
            <label htmlFor="search-time" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Time Range
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                id="search-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
                style={{ height: '44px', padding: '6px 8px', fontSize: '12px', minWidth: '65px' }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>–</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field"
                style={{ height: '44px', padding: '6px 8px', fontSize: '12px', minWidth: '65px' }}
              />
            </div>
          </div>

          {/* Capacity Stepper */}
          <div style={{ minWidth: '140px' }}>
            <label htmlFor="search-capacity" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Capacity Stepper
            </label>
            <div style={{ position: 'relative' }}>
              <Users
                size={14}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="search-capacity"
                type="number"
                min="1"
                max="250"
                value={minCapacity}
                onChange={(e) => setMinCapacity(parseInt(e.target.value, 10) || 1)}
                className="input-field"
                style={{ height: '44px', paddingLeft: '32px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Dark Search Button */}
          <div style={{ alignSelf: 'flex-end', minWidth: '120px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                height: '44px',
                padding: '0 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              <span>Search</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Quick-filter location chips and lime-outlined "Needs approval" */}
        <div className="search-chip-row">
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '2px', flexShrink: 0 }}>
            Locations:
          </span>

          {LOCATION_CHIPS.map((loc) => {
            const isSelected = selectedLocation === loc;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => toggleLocation(loc)}
                className={`search-filter-chip ${isSelected ? 'active' : ''}`}
              >
                {loc}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setNeedsApproval(!needsApproval)}
            className={`search-filter-chip chip-restricted ${needsApproval ? 'active' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
          >
            <Lock size={11} />
            <span>Needs approval</span>
          </button>
        </div>
      </form>
    </div>
  );
}
