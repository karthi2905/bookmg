import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/TopNavbar';
import Dashboard from '../components/Dashboard';
import ResourceCatalog from '../components/ResourceCatalog';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import MyBookings from '../components/MyBookings';
import ApprovalsDashboard from '../components/ApprovalsDashboard';
import AnalyticsReports from '../components/AnalyticsReports';
import BookingModal from '../components/BookingModal';
import CreateResourceModal from '../components/CreateResourceModal';
import AuthModal from '../components/AuthModal';
import Toast from '../components/Toast';
import { approvalApi, resourceApi } from '../api/client';
import { Server, Sparkles, LogIn } from 'lucide-react';

export default function AppShell({ activeTab = 'dashboard' }) {
  const { user, isAdmin, canApprove, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Modals
  const [bookingModalResource, setBookingModalResource] = useState(null);
  const [bookingModalDate, setBookingModalDate] = useState(null);
  const [bookingModalStartTime, setBookingModalStartTime] = useState(null);
  const [createResourceModalOpen, setCreateResourceModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Approvals Count
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [catalogRefreshKey, setCatalogRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  // If user arrives via "Open dashboard" from landing page (guest=true) and not signed in,
  // automatically prompt them to sign in
  useEffect(() => {
    if (!user && !loading && searchParams.get('guest') === 'true') {
      const timer = setTimeout(() => {
        setAuthModalOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [user, loading, searchParams]);

  const refreshPendingCount = async () => {
    if (!canApprove) {
      setPendingApprovalsCount(0);
      return;
    }
    try {
      const res = await approvalApi.getPending();
      setPendingApprovalsCount(res.data?.length || 0);
    } catch {
      // Backend quiet
    }
  };

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 15000);
    return () => clearInterval(interval);
  }, [canApprove, user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBookResource = (resource) => {
    if (!user) {
      showToast('Please sign in or select a persona to book spaces.', 'error');
      setAuthModalOpen(true);
      return;
    }
    setBookingModalResource(resource);
    setBookingModalDate(null);
    setBookingModalStartTime(null);
  };

  const handleQuickBook = async (resource, date, startTime) => {
    if (!user) {
      showToast('Please sign in to reserve spaces.', 'error');
      setAuthModalOpen(true);
      return;
    }
    try {
      let resData = resource;
      if (typeof resource === 'number' || typeof resource === 'string') {
        const res = await resourceApi.getResourceById(resource);
        resData = res.data;
      }
      setBookingModalResource(resData);
      setBookingModalDate(date);
      setBookingModalStartTime(startTime);
    } catch (err) {
      console.error('Failed to load resource for booking:', err);
    }
  };

  const handleBookingCreated = () => {
    showToast('Booking successfully reserved!');
    refreshPendingCount();
  };

  const handleResourceCreated = () => {
    showToast('New enterprise resource added to catalog!');
    setCatalogRefreshKey((prev) => prev + 1);
  };

  const handleTabChange = (tabId) => {
    const route = tabId === 'catalog' ? 'resources' : tabId;
    navigate(`/app/${route}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-page)' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="badge badge-confirmed" style={{ fontSize: '14px', padding: '10px 20px' }}>
            <span className="badge-dot" /> Loading BookMg Workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="main-app-shell"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-page)',
      }}
    >
      {/* 1. Top Navbar: Logo on left, profile on right, ONLY center navbar options with corner radius */}
      <TopNavbar
        activeTab={activeTab === 'resources' ? 'catalog' : activeTab}
        setActiveTab={handleTabChange}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenApprovals={() => navigate('/app/approvals')}
      />

      {/* 2. Main Content View with Smooth Page Transition Animation */}
      <main
        key={location.pathname}
        className="main-content-layout page-transition-enter"
        style={{
          flex: 1,
          padding: '24px 24px 48px 24px',
          maxWidth: '1340px',
          width: '100%',
          margin: '0 auto',
          minWidth: 0,
        }}
      >
        {/* Guest Mode Banner (When no user is signed in) */}
        {!user && (
          <div className="guest-notice-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(200, 245, 96, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-lime)',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>
                  Browsing in Guest Preview Mode
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.82)', marginTop: '2px' }}>
                  Please sign in to reserve meeting rooms, request sensitive lab benches, and view your schedule.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="btn"
              style={{
                backgroundColor: 'var(--accent-lime)',
                color: 'var(--primary)',
                fontWeight: 700,
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              <LogIn size={15} />
              <span>Sign In to Workspace</span>
            </button>
          </div>
        )}

        {/* Active Tab Component */}
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={(tab) => handleTabChange(tab)}
            onBookResource={handleBookResource}
          />
        )}

        {(activeTab === 'resources' || activeTab === 'catalog') && (
          <ResourceCatalog
            key={catalogRefreshKey}
            onBookResource={handleBookResource}
            onNewResourceClick={() => setCreateResourceModalOpen(true)}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'calendar' && (
          <AvailabilityCalendar onQuickBook={handleQuickBook} />
        )}

        {activeTab === 'bookings' && (
          <MyBookings />
        )}

        {activeTab === 'approvals' && (
          canApprove ? (
            <ApprovalsDashboard onUpdateCount={setPendingApprovalsCount} />
          ) : (
            <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '8px' }}>
                Restricted Approvals Portal
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto' }}>
                Managerial or Administrator sign-in is required to view and authorize restricted laboratory benches.
              </p>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="btn btn-primary"
                style={{ marginTop: '16px', borderRadius: 'var(--radius-pill)' }}
              >
                Sign In as Manager
              </button>
            </div>
          )
        )}

        {activeTab === 'reports' && (
          isAdmin ? (
            <AnalyticsReports />
          ) : (
            <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '8px' }}>
                Enterprise Telemetry &amp; Utilization
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto' }}>
                Administrator credentials are required to view company-wide utilization and occupancy telemetry.
              </p>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="btn btn-primary"
                style={{ marginTop: '16px', borderRadius: 'var(--radius-pill)' }}
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* 3. Clean Workplace Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border)',
          padding: '18px 28px',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>BookMg Enterprise</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={13} color="var(--success)" /> Gateway :8080 | Auth :8081 | Resource :8082 | Booking :8083
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Spring Boot Microservices</span>
          <span>•</span>
          <span>Atomic Lock Detection</span>
          <span>•</span>
          <span>15-Min No-Show Releases</span>
        </div>
      </footer>

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Booking Modal (Radius 24px) */}
      {bookingModalResource && (
        <BookingModal
          resource={bookingModalResource}
          initialDate={bookingModalDate}
          initialStartTime={bookingModalStartTime}
          onClose={() => {
            setBookingModalResource(null);
            setBookingModalDate(null);
            setBookingModalStartTime(null);
          }}
          onBookingSuccess={handleBookingCreated}
        />
      )}

      {/* Create Resource Modal (Radius 24px) */}
      {createResourceModalOpen && (
        <CreateResourceModal
          onClose={() => setCreateResourceModalOpen(false)}
          onCreated={handleResourceCreated}
        />
      )}

      {/* Authentication Modal (Radius 24px) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => showToast(`Welcome, ${u.fullName || u.email}!`)}
      />
    </div>
  );
}
