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
  Filter
} from 'lucide-react';

export default function AnalyticsReports() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      {/* Header & Date Range Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            Resource Utilisation & Analytics
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px' }}>
            Enterprise space analytics, departmental demand distribution, and automated no-show tracking.
          </p>
        </div>

        {/* Date Selectors */}
        <div className="glass-panel" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Period:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
            style={{ width: '135px', padding: '4px 8px', fontSize: '0.8rem' }}
          />
          <span style={{ color: '#64748b' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
            style={{ width: '135px', padding: '4px 8px', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>Calculating stream analytics...</div>
      ) : !report ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
          No analytics data found for this timeframe.
        </div>
      ) : (
        <div>
          {/* 4 KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
            {/* Total Bookings */}
            <div className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-title">Total Reservations</span>
                <Calendar size={18} color="#6366f1" />
              </div>
              <div className="metric-value">{report.totalBookings}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Across all catalog spaces</div>
            </div>

            {/* Total Hours Booked */}
            <div className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-title">Booked Hours</span>
                <Clock size={18} color="#06b6d4" />
              </div>
              <div className="metric-value">{report.totalHoursBooked} hrs</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Occupied duration in period</div>
            </div>

            {/* Overall Utilisation Rate */}
            <div className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-title">Campus Utilisation</span>
                <TrendingUp size={18} color="#10b981" />
              </div>
              <div className="metric-value" style={{ color: '#34d399' }}>{report.overallUtilisationRatePercent}%</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Vs working hours capacity</div>
            </div>

            {/* No-show rate */}
            <div className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-title">Auto-Released (No-Shows)</span>
                <AlertOctagon size={18} color="#f59e0b" />
              </div>
              <div className="metric-value" style={{ color: '#fbbf24' }}>
                {report.noShowRatePercent}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                {report.noShowCount} rooms freed by 15-min scheduler
              </div>
            </div>
          </div>

          {/* Department Breakdown & Hourly Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            {/* Department Breakdown */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#6366f1" /> Departmental Demand Share
              </h3>

              {report.departmentBreakdown?.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No departmental usage recorded.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {report.departmentBreakdown?.map((dept) => (
                    <div key={dept.department}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{dept.department}</span>
                        <span style={{ color: '#94a3b8' }}>{dept.bookingCount} bookings • {dept.totalHours} hrs ({dept.percentageOfTotal}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, dept.percentageOfTotal)}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hourly Peak Distribution */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#06b6d4" /> Peak Demand Hours (Working Day)
              </h3>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '6px', height: '180px', paddingTop: '20px' }}>
                {Object.entries(report.hourlyPeakDistribution || {}).map(([hour, count]) => {
                  const maxCount = Math.max(1, ...Object.values(report.hourlyPeakDistribution));
                  const heightPct = Math.max(10, (count / maxCount) * 100);

                  return (
                    <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>{count}</span>
                      <div
                        style={{
                          width: '80%',
                          height: `${heightPct}%`,
                          background: count > 0 ? 'linear-gradient(180deg, #06b6d4 0%, #3b82f6 100%)' : '#1e293b',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease'
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>{hour}:00</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resource Utilisation Leaderboard */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="#10b981" /> Space Utilisation Leaderboard
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {report.resourceBreakdown?.map((res) => (
                <div
                  key={res.resourceId}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#0d1322',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{res.resourceName}</h4>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>{res.utilisationPercent}%</span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '10px' }}>
                    {res.bookingCount} sessions • {res.totalHours} hours booked
                  </div>

                  <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, res.utilisationPercent)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

