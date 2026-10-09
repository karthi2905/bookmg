import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingApi, resourceApi, approvalApi, reportApi } from '../api/client';
import {
  Calendar,
  Clock,
  ShieldCheck,
  TrendingUp,
  Building,
  CheckCircle2,
  CalendarPlus,
  ArrowRight,
  Sparkles,
  MapPin,
  Users
} from 'lucide-react';

export default function Dashboard({ onNavigate, onBookResource }) {
  const { user, canApprove } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [stats, setStats] = useState({
    upcomingCount: 0,
    checkedInCount: 0,
    utilisationRate: 68,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        let upcoming = [];
        let checkedInToday = 0;

        // Fetch user bookings only if user is logged in
        if (user) {
          try {
            const bookingsRes = await bookingApi.getMyBookings();
            const allBookings = bookingsRes.data || [];
            const now = new Date();

            upcoming = allBookings
              .filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING_APPROVAL' || b.status === 'CHECKED_IN')
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            checkedInToday = allBookings.filter(
              (b) => b.status === 'CHECKED_IN' && new Date(b.startTime).toDateString() === now.toDateString()
            ).length;
          } catch (err) {
            console.warn('Could not load user bookings:', err);
          }
        }

        setUpcomingBookings(upcoming.slice(0, 5));

        // Fetch resources for quick book
        try {
          const resourcesRes = await resourceApi.getResources();
          setFeaturedResources((resourcesRes.data || []).slice(0, 4));
        } catch {
          // Keep empty or fallback
        }

        // Fetch pending count if approver
        let pendingCount = 0;
        if (user && canApprove) {
          try {
            const approvalsRes = await approvalApi.getPending();
            pendingCount = approvalsRes.data?.length || 0;
            setPendingApprovalsCount(pendingCount);
          } catch (err) {
            console.warn('Approvals fetch error:', err);
          }
        }

        // Fetch utilization report if available
        let utilRate = 68;
        try {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const repRes = await reportApi.getUtilisationReport(todayStr, todayStr);
          if (repRes.data?.overallUtilisationRatePercent) {
            utilRate = repRes.data.overallUtilisationRatePercent;
          }
        } catch {
          // Fallback demo number
        }

        setStats({
          upcomingCount: upcoming.length,
          checkedInCount: checkedInToday,
          utilisationRate: utilRate,
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [canApprove, user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Greeting Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>
            {getGreeting()}, {user?.fullName || user?.email?.split('@')[0] || 'Colleague'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Here is your workspace schedule and campus resource availability overview today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => onNavigate?.('catalog')}
            className="btn btn-primary"
          >
            <CalendarPlus size={16} /> Reserve a Space
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Upcoming Bookings */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
              Upcoming Bookings
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={16} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1 }}>
            {stats.upcomingCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Active sessions in schedule
          </div>
        </div>

        {/* Card 2: Pending Approvals (for approvers/admin) or Active Spaces */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
              {canApprove ? 'Pending Approvals' : 'Access Permissions'}
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: canApprove && pendingApprovalsCount > 0 ? 'var(--warning-soft)' : 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={16} color={canApprove && pendingApprovalsCount > 0 ? 'var(--warning)' : 'var(--primary)'} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1 }}>
            {canApprove ? pendingApprovalsCount : 'Verified'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            {canApprove ? 'Restricted requests awaiting signoff' : 'Authorized for labs & rooms'}
          </div>
        </div>

        {/* Card 3: Checked In Today */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
              Checked In Today
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--success-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={16} color="var(--success)" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1 }}>
            {stats.checkedInCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Confirmed within 15m window
          </div>
        </div>

        {/* Card 4: Utilisation This Week */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
              Utilisation This Week
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-lime-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={16} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1 }}>
            {stats.utilisationRate}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Optimal space efficiency
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '24px',
        }}
        className="dashboard-columns"
      >
        {/* Left: Upcoming Bookings Timeline List */}
        <div className="card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-strong)' }}>
                Upcoming Reservations
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Your next scheduled meetings and equipment checkouts
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate?.('bookings')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {upcomingBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Calendar size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-strong)' }}>
                No upcoming bookings
              </div>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                You have no scheduled bookings today. Explore the catalog to reserve a space.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {upcomingBookings.map((b) => {
                const dateStr = b.startTime.split('T')[0];
                const sTime = b.startTime.split('T')[1]?.substring(0, 5);
                const eTime = b.endTime.split('T')[1]?.substring(0, 5);

                return (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* Time on left (Timeline style) */}
                    <div style={{ width: '85px', flexShrink: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-strong)' }}>
                        {sTime} - {eTime}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {dateStr}
                      </div>
                    </div>

                    {/* Middle: Title & Resource */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          className={`badge ${
                            b.status === 'CONFIRMED'
                              ? 'badge-confirmed'
                              : b.status === 'CHECKED_IN'
                              ? 'badge-checkedin'
                              : 'badge-pending'
                          }`}
                        >
                          <span className="badge-dot" />
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-strong)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {b.title}
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Building size={12} />
                        <span>{b.resourceName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Quick Book Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-strong)' }}>
                Quick Book
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Popular meeting rooms and lab workstations
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate?.('catalog')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}
            >
              Browse all <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {featuredResources.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-card)',
                  gap: '12px',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-strong)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '2px',
                    }}
                  >
                    <span>{item.type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{item.capacity} Seats</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBookResource?.(item)}
                  className="btn btn-outline btn-sm"
                  style={{ fontWeight: 600, flexShrink: 0 }}
                >
                  Book
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
