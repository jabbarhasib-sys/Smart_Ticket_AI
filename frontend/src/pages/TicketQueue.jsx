import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

function ConfidenceBar({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div className="conf-bar-bg">
        <div className="conf-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      </div>
      <span style={{ fontSize: '11px', color, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{pct}%</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    auto_resolved: ['badge-auto', '⚡ AUTO RESOLVED'],
    pending_human: ['badge-pending', '👁 PENDING REVIEW'],
    human_resolved: ['badge-human', '✅ HUMAN RESOLVED'],
    open: ['badge-open', '◈ OPEN'],
  };
  const [cls, label] = map[status] || ['badge-open', status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return (
    <div className="toast">
      <span style={{ fontSize: '20px' }}>✅</span>
      <div>
        <div style={{ fontWeight: 700, letterSpacing: '1px' }}>TICKET RESOLVED</div>
        <div style={{ fontSize: '11px', opacity: 0.7, fontFamily: 'JetBrains Mono' }}>{message}</div>
      </div>
    </div>
  );
}
// ── SLA TIMER ──
function SLATimer({ createdAt, priority }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('ok');

  const SLA_HOURS = {
    critical: 1,
    high: 4,
    medium: 8,
    low: 24
  };

  useEffect(() => {
    const calculate = () => {
      const created = new Date(createdAt);
      const slaHours = SLA_HOURS[priority] || 8;
      const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('BREACHED');
        setStatus('breached');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (diff < 30 * 60 * 1000) setStatus('critical');
      else if (diff < 60 * 60 * 1000) setStatus('warning');
      else setStatus('ok');

      if (hours > 0) setTimeLeft(`${hours}h ${mins}m`);
      else setTimeLeft(`${mins}m ${secs}s`);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [createdAt, priority]);

  const colors = {
    ok: '#10b981',
    warning: '#f59e0b',
    critical: '#f97316',
    breached: '#ef4444'
  };

  const color = colors[status];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '3px 8px', borderRadius: '6px',
      background: `${color}15`,
      border: `1px solid ${color}30`,
      width: 'fit-content'
    }}>
      <div style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: color,
        animation: status !== 'ok' ? 'blink 1s infinite' : 'none',
        boxShadow: `0 0 4px ${color}`
      }} />
      <span style={{
        fontSize: '10px', color, fontFamily: 'JetBrains Mono',
        fontWeight: 700, letterSpacing: '1px'
      }}>
        {timeLeft === 'BREACHED' ? '⚠ BREACHED' : `⏱ ${timeLeft}`}
      </span>
    </div>
  );
}
export default function TicketQueue() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [resolveNote, setResolveNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API}/tickets/`);
      setTickets(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchTicket = async (id) => {
    const res = await axios.get(`${API}/tickets/${id}`);
    setSelected(res.data);
    setResolveNote('');
  };

  const handleResolve = async () => {
    if (!resolveNote.trim()) return;
    setResolving(true);
    try {
      await axios.post(`${API}/tickets/${selected.id}/resolve`, {
        ticket_id: selected.id,
        solution: resolveNote,
        resolved_by: 'human_agent',
        notes: resolveNote
      });
      setToast(`Ticket #${selected.id} resolved · Email sent to ${selected.submitted_by}`);
      setSelected(null);
      setResolveNote('');
      fetchTickets();
    } catch (e) { alert('Error resolving ticket'); }
    finally { setResolving(false); }
  };

  const FILTERS = [
    { key: 'all', label: 'ALL' },
    { key: 'open', label: '◈ OPEN' },
    { key: 'pending_human', label: '👁 PENDING' },
    { key: 'auto_resolved', label: '⚡ AUTO' },
    { key: 'human_resolved', label: '✅ RESOLVED' },
  ];

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
      <div className="loading-text">LOADING TICKET QUEUE...</div>
    </div>
  );

  return (
    <div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '20px' }}>

        {/* LEFT PANEL */}
        <div>
          <div className="page-header">
            <div className="page-title">◈ TICKET QUEUE</div>
            <div className="page-subtitle">{filtered.length} TICKETS · HITL MONITORING ACTIVE</div>
          </div>

          {/* FILTER BAR */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{
                  padding: '7px 14px', borderRadius: '8px', border: 'none',
                  cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                  fontFamily: 'JetBrains Mono', letterSpacing: '1px',
                  transition: 'all 0.2s',
                  background: filter === f.key
                    ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                    : 'rgba(255,255,255,0.04)',
                  color: filter === f.key ? 'white' : '#8b949e',
                  boxShadow: filter === f.key ? '0 0 15px rgba(139,92,246,0.4)' : 'none',
                  border: filter === f.key ? 'none' : '1px solid rgba(139,92,246,0.15)',
                }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* TICKET TABLE */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#30363d', fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '2px' }}>
                NO TICKETS IN THIS CATEGORY
              </div>
            ) : (
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Category</th>
                    <th>SLA</th>
                    <th>Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} onClick={() => fetchTicket(t.id)}
                      style={{ background: selected?.id === t.id ? 'rgba(139,92,246,0.08)' : '' }}>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#8b5cf6', fontWeight: 700 }}>#{t.id}</span>
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {t.title}
                      </td>
                      <td><span className={`priority-${t.priority}`}>{t.priority?.toUpperCase()}</span></td>
                      <td>
                        <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                          {t.category || '—'}
                        </span>
                      </td>
                      <td>
                      {t.status !== 'auto_resolved' && t.status !== 'human_resolved'
                        ? <SLATimer createdAt={t.created_at} priority={t.priority} />
                        : <span style={{ color: '#10b981', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>✅ MET</span>
                      }
                     </td>
                      <td>{t.confidence_score ? <ConfidenceBar score={t.confidence_score} /> : <span style={{ color: '#30363d' }}>—</span>}</td>
                      <td><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — DETAIL */}
        {selected && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div className="page-title" style={{ fontSize: '18px' }}>TICKET #{selected.id}</div>
                <div className="page-subtitle">FULL AI ANALYSIS</div>
              </div>
              <button onClick={() => setSelected(null)} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)',
                color: '#8b949e', width: '32px', height: '32px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>✕</button>
            </div>

            {/* TICKET INFO */}
            <div className="card" style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#f0f6fc', lineHeight: 1.4 }}>
                {selected.title}
              </div>
              <div style={{ fontSize: '13px', color: '#8b949e', marginBottom: '16px', lineHeight: 1.6 }}>
                {selected.description}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  ['PRIORITY', <span className={`priority-${selected.priority}`}>{selected.priority?.toUpperCase()}</span>],
                  ['CATEGORY', <span style={{ color: '#06b6d4', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{selected.category || '—'}</span>],
                  ['STATUS', <StatusBadge status={selected.status} />],
                  ['CONFIDENCE', selected.confidence_score ? <ConfidenceBar score={selected.confidence_score} /> : '—'],
                  ['SUBMITTED BY', <span style={{ fontSize: '12px', color: '#8b5cf6', fontFamily: 'JetBrains Mono' }}>{selected.submitted_by}</span>],
                  ['ASSIGNED TO', <span style={{ fontSize: '12px', color: '#8b949e' }}>{selected.assigned_to || 'UNASSIGNED'}</span>],
                ].map(([label, value], i) => (
                  <div key={i}>
                    <div style={{ fontSize: '9px', color: '#30363d', letterSpacing: '2px', fontFamily: 'JetBrains Mono', marginBottom: '4px' }}>{label}</div>
                    <div>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI SOLUTION */}
            {selected.ai_solution && (
              <div className="card" style={{ marginBottom: '12px', borderLeft: '3px solid #8b5cf6', background: 'rgba(139,92,246,0.05)' }}>
                <div className="chart-title" style={{ marginBottom: '12px' }}>🤖 AI SOLUTION</div>
                <div style={{ fontSize: '12px', color: '#c9d1d9', whiteSpace: 'pre-line', lineHeight: '1.8', fontFamily: 'Rajdhani', fontWeight: 500 }}>
                  {selected.ai_solution}
                </div>
              </div>
            )}

            {/* AI EXPLANATION */}
            {selected.explanation && (
              <div className="card" style={{ marginBottom: '12px', borderLeft: '3px solid #f59e0b', background: 'rgba(245,158,11,0.04)' }}>
                <div className="chart-title" style={{ marginBottom: '12px' }}>🔍 XAI EXPLANATION</div>
                <div style={{ fontSize: '11px', color: '#8b949e', whiteSpace: 'pre-line', lineHeight: '1.8', fontFamily: 'JetBrains Mono' }}>
                  {selected.explanation}
                </div>
              </div>
            )}

            {/* HUMAN RESOLVE */}
            {selected.status === 'pending_human' && (
              <div className="card" style={{ borderLeft: '3px solid #10b981', background: 'rgba(16,185,129,0.04)' }}>
                <div className="chart-title" style={{ marginBottom: '12px' }}>👤 HUMAN RESOLUTION</div>
                <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '12px', fontFamily: 'JetBrains Mono', letterSpacing: '1px' }}>
                  ✉ RESOLUTION WILL BE EMAILED TO: {selected.submitted_by}
                </div>
                <div className="form-group">
                  <textarea className="form-input" rows={3}
                    placeholder="Enter resolution notes..."
                    value={resolveNote}
                    onChange={e => setResolveNote(e.target.value)}
                    style={{ resize: 'vertical', fontSize: '13px' }} />
                </div>
                <button className="btn btn-success" onClick={handleResolve}
                  disabled={resolving || !resolveNote.trim()}
                  style={{ width: '100%', letterSpacing: '2px' }}>
                  {resolving ? '⏳ RESOLVING...' : '✅ RESOLVE & SEND EMAIL'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}