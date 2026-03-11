import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API = 'http://127.0.0.1:8000';
const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f97316', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'rgba(13,17,23,0.95)',
        border: '1px solid rgba(139,92,246,0.4)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: '0 0 20px rgba(139,92,246,0.2)'
      }}>
        <div style={{ color: '#8b5cf6' }}>{label || payload[0].name}</div>
        <div style={{ color: '#f0f6fc', fontWeight: 700 }}>{payload[0].value}</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, c, p, a] = await Promise.all([
        axios.get(`${API}/analytics/summary`),
        axios.get(`${API}/analytics/by-category`),
        axios.get(`${API}/analytics/by-priority`),
        axios.get(`${API}/analytics/recent-activity`),
      ]);
      setSummary(s.data);
      setByCategory(c.data);
      setByPriority(p.data);
      setActivity(a.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
      <div className="loading-text">INITIALIZING DASHBOARD...</div>
    </div>
  );

  const actionColor = (action) => {
    if (action?.includes('AUTO')) return '#10b981';
    if (action?.includes('HUMAN')) return '#f59e0b';
    if (action?.includes('CREATED')) return '#8b5cf6';
    return '#06b6d4';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">⬡ COMMAND CENTER</div>
        <div className="page-subtitle">REAL-TIME AI TICKET INTELLIGENCE DASHBOARD</div>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <div className="stat-card purple">
          <div className="stat-icon">🎫</div>
          <div className="stat-label">Total Tickets</div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{summary?.total_tickets}</div>
          <div className="stat-sub">ALL TIME</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">⚡</div>
          <div className="stat-label">Auto Resolved</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{summary?.auto_resolved}</div>
          <div className="stat-sub">AI EFFICIENCY: {summary?.ai_efficiency}%</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">👁</div>
          <div className="stat-label">Pending Human</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{summary?.pending_human}</div>
          <div className="stat-sub">NEEDS REVIEW</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon">🎯</div>
          <div className="stat-label">Avg Confidence</div>
          <div className="stat-value" style={{ color: '#06b6d4' }}>
            {summary?.avg_confidence_score
              ? (summary.avg_confidence_score * 100).toFixed(0) + '%'
              : '—'}
          </div>
          <div className="stat-sub">RESOLUTION: {summary?.resolution_rate}%</div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        <div className="card">
          <div className="chart-title">TICKETS BY CATEGORY</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCategory} dataKey="count" nameKey="category"
                cx="50%" cy="50%" outerRadius={85} innerRadius={40}
                paddingAngle={3}
                label={({ category, count }) => `${category}: ${count}`}
              >
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]}
                    style={{ filter: `drop-shadow(0 0 6px ${COLORS[i % COLORS.length]})` }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="chart-title">TICKETS BY PRIORITY</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byPriority} barSize={32}>
              <XAxis dataKey="priority" tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {byPriority.map((entry, i) => (
                  <Cell key={i} fill={
                    entry.priority === 'critical' ? '#ef4444' :
                    entry.priority === 'high' ? '#f97316' :
                    entry.priority === 'medium' ? '#f59e0b' : '#10b981'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ACTIVITY FEED */}
      <div className="card">
        <div className="chart-title">⚡ LIVE ACTIVITY FEED</div>
        {activity.length === 0 ? (
          <div style={{ color: '#30363d', textAlign: 'center', padding: '32px', fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '2px' }}>
            NO ACTIVITY — SUBMIT A TICKET TO BEGIN
          </div>
        ) : (
          <div>
            {activity.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot" style={{
                  background: actionColor(a.action),
                  boxShadow: `0 0 8px ${actionColor(a.action)}`
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono',
                      color: actionColor(a.action),
                      letterSpacing: '1px'
                    }}>{a.action}</span>
                    <span style={{ color: '#30363d', fontSize: '11px' }}>#{a.ticket_id}</span>
                    <span style={{ color: '#8b949e', fontSize: '11px', marginLeft: 'auto' }}>
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '2px', fontFamily: 'Rajdhani' }}>
                    {a.performed_by} · {a.details?.substring(0, 60)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}