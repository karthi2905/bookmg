import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="announcement-wrapper">
      <aside
        className="announcement-bar"
        aria-label="Facility announcement"
        role="region"
      >
        <div className="announcement-content">
          <Sparkles size={16} color="var(--accent-lime)" style={{ flexShrink: 0 }} />
          <span className="announcement-text">
            Notice: Annual Cleanroom &amp; Hardware Lab safety inductions are now open for Q4 scheduling.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <a href="#approvals" className="announcement-pill">
            View schedule
          </a>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="announcement-close"
            aria-label="Dismiss notice"
            title="Dismiss notice"
          >
            <X size={16} />
          </button>
        </div>
      </aside>
    </div>
  );
}
