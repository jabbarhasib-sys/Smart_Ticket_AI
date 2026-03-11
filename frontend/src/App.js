import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import TicketQueue from './pages/TicketQueue';
import SubmitTicket from './pages/SubmitTicket';
import Analytics from './pages/Analytics';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const NAV = [
  { id: 'dashboard', icon: '⬡', label: 'DASHBOARD' },
  { id: 'queue',     icon: '◈', label: 'TICKET QUEUE' },
  { id: 'submit',    icon: '⊕', label: 'SUBMIT TICKET' },
  { id: 'analytics', icon: '◎', label: 'ANALYTICS' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [pendingCount, setPendingCount] = useState(0);

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
        <div className="sidebar-logo">
          ⬡ SMART TICKET
          <span className="sub">AI · HITL · ENTERPRISE</span>
        </div>

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

        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-dot" />
            SYSTEM ONLINE
          </div>
          🏆 NATIONAL HACKATHON 2026
        </div>
      </div>

      <div className="main">
        {renderPage()}
      </div>
    </div>
  );
}