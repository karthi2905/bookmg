import React, { useState, useEffect } from 'react';
import { resourceApi } from '../api/client';
import { 
  Search, 
  Users, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  CalendarPlus, 
  Tv, 
  Sparkles,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

export default function ResourceCatalog({ onBookResource, onNewResourceClick, isAdmin }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [restrictedOnly, setRestrictedOnly] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType) params.type = selectedType;
      if (search) params.search = search;
      if (minCapacity) params.minCapacity = minCapacity;
      if (restrictedOnly) params.restricted = true;

      const res = await resourceApi.getResources(params);
      setResources(res.data);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedType, search, minCapacity, restrictedOnly]);

  const typeTabs = [
    { label: 'All Resources', value: '' },
    { label: 'Meeting Rooms', value: 'MEETING_ROOM' },
    { label: 'Laboratories', value: 'LAB' },
    { label: 'Equipment', value: 'EQUIPMENT' },
    { label: 'Auditoriums', value: 'CONFERENCE_HALL' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ 
        padding: '32px', 
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '750px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontSize: '0.78rem', fontWeight: 600, marginBottom: '12px' }}>
            <Sparkles size={14} /> Instant Atomic Scheduling & Approvals
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2, marginBottom: '10px' }}>
            Book Meeting Rooms, Labs & Hardware
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.98rem', lineHeight: 1.6 }}>
            Reserve conference spaces, engineering labs, and AV equipment with zero scheduling conflicts, automated 15-minute no-show releases, and manager approvals.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onNewResourceClick}
            className="btn btn-primary"
            style={{ position: 'absolute', right: '32px', bottom: '32px', zIndex: 2 }}
          >
            <Plus size={16} /> Add Catalog Resource
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Type Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {typeTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedType(tab.value)}
                className="btn btn-sm"
                style={{
                  background: selectedType === tab.value ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#1e293b',
                  color: selectedType === tab.value ? '#ffffff' : '#94a3b8',
                  border: selectedType === tab.value ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  fontWeight: 600
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Capacity, Restricted Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search name, room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
              />
            </div>

            <select
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              className="select-field"
              style={{ width: '130px', fontSize: '0.85rem' }}
            >
              <option value="">Any Capacity</option>
              <option value="4">4+ People</option>
              <option value="8">8+ People</option>
              <option value="15">15+ People</option>
              <option value="50">50+ People</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#94a3b8' }}>
              <input
                type="checkbox"
                checked={restrictedOnly}
                onChange={(e) => setRestrictedOnly(e.target.checked)}
                style={{ accentColor: '#a855f7' }}
              />
              Restricted Only
            </label>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>Loading catalog resources...</div>
      ) : resources.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
          No resources match the selected filter criteria.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px'
        }}>
          {resources.map((item) => (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                position: 'relative'
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className={`badge ${
                    item.type === 'MEETING_ROOM' ? 'badge-confirmed' :
                    item.type === 'LAB' ? 'badge-checkedin' :
                    item.type === 'CONFERENCE_HALL' ? 'badge-restricted' : 'badge-pending'
                  }`}>
                    {item.type.replace('_', ' ')}
                  </span>

                  {item.restricted ? (
                    <span className="badge badge-restricted" title="Requires manager/admin approval">
                      <ShieldAlert size={12} /> Approval Required
                    </span>
                  ) : (
                    <span className="badge badge-confirmed" title="Instant confirmation">
                      <ShieldCheck size={12} /> Instant Book
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                  {item.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#6366f1" /> {item.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} color="#06b6d4" /> {item.capacity} {item.capacity === 1 ? 'Unit' : 'Seats'}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px', minHeight: '38px' }}>
                  {item.description || 'Enterprise managed bookable resource with smart calendar synchronization.'}
                </p>

                {/* Features Tags */}
                {item.features && item.features.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {item.features.map((feat) => (
                      <span
                        key={feat}
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          background: '#1e293b',
                          color: '#cbd5e1',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.06)'
                        }}
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onBookResource(item)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <CalendarPlus size={16} /> Book Resource
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

