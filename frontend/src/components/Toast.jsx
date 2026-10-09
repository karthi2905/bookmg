import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';

  return (
    <div className="toast-container">
      <div className="toast-item">
        {/* Left Color Bar */}
        <div
          className={`toast-bar ${
            isSuccess ? 'toast-bar-success' : isError ? 'toast-bar-error' : 'toast-bar-info'
          }`}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, paddingLeft: '4px' }}>
          {isSuccess ? (
            <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
          ) : isError ? (
            <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
          ) : (
            <Info size={18} color="var(--info)" style={{ flexShrink: 0 }} />
          )}

          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-strong)',
              lineHeight: 1.4,
              wordBreak: 'break-word',
            }}
          >
            {toast.message}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-ghost"
          style={{ padding: '4px', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
