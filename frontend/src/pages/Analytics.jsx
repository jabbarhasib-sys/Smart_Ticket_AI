import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';

const API = 'http://127.0.0.1:8000';
const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f97316', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '10px', padding: '10px 14px', fontFamily: 'JetBrains Mono', fontSize: '11px', boxShadow: '0 0 20px rgba(139,92,246,0.2)' }}>
      <div style={{ color: '#8b5cf6', marginBottom: '4px' }}>{label || payload[0]?.name}</div>
      <div style={{ color: '#f0f6fc', fontWeight: 700, fontSize: '14px' }}>{payload[0]?.value}</div>
    </div>
  );
  return null;
};

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [confidence, setConfidence] = useState([]);
  const [hitl, setHitl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, cat, pri, sta, con, h] = await Promise.all([
        axios.get(`${API}/analytics/summary`),
        axios.get(`${API}/analytics/by-category`),
        axios.get(`${API}/analytics/by-priority`),
        axios.get(`${API}/analytics/by-status`),
        axios.get(`${API}/analytics/confidence-distribution`),
        axios.get(`${API}/analytics/hitl-metrics`),
      ]);
      setSummary(s.data);
      setByCategory(cat.data);
      setByPriority(pri.data);
      setByStatus(sta.data);
      setConfidence(con.data);
      setHitl(h.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
      <div className="loading-text">LOADING ANALYTICS...</div>
    </div>
  );

  const MetricCard = ({ label, value, sub, color, icon }) => (
    <div className="stat-card" style={{ cursor: 'default' }}>
      <div style={{ fontSize: '24px', marginBottom: '10px', filter: `drop-shadow(0 0 8px ${color})` }}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color, fontFamily: 'Orbitron', fontSize: '28px' }}>{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">◎ ANALYTICS</div>
        <div className="page-subtitle">AI PERFORMANCE METRICS · HITL SYSTEM INSIGHTS</div>
      </div>

      {/* TOP METRICS */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <MetricCard label="AI EFFICIENCY" value={`${summary?.ai_efficiency}%`} sub="TICKETS AUTO-RESOLVED" color="#10b981" icon="⚡" />
        <MetricCard label="RESOLUTION RATE" value={`${summary?.resolution_rate}%`} sub="TOTAL RESOLVED" color="#8b5cf6" icon="◎" />
        <MetricCard label="AVG CONFIDENCE" value={summary?.avg_confidence_score ? `${(summary.avg_confidence_score * 100).toFixed(0)}%` : '—'} sub="ACROSS ALL TICKETS" color="#06b6d4" icon="🎯" />
        <MetricCard label="HITL ACCURACY" value={`${hitl?.system_accuracy || 0}%`} sub="SYSTEM WORKING CORRECTLY" color="#f59e0b" icon="🧠" />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="charts-row">
        <div className="card">
          <div className="chart-title">CATEGORY BREAKDOWN</div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={byCategory} dataKey="count" nameKey="category"
                cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={4}
                label={({ category, count }) => `${category}: ${count}`}
                labelLine={{ stroke: 'rgba(139,92,246,0.3)' }}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]}
                    style={{ filter: `drop-shadow(0 0 8px ${COLORS[i % COLORS.length]}66)` }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="chart-title">PRIORITY DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={byPriority} barSize={36}>
              <XAxis dataKey="priority" tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {byPriority.map((e, i) => (
                  <Cell key={i} fill={
                    e.priority === 'critical' ? '#ef4444' :
                    e.priority === 'high' ? '#f97316' :
                    e.priority === 'medium' ? '#f59e0b' : '#10b981'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="charts-row" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="chart-title">STATUS OVERVIEW</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={byStatus} layout="vertical" barSize={20}>
              <XAxis type="number" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="status" type="category" tick={{ fill: '#8b949e', fontSize: 10, fontFamily: 'JetBrains Mono' }} width={120} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]}
                style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.4))' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="chart-title">CONFIDENCE DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={confidence} barSize={32}>
              <XAxis dataKey="range" tick={{ fill: '#8b949e', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {confidence.map((e, i) => (
                  <Cell key={i} fill={
                    e.range?.includes('Very High') ? '#10b981' :
                    e.range?.includes('High') ? '#22c55e' :
                    e.range?.includes('Medium') ? '#f59e0b' :
                    e.range?.includes('Low (') ? '#f97316' : '#ef4444'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HITL SYSTEM */}
      {hitl && (
        <div className="card">
          <div className="chart-title">⚙ HITL DECISION ENGINE STATUS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '8px' }}>
            {[
              { count: hitl.high_confidence_auto_resolved, label: 'HIGH CONFIDENCE', sub: 'AUTO RESOLVED', threshold: 'CONF ≥ 85%', color: '#10b981', icon: '⚡' },
              { count: hitl.medium_confidence_human_review, label: 'MEDIUM CONFIDENCE', sub: 'HUMAN REVIEW', threshold: 'CONF 60–85%', color: '#f59e0b', icon: '👁' },
              { count: hitl.low_confidence_escalated, label: 'LOW CONFIDENCE', sub: 'ESCALATED', threshold: 'CONF < 60%', color: '#ef4444', icon: '🚨' },
            ].map((item, i) => (
              <div key={i} style={{
                background: `${item.color}10`,
                border: `1px solid ${item.color}30`,
                borderRadius: '12px', padding: '20px', textAlign: 'center',
                boxShadow: `0 0 20px ${item.color}15`
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '32px', fontWeight: 700, color: item.color, marginBottom: '8px' }}>
                  {item.count}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: item.color, letterSpacing: '1px', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>{item.sub}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#30363d', marginTop: '8px', letterSpacing: '1px', padding: '4px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                  {item.threshold}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}