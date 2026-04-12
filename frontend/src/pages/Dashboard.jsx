import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API = 'http://127.0.0.1:8000';
const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f97316', '#f59e0b'];

// ── ANIMATED NUMBER COUNTER ──
function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const end = parseFloat(value);
    const duration = 1500;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

// ── CUSTOM TOOLTIP ──
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{
      background: 'rgba(13,17,23,0.97)',
      border: '1px solid rgba(139,92,246,0.4)',
      borderRadius: '10px', padding: '10px 14px',
      fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
      boxShadow: '0 0 20px rgba(139,92,246,0.2)'
    }}>
      <div style={{ color: '#8b5cf6', marginBottom: '4px' }}>{label || payload[0]?.name}</div>
      <div style={{ color: '#f0f6fc', fontWeight: 700, fontSize: '14px' }}>{payload[0]?.value}</div>
    </div>
  );
  return null;
};

// ── LIVE INDICATOR ──
function LiveIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981', fontFamily: 'JetBrains Mono', letterSpacing: '1px' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'blink 1.5s infinite' }} />
      LIVE
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAll();
    // AUTO REFRESH every 10 seconds!
    const interval = setInterval(() => {
      fetchAll(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async (silent = false) => {
    if (silent) setRefreshing(true);
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
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
      <div className="loading-text">INITIALIZING COMMAND CENTER...</div>
    </div>
  );

  const actionColor = (action) => {
    if (action?.includes('AUTO')) return '#10b981';
    if (action?.includes('HUMAN')) return '#f59e0b';
    if (action?.includes('CREATED')) return '#8b5cf6';
    if (action?.includes('ESCALATED')) return '#ef4444';
    return '#06b6d4';
  };

  return (
    <div>
      {/* HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">⬡ COMMAND CENTER</div>
          <div className="page-subtitle">REAL-TIME AI TICKET INTELLIGENCE DASHBOARD</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <LiveIndicator />
          <div style={{ fontSize: '10px', color: '#30363d', fontFamily: 'JetBrains Mono' }}>
            {refreshing ? '⟳ REFRESHING...' : `UPDATED ${lastUpdated}`}
          </div>
          <button onClick={() => fetchAll()} style={{
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
            color: '#8b5cf6', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
            fontSize: '10px', fontFamily: 'JetBrains Mono', letterSpacing: '1px'
          }}>⟳ REFRESH</button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        {[
          { icon: '🎫', label: 'TOTAL TICKETS', value: summary?.total_tickets, suffix: '', color: '#8b5cf6', sub: 'ALL TIME', cls: 'purple' },
          { icon: '⚡', label: 'AUTO RESOLVED', value: summary?.auto_resolved, suffix: '', color: '#10b981', sub: `AI EFFICIENCY: ${summary?.ai_efficiency}%`, cls: 'green' },
          { icon: '👁', label: 'PENDING HUMAN', value: summary?.pending_human, suffix: '', color: '#f59e0b', sub: 'NEEDS REVIEW', cls: 'orange' },
          { icon: '🎯', label: 'AVG CONFIDENCE', value: summary?.avg_confidence_score ? (summary.avg_confidence_score * 100).toFixed(0) : 0, suffix: '%', color: '#06b6d4', sub: `RESOLUTION: ${summary?.resolution_rate}%`, cls: 'cyan' },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.cls}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontFamily: 'Orbitron' }}>
              <AnimatedNumber value={s.value} suffix={s.suffix} />
            </div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        <div className="card">
          <div className="chart-title">TICKETS BY CATEGORY</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCategory} dataKey="count" nameKey="category"
                cx="50%" cy="50%" outerRadius={85} innerRadius={40} paddingAngle={3}
                label={({ category, count }) => `${category}: ${count}`}>
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

      {/* HITL QUICK STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'AUTO RESOLVED', value: summary?.auto_resolved, color: '#10b981', icon: '⚡', desc: 'Confidence ≥ 85%' },
          { label: 'HUMAN REVIEW', value: summary?.pending_human, color: '#f59e0b', icon: '👁', desc: 'Confidence 60-85%' },
          { label: 'TOTAL RESOLVED', value: summary?.total_resolved, color: '#8b5cf6', icon: '✅', desc: `Rate: ${summary?.resolution_rate}%` },
        ].map((item, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', borderColor: `${item.color}30` }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
            <div style={{ fontFamily: 'Orbitron', fontSize: '28px', fontWeight: 700, color: item.color }}>
              <AnimatedNumber value={item.value || 0} />
            </div>
            <div style={{ fontSize: '10px', color: item.color, fontFamily: 'JetBrains Mono', letterSpacing: '1px', margin: '6px 0' }}>{item.label}</div>
            <div style={{ fontSize: '11px', color: '#30363d', fontFamily: 'JetBrains Mono' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* LIVE ACTIVITY FEED */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="chart-title" style={{ margin: 0 }}>⚡ LIVE ACTIVITY FEED</div>
          <LiveIndicator />
        </div>
        {activity.length === 0 ? (
          <div style={{ color: '#30363d', textAlign: 'center', padding: '32px', fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '2px' }}>
            NO ACTIVITY — SUBMIT A TICKET TO BEGIN
          </div>
        ) : (
          <div>
            {activity.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0', borderBottom: '1px solid rgba(139,92,246,0.06)',
                animation: 'fadeIn 0.3s ease', opacity: 1
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: actionColor(a.action),
                  boxShadow: `0 0 8px ${actionColor(a.action)}`
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: actionColor(a.action), letterSpacing: '1px' }}>
                      {a.action}
                    </span>
                    <span style={{ color: '#30363d', fontSize: '11px' }}>#{a.ticket_id}</span>
                    <span style={{ color: '#8b949e', fontSize: '11px', marginLeft: 'auto' }}>
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '2px' }}>
                    {a.performed_by} · {a.details?.substring(0, 60)}
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