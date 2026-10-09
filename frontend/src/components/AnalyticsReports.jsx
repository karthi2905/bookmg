import React, { useState, useEffect } from 'react';
import { reportApi } from '../api/client';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  AlertOctagon,
  Building,
  Calendar,
  Filter,
  CheckCircle2,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function AnalyticsReports() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [groupBy, setGroupBy] = useState('DEPARTMENT'); // 'DEPARTMENT' | 'HOURLY'
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hover state for interactive chart tooltip
  const [hoveredBar, setHoveredBar] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getUtilisationReport(startDate, endDate);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const setPresetRange = (preset) => {
    const t = new Date();
    if (preset === 'THIS_MONTH') {
      const s = new Date(t.getFullYear(), t.getMonth(), 1).toISOString().split('T')[0];
      setStartDate(s);
      setEndDate(t.toISOString().split('T')[0]);
    } else if (preset === 'LAST_30') {
      const s = new Date();
      s.setDate(s.getDate() - 30);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(t.toISOString().split('T')[0]);
    } else if (preset === 'THIS_WEEK') {
      const s = new Date();
      s.setDate(s.getDate() - 7);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(t.toISOString().split('T')[0]);
    }
  };

  // Separate most used and least used resources
  const resourceBreakdown = report?.resourceBreakdown || [];
  const mostUsedResources = [...resourceBreakdown].sort((a, b) => b.utilisationPercent - a.utilisationPercent).slice(0, 4);
  const unusedOrLowResources = [...resourceBreakdown].sort((a, b) => a.utilisationPercent - b.utilisationPercent).slice(0, 4);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>
            Utilisation &amp; Analytics
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Campus workspace efficiency, department demand breakdown, and no-show recovery statistics.
          </p>
        </div>

        {/* Filter Bar with Date-Range Picker and Group-By Segmented Control */}
        <div
          className="card"
          style={{
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Quick presets */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setPresetRange('THIS_WEEK')}
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              7D
            </button>
            <button
              type="button"
              onClick={() => setPresetRange('THIS_MONTH')}
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setPresetRange('LAST_30')}
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              30D
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
              style={{ minHeight: '32px', height: '32px', width: '130px', fontSize: '12px', padding: '2px 8px' }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
              style={{ minHeight: '32px', height: '32px', width: '130px', fontSize: '12px', padding: '2px 8px' }}
            />
          </div>

          {/* Group-by segmented control */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-subtle)',
              padding: '2px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => setGroupBy('DEPARTMENT')}
              className="btn btn-sm"
              style={{
                backgroundColor: groupBy === 'DEPARTMENT' ? 'var(--bg-card)' : 'transparent',
                color: groupBy === 'DEPARTMENT' ? 'var(--text-strong)' : 'var(--text-muted)',
                padding: '4px 10px',
                minHeight: '26px',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: groupBy === 'DEPARTMENT' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              By Dept
            </button>
            <button
              type="button"
              onClick={() => setGroupBy('HOURLY')}
              className="btn btn-sm"
              style={{
                backgroundColor: groupBy === 'HOURLY' ? 'var(--bg-card)' : 'transparent',
                color: groupBy === 'HOURLY' ? 'var(--text-strong)' : 'var(--text-muted)',
                padding: '4px 10px',
                minHeight: '26px',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: groupBy === 'HOURLY' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              By Hour
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Computing campus utilisation reports...
        </div>
      ) : !report ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
          No analytics data available for this timeframe.
        </div>
      ) : (
        <>
          {/* 4 KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Total Bookings */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Total Reservations
                </span>
                <Calendar size={16} color="var(--primary)" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-strong)', marginTop: '8px', lineHeight: 1 }}>
                {report.totalBookings}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Across all meeting rooms and labs
              </div>
            </div>

            {/* Total Hours Booked */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Booked Hours
                </span>
                <Clock size={16} color="#2E9E5B" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-strong)', marginTop: '8px', lineHeight: 1 }}>
                {report.totalHoursBooked} hrs
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Occupied duration in timeframe
              </div>
            </div>

            {/* Overall Utilisation Rate */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Campus Utilisation
                </span>
                <TrendingUp size={16} color="#0B2420" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--primary)', marginTop: '8px', lineHeight: 1 }}>
                {report.overallUtilisationRatePercent}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Against 09:00 - 18:00 capacity
              </div>
            </div>

            {/* Auto-Released No-Shows */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
                  No-Show Release Rate
                </span>
                <AlertOctagon size={16} color="var(--warning)" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--warning)', marginTop: '8px', lineHeight: 1 }}>
                {report.noShowRatePercent}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                {report.noShowCount} slots recovered by 15-min scheduler
              </div>
            </div>
          </div>

          {/* Clean Charts using Green/Lime/Teal Palette */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
              gap: '24px',
            }}
            className="reports-charts-grid"
          >
            {/* Chart 1: Hourly Peak Distribution (Rounded bars, tooltips as small white cards) */}
            <div className="card" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-strong)' }}>
                    Peak Demand Hours (Working Window)
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Hourly concentration of reservations across the working day
                  </p>
                </div>
                <Clock size={16} color="var(--text-muted)" />
              </div>

              {/* Tooltip Card when hovering */}
              {hoveredBar && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    padding: '8px 12px',
                    boxShadow: 'var(--shadow-popover)',
                    zIndex: 10,
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>
                    {hoveredBar.hour}:00 Window
                  </div>
                  <div style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {hoveredBar.count} active bookings
                  </div>
                </div>
              )}

              {/* Responsive SVG Chart */}
              <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingTop: '20px' }}>
                {Object.entries(report.hourlyPeakDistribution || {}).map(([hour, count]) => {
                  const maxCount = Math.max(1, ...Object.values(report.hourlyPeakDistribution));
                  const heightPct = Math.max(8, (count / maxCount) * 100);
                  const isHovered = hoveredBar?.hour === hour;

                  return (
                    <div
                      key={hour}
                      onMouseEnter={() => setHoveredBar({ hour, count })}
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                        {count > 0 ? count : ''}
                      </span>
                      <div
                        style={{
                          width: '85%',
                          height: `${heightPct}%`,
                          backgroundColor: isHovered ? 'var(--accent-lime)' : count > 0 ? 'var(--primary)' : 'var(--bg-subtle)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'background-color var(--transition-fast), height 0.3s ease',
                        }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        {hour}:00
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Departmental Demand Share */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-strong)' }}>
                    Departmental Demand Share
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Distribution of booked room &amp; lab hours across teams
                  </p>
                </div>
                <Users size={16} color="var(--text-muted)" />
              </div>

              {report.departmentBreakdown?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No departmental usage recorded.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {report.departmentBreakdown?.map((dept, idx) => {
                    // Green / lime / teal color palette
                    const colors = ['#0B2420', '#2E9E5B', '#9AD0B4', '#12332D', '#D9E2E2'];
                    const barColor = colors[idx % colors.length];

                    return (
                      <div key={dept.department}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{dept.department}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                            {dept.bookingCount} sessions • {dept.totalHours} hrs ({dept.percentageOfTotal}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, dept.percentageOfTotal)}%`,
                              height: '100%',
                              backgroundColor: barColor,
                              borderRadius: '4px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cards for Most used, Unused resources, and No-show rate summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Most Used Resources */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--primary)" /> Most Booked Facilities
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mostUsedResources.map((res) => (
                  <div
                    key={res.resourceId}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>
                        {res.resourceName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {res.bookingCount} bookings • {res.totalHours} hrs
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--primary)',
                      }}
                    >
                      {res.utilisationPercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low-Traffic / Unused Resources */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={16} color="var(--text-muted)" /> Low-Traffic Capacity
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {unusedOrLowResources.map((res) => (
                  <div
                    key={res.resourceId}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>
                        {res.resourceName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Available for reassignment
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                      }}
                    >
                      {res.utilisationPercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* No-Show Scheduler Impact */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertOctagon size={16} color="var(--warning)" /> Auto-Release Efficiency
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.5, marginBottom: '14px' }}>
                If an employee does not check in within 15 minutes of the start time, the slot is automatically released back to the campus catalog.
              </p>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--warning-soft)',
                  border: '1px solid var(--warning-border)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-strong)' }}>
                  {report.noShowCount} Sessions Auto-Released
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-body)', marginTop: '2px' }}>
                  Prevented phantom room occupancy and restored availability for colleagues.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
