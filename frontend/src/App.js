import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import TicketQueue from './pages/TicketQueue';
import SubmitTicket from './pages/SubmitTicket';
import Analytics from './pages/Analytics';
import axios from 'axios';

const API = 'http://54.80.7.105:8000';

const NAV = [
  { id: 'dashboard', icon: '⬡', label: 'DASHBOARD' },
  { id: 'queue',     icon: '◈', label: 'TICKET QUEUE' },
  { id: 'submit',    icon: '⊕', label: 'SUBMIT TICKET' },
  { id: 'analytics', icon: '◎', label: 'ANALYTICS' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [pendingCount, setPendingCount] = useState(0);

  // ── THEME — remembers across refresh ──
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // ── Apply theme to body ──
  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // ── Fetch pending count every 10 seconds ──
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get(`${API}/analytics/summary`);
        setPendingCount(res.data.pending_human || 0);
      } catch (e) {}
    };
    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    if (page === 'dashboard') return <Dashboard />;
    if (page === 'queue') return <TicketQueue />;
    if (page === 'submit') return <SubmitTicket />;
    if (page === 'analytics') return <Analytics />;
  };

  return (
    <div className="app">
      <div className="sidebar">

        {/* LOGO */}
        <div className="sidebar-logo">
          ⬡ SMART TICKET
          <span className="sub">AI · HITL · ENTERPRISE</span>
        </div>

        {/* NAV ITEMS */}
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-item ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span style={{ fontSize: '18px' }}>{n.icon}</span>
            {n.label}
            {n.id === 'queue' && pendingCount > 0 && (
              <span className="nav-badge">{pendingCount}</span>
            )}
          </button>
        ))}

        {/* DARK / LIGHT TOGGLE */}
        <div style={{
          margin: '16px 0',
          padding: '12px 8px',
          borderTop: '1px solid rgba(139,92,246,0.15)',
          borderBottom: '1px solid rgba(139,92,246,0.15)',
        }}>
          <div style={{
            fontSize: '10px',
            color: 'var(--text-secondary)',
            letterSpacing: '2px',
            fontFamily: 'JetBrains Mono',
            marginBottom: '10px'
          }}>
            DISPLAY MODE
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            padding: '4px',
            border: '1px solid rgba(139,92,246,0.2)'
          }}>
            {/* DARK BUTTON */}
            <button
              onClick={() => setDarkMode(true)}
              style={{
                flex: 1, padding: '8px',
                borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '12px',
                fontWeight: 700, fontFamily: 'JetBrains Mono',
                letterSpacing: '1px', transition: 'all 0.3s',
                background: darkMode
                  ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                  : 'transparent',
                color: darkMode ? 'white' : 'var(--text-secondary)',
                boxShadow: darkMode
                  ? '0 0 15px rgba(139,92,246,0.4)'
                  : 'none',
              }}>
              🌙 DARK
            </button>

            {/* LIGHT BUTTON */}
            <button
              onClick={() => setDarkMode(false)}
              style={{
                flex: 1, padding: '8px',
                borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '12px',
                fontWeight: 700, fontFamily: 'JetBrains Mono',
                letterSpacing: '1px', transition: 'all 0.3s',
                background: !darkMode
                  ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                  : 'transparent',
                color: !darkMode ? 'white' : 'var(--text-secondary)',
                boxShadow: !darkMode
                  ? '0 0 15px rgba(245,158,11,0.4)'
                  : 'none',
              }}>
              ☀️ LIGHT
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-dot" />
            SYSTEM ONLINE
          </div>
          🏆 ATOS SRIJAN 2026
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="main">
        {renderPage()}
      </div>

    </div>
  );
}