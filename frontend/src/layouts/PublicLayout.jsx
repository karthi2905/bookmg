import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnnouncementBar from '../components/landing/AnnouncementBar';
import PublicNavbar from '../components/landing/PublicNavbar';
import Footer from '../components/landing/Footer';
import AuthModal from '../components/AuthModal';
import Toast from '../components/Toast';
import '../components/landing/landing.css';

export default function PublicLayout({ children }) {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAuthSuccess = (user) => {
    showToast(`Welcome, ${user.fullName || user.email}! Redirecting to workspace...`);
    setTimeout(() => {
      navigate('/app/dashboard');
    }, 400);
  };

  return (
    <div className="landing-page page-transition-enter">
      {/* 1. Announcement Strip */}
      <AnnouncementBar />

      {/* 2. Public Navbar */}
      <PublicNavbar onOpenAuth={() => setAuthModalOpen(true)} />

      {/* 3. Page Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* 4. Public Footer */}
      <Footer />

      {/* Auth Modal with Corner Radius 24px */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
