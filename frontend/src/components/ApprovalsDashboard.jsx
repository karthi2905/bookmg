import React, { useState, useEffect } from 'react';
import { approvalApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  Check, 
  X, 
  Clock, 
  Building, 
  User, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function ApprovalsDashboard({ onUpdateCount }) {
  const { user } = useAuth();
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decisionNotes, setDecisionNotes] = useState({});
  const [alert, setAlert] = useState({ text: '', type: '' });

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.getPending();
      setPendingList(res.data);
      if (onUpdateCount) onUpdateCount(res.data.length);
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
    try {
      const note = decisionNotes[id] || 'Approved by Manager';
      await approvalApi.approve(id, note);
      setAlert({ text: 'Booking successfully approved!', type: 'success' });
      fetchPending();
    } catch (err) {
      setAlert({ text: err.response?.data?.message || 'Failed to approve booking.', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      const note = decisionNotes[id] || 'Rejected by Manager';
      await approvalApi.reject(id, note);
      setAlert({ text: 'Booking request rejected.', type: 'success' });
      fetchPending();
    } catch (err) {
      setAlert({ text: err.response?.data?.message || 'Failed to reject booking.', type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            Restricted Resource Approvals
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px' }}>
            Review pending requests for executive boardrooms, specialized research labs, and restricted AV equipment.
          </p>
        </div>

        <button onClick={fetchPending} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Queue
        </button>
      </div>

      {alert.text && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            background: alert.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${alert.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: alert.type === 'success' ? '#34d399' : '#f87171',
            fontSize: '0.88rem',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>{alert.text}</span>
          <button onClick={() => setAlert({ text: '', type: '' })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>Loading pending approvals...</div>
      ) : pendingList.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <CheckSquare size={36} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>Approval Queue is Clear</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>No pending restricted resource requests awaiting your review.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendingList.map((item) => {
            const dateStr = item.startTime.split('T')[0];
            const startTimeStr = item.startTime.split('T')[1].substring(0, 5);
            const endTimeStr = item.endTime.split('T')[1].substring(0, 5);

            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                  flexWrap: 'wrap'
                }}
              >
                {/* Details */}
                <div style={{ flex: '1 1 400px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-pending">Pending Approval</span>
                    <span className="badge badge-restricted">Restricted Asset</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                    {item.title}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.84rem', color: '#94a3b8', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e2e8f0', fontWeight: 600 }}>
                      <Building size={14} color="#6366f1" /> {item.resourceName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <User size={14} color="#06b6d4" /> {item.userEmail} ({item.department})
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} color="#f59e0b" /> {dateStr} • {startTimeStr} - {endTimeStr}
                    </span>
                  </div>

                  {item.description && (
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px' }}>
                      "{item.description}"
                    </p>
                  )}

                  {/* Note Input */}
                  <input
                    type="text"
                    placeholder="Optional feedback / approval note..."
                    value={decisionNotes[item.id] || ''}
                    onChange={(e) => setDecisionNotes({ ...decisionNotes, [item.id]: e.target.value })}
                    className="input-field"
                    style={{ fontSize: '0.82rem', padding: '6px 12px', maxWidth: '420px' }}
                  />
                </div>

                {/* Approve/Reject Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <X size={15} /> Reject
                  </button>

                  <button
                    onClick={() => handleApprove(item.id)}
                    className="btn btn-success btn-sm"
                  >
                    <Check size={15} /> Approve Reservation
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

