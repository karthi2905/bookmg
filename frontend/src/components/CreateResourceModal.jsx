import React, { useState } from 'react';
import { resourceApi } from '../api/client';
import { 
  X, 
  Building, 
  MapPin, 
  Users, 
  ShieldAlert, 
  Check, 
  AlertCircle 
} from 'lucide-react';

const RESOURCE_TYPES = [
  { value: 'CONFERENCE_ROOM', label: 'Conference Room' },
  { value: 'BOARDROOM', label: 'Boardroom' },
  { value: 'DESK_POD', label: 'Desk Pod' },
  { value: 'LAB_BENCH', label: 'Lab Bench' },
  { value: 'EQUIPMENT', label: 'Specialized Equipment' },
];

const COMMON_FEATURES = [
  '4K TV & Video Conf',
  'Whiteboard',
  'Microphones',
  'Sound Isolation',
  'Dual Displays',
  'Oscilloscope',
  'Soldering Station',
  'Projector',
  'Executive Chairs'
];

export default function CreateResourceModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('CONFERENCE_ROOM');
  const [capacity, setCapacity] = useState(6);
  const [location, setLocation] = useState('Building A - Floor 2');
  const [description, setDescription] = useState('');
  const [restricted, setRestricted] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState(['4K TV & Video Conf', 'Whiteboard']);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleFeature = (feat) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please specify a resource name');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please specify a location');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      capacity: parseInt(capacity, 10),
      location: location.trim(),
      restricted,
      description: description.trim() || undefined,
      features: selectedFeatures
    };

    setSubmitting(true);
    try {
      await resourceApi.createResource(payload);
      onCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create resource:', err);
      const msg = err.response?.data?.message || 'Failed to create resource. Verify admin permissions.';
      setErrorMsg(msg);
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
              Add Enterprise Resource
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Register a new meeting room, lab, or equipment in the platform catalog
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ margin: '16px 24px 0 24px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: '#fda4af' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Resource Name *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Quantum Boardroom 4A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Type *
              </label>
              <select
                className="input-field"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value} style={{ background: '#0f172a' }}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Capacity (People) *
              </label>
              <input
                type="number"
                min="1"
                max="200"
                className="input-field"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Location & Floor *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Building B - Executive Suite 3"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              className="input-field"
              rows="2"
              placeholder="Brief overview of room suitability, display setup, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Features Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
              Amenities & Equipment
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {COMMON_FEATURES.map((feat) => {
                const active = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: active ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                      background: active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#c7d2fe' : '#94a3b8',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {active ? '✓ ' : '+ '} {feat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Restriction Checkbox */}
          <div style={{ marginBottom: '24px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={restricted}
                onChange={(e) => setRestricted(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#6366f1' }}
              />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9' }}>
                  Restricted Resource (Requires Manager / Admin Approval)
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  Bookings will be created in PENDING_APPROVAL status and must be signed off before access.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

