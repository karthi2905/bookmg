import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ResourceCatalog from './components/ResourceCatalog';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import MyBookings from './components/MyBookings';
import ApprovalsDashboard from './components/ApprovalsDashboard';
import AnalyticsReports from './components/AnalyticsReports';
import BookingModal from './components/BookingModal';
import CreateResourceModal from './components/CreateResourceModal';
import AuthModal from './components/AuthModal';
import { approvalApi, resourceApi } from './api/client';
import { 
  CheckCircle, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Layers, 
  Clock, 
  Info,
  Server
} from 'lucide-react';

function MainLayout() {
  const { user, isAdmin, canApprove, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [bookingModalResource, setBookingModalResource] = useState(null);
  const [bookingModalDate, setBookingModalDate] = useState(null);
  const [createResourceModalOpen, setCreateResourceModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [catalogRefreshKey, setCatalogRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  // Poll or fetch pending approvals count if user can approve
  const refreshPendingCount = async () => {
    if (!canApprove) {
      setPendingApprovalsCount(0);
      return;
    }
    try {
      const res = await approvalApi.getPending();
      setPendingApprovalsCount(res.data.length);
    } catch (err) {
      // Backend may not be reachable or no approvals
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
      showToast('Please sign in or create an account to book spaces.', 'error');
      setAuthModalOpen(true);
      return;
    }
    setBookingModalResource(resource);
    setBookingModalDate(null);
  };

  const handleQuickBook = async (resourceId, date) => {
    if (!user) {
      showToast('Please sign in or create an account to reserve spaces.', 'error');
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await resourceApi.getResourceById(resourceId);
      setBookingModalResource(res.data);
      setBookingModalDate(date);
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="badge badge-pending" style={{ fontSize: '1rem', padding: '12px 24px' }}>
            Initializing BookMg Platform...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingApprovalsCount={pendingApprovalsCount} 
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Toast Notification */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            top: '84px',
            right: '24px',
            zIndex: 1000,
            padding: '12px 20px',
            borderRadius: '12px',
            background: toast.type === 'success' ? '#064e3b' : '#7f1d1d',
            border: `1px solid ${toast.type === 'success' ? '#059669' : '#dc2626'}`,
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle size={18} color="#34d399" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <main style={{ flex: 1, padding: '0 24px 40px 24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'catalog' && (
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

        {activeTab === 'approvals' && canApprove && (
          <ApprovalsDashboard onUpdateCount={setPendingApprovalsCount} />
        )}

        {activeTab === 'reports' && (
          <AnalyticsReports />
        )}
      </main>

      {/* Booking Modal */}
      {bookingModalResource && (
        <BookingModal
          resource={bookingModalResource}
          initialDate={bookingModalDate}
          onClose={() => {
            setBookingModalResource(null);
            setBookingModalDate(null);
          }}
          onBookingSuccess={handleBookingCreated}
        />
      )}

      {/* Create Resource Modal (Admin Only) */}
      {createResourceModalOpen && (
        <CreateResourceModal
          onClose={() => setCreateResourceModalOpen(false)}
          onCreated={handleResourceCreated}
        />
      )}

      {/* Authentication & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => showToast(`Welcome, ${u.fullName || u.email}! Session active.`)}
      />

      {/* Platform Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '24px 32px',
        background: '#090d16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 600, color: '#94a3b8' }}>BookMg Enterprise v1.0.0</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={14} color="#10b981" /> Gateway :8080 | Auth :8081 | Resource :8082 | Booking :8083
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Spring Cloud 2023.0.3</span>
          <span>•</span>
          <span>JJWT 0.12.6</span>
          <span>•</span>
          <span>OpenFeign</span>
          <span>•</span>
          <span>PostgreSQL / H2 In-Memory</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

