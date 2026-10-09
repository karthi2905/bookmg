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
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'LAB', label: 'Laboratory / Bench' },
  { value: 'EQUIPMENT', label: 'Specialized Equipment' },
  { value: 'CONFERENCE_HALL', label: 'Conference Hall / Auditorium' },
];

const COMMON_FEATURES = [
  '4K TV & Video Conf',
  'Whiteboard',
  'Projector',
  'Fume hood',
  'Safety shower',
  'Oscilloscope',
  'Soldering station',
  '3D printer',
  'GPU workstation',
  'Sound Isolation',
  'Dual Displays'
];

export default function CreateResourceModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('MEETING_ROOM');
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
      features: selectedFeatures,
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
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(11, 36, 32, 0.22)',
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-strong)' }}>
              Add Catalog Resource
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Register a new meeting room, engineering lab, or equipment in BookMg
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '4px', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              margin: '16px 24px 0 24px',
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--danger-soft)',
              border: '1px solid var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--danger)',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Resource Name *</label>
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
                <label className="form-label">Type *</label>
                <select
                  className="select-field"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div>
                <label className="form-label">Capacity (People) *</label>
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
                <label className="form-label">Location &amp; Floor *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Building B - Executive Suite 3"
                  list="campus-locations-list"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <datalist id="campus-locations-list">
                  <option value="HQ Tower, Floor 8" />
                  <option value="Cloud Tower, Floor 22" />
                  <option value="Building B, Floor 2" />
                  <option value="Building 42, Floor 1" />
                  <option value="Central Campus, Ground Floor" />
                  <option value="Bay View Campus, Floor 5" />
                  <option value="Tech Hub, Ground Floor" />
                  <option value="Research Complex, Floor 1" />
                  <option value="Engineering Wing, Floor 1" />
                  <option value="Commons Pavilion, Ground Floor" />
                </datalist>
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="textarea-field"
                rows={2}
                placeholder="Brief overview of room suitability, specialized setups, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Features Selection */}
            <div>
              <label className="form-label">Amenities &amp; Specialized Equipment</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {COMMON_FEATURES.map((feat) => {
                  const active = selectedFeatures.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: active ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: active ? 'var(--accent-lime-soft)' : 'var(--bg-subtle)',
                        color: active ? 'var(--text-strong)' : 'var(--text-body)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {active ? '✓ ' : '+ '} {feat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Restriction Checkbox */}
            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={restricted}
                  onChange={(e) => setRestricted(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', marginTop: '2px' }}
                />
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>
                    Restricted Resource (Requires Signoff)
                  </span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Reservations will be submitted in PENDING_APPROVAL status and must be signed off by a manager or administrator.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="modal-footer">
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
