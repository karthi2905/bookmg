import React, { useState, useEffect } from 'react';
import { approvalApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LAB_REQUIREMENTS_MAP, DEFAULT_LAB_REQUIREMENTS } from '../constants/facilities';
import {
  ShieldCheck,
  Check,
  X,
  Clock,
  Building,
  User,
  AlertTriangle,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Repeat,
  FileText
} from 'lucide-react';

export default function ApprovalsDashboard({ onUpdateCount }) {
  const { user } = useAuth();
  const [pendingList, setPendingList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionNotes, setDecisionNotes] = useState({});
  const [alert, setAlert] = useState({ text: '', type: '' });
  const [processingId, setProcessingId] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.getPending();
      const list = res.data || [];
      setPendingList(list);
      if (onUpdateCount) onUpdateCount(list.length);
      if (list.length > 0) {
        setSelectedItem(list[0]);
      } else {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      const note = decisionNotes[id] || 'Approved by Approver';
      await approvalApi.approve(id, note);
      setAlert({ text: 'Booking request approved and confirmed!', type: 'success' });
      fetchPending();
    } catch (err) {
      setAlert({ text: err.response?.data?.message || 'Failed to approve booking.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      const note = decisionNotes[id] || 'Rejected by Approver';
      await approvalApi.reject(id, note);
      setAlert({ text: 'Booking request rejected and released.', type: 'success' });
      fetchPending();
    } catch (err) {
      setAlert({ text: err.response?.data?.message || 'Failed to reject booking.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>
            Approvals Queue
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Review and sign off on restricted facilities, lab equipment, and boardroom bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPending}
          className="btn btn-outline btn-sm"
        >
          <RefreshCw size={14} /> Refresh Queue
        </button>
      </div>

      {/* Alert Notification */}
      {alert.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: alert.type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)',
            border: `1px solid ${alert.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
            color: alert.type === 'success' ? 'var(--success)' : 'var(--danger)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{alert.text}</span>
          <button
            type="button"
            onClick={() => setAlert({ text: '', type: '' })}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading approval requests...
        </div>
      ) : pendingList.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={26} color="var(--success)" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-strong)' }}>
            Approval Queue is Empty
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px' }}>
            There are currently no pending restricted resource bookings awaiting your approval.
          </p>
        </div>
      ) : (
        /* Two-Pane Layout */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.4fr)',
            gap: '24px',
            alignItems: 'start',
          }}
          className="approvals-two-pane"
        >
          {/* LEFT PANE: Request List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Pending Requests ({pendingList.length})
            </div>

            {pendingList.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const dateStr = item.startTime?.split('T')[0];
              const sTime = item.startTime?.split('T')[1]?.substring(0, 5);
              const eTime = item.endTime?.split('T')[1]?.substring(0, 5);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="card"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: isSelected ? 'var(--bg-subtle)' : 'var(--bg-card)',
                    boxShadow: isSelected ? 'var(--shadow-popover)' : 'var(--shadow-card)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="badge badge-pending">
                      <span className="badge-dot" /> Pending Review
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {dateStr}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--text-strong)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '4px',
                    }}
                  >
                    {item.title}
                  </h3>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-strong)' }}>{item.resourceName}</span>
                    <span>•</span>
                    <span>{sTime} - {eTime}</span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Requested by: <strong>{item.userEmail}</strong> ({item.department || 'EMPLOYEE'})
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT PANE: Detail Pane */}
          {selectedItem ? (
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge badge-pending">
                    <span className="badge-dot" /> Action Required
                  </span>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-body)' }}>
                    Restricted Asset
                  </span>
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-strong)' }}>
                  {selectedItem.title}
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Reference ID: #{selectedItem.id}
                </div>
              </div>

              {/* Requester & Resource Information */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Requester
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)', marginTop: '2px' }}>
                    {selectedItem.userEmail}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Dept: {selectedItem.department || 'ENGINEERING'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Target Facility
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)', marginTop: '2px' }}>
                    {selectedItem.resourceName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedItem.startTime?.split('T')[0]} • {selectedItem.startTime?.split('T')[1]?.substring(0, 5)} - {selectedItem.endTime?.split('T')[1]?.substring(0, 5)}
                  </div>
                </div>
              </div>

              {/* Purpose & Notes */}
              {selectedItem.description && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Purpose / Notes
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-strong)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{selectedItem.description}"
                  </p>
                </div>
              )}

              {/* Requirements Acknowledged (Checklist Status) */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Safety &amp; Compliance Checklist (Acknowledged by Requester)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(LAB_REQUIREMENTS_MAP[selectedItem.resourceName] || DEFAULT_LAB_REQUIREMENTS).map((req, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: 'var(--text-strong)',
                        backgroundColor: 'var(--success-soft)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      <CheckCircle2 size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Note Textarea */}
              <div>
                <label className="form-label">Approver Feedback / Comments (Optional)</label>
                <textarea
                  placeholder="Provide guidance, required safety conditions, or reason..."
                  value={decisionNotes[selectedItem.id] || ''}
                  onChange={(e) => setDecisionNotes({ ...decisionNotes, [selectedItem.id]: e.target.value })}
                  className="textarea-field"
                  rows={2}
                  style={{ fontSize: '13px' }}
                />
              </div>

              {/* Action Buttons: Approve (dark) and Reject (outlined danger) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleReject(selectedItem.id)}
                  disabled={processingId === selectedItem.id}
                  className="btn btn-danger"
                >
                  <X size={15} /> Reject Request
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(selectedItem.id)}
                  disabled={processingId === selectedItem.id}
                  className="btn btn-primary"
                >
                  <Check size={15} /> Approve Reservation
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a request from the left list to review details.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
