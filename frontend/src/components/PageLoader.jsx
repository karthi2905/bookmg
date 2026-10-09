import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageLoader() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Start page transition progress
    setVisible(true);
    setProgress(25);

    const timer1 = setTimeout(() => {
      setProgress(65);
    }, 80);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 200);

    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #10B981 0%, #C8F560 50%, #10B981 100%)',
          boxShadow: '0 0 14px rgba(200, 245, 96, 0.9), 0 0 4px rgba(16, 185, 129, 0.8)',
          transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms ease-out',
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
