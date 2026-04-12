import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://54.80.7.105:8000';

export default function SubmitTicket() {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', submitted_by: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('');

  const steps = [
    '🧠 Classifying ticket category...',
    '📊 Calculating confidence score...',
    '🔍 Searching knowledge base...',
    '⚡ Generating AI solution...',
    '⚖️ Making HITL decision...',
  ];

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.submitted_by) {
      setError('ALL FIELDS REQUIRED'); return;
    }
    setLoading(true); setResult(null); setError(null);
    let i = 0;
    const interval = setInterval(() => {
      setStep(steps[i % steps.length]); i++;
    }, 800);
    try {
      const res = await axios.post(`${API}/tickets/`, form);
      setResult(res.data);
      setForm({ title: '', description: '', priority: 'medium', submitted_by: '' });
    } catch (e) {
      setError('BACKEND CONNECTION FAILED. IS SERVER RUNNING?');
    } finally {
      clearInterval(interval); setLoading(false); setStep('');
    }
  };

  const ai = result?.ai_result;

  const decisionConfig = {
    auto_resolve: { bg: 'rgba(16,185,129,0.1)', border: '#10b981', icon: '✅', label: 'AUTO RESOLVED BY AI', color: '#10b981' },
    ai_suggest_human_confirm: { bg: 'rgba(245,158,11,0.1)', border: '#f59e0b', icon: '👁', label: 'SENT FOR HUMAN REVIEW', color: '#f59e0b' },
    escalate_to_human: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', icon: '🚨', label: 'ESCALATED TO HUMAN', color: '#ef4444' },
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div className="page-header">
        <div className="page-title">⊕ SUBMIT TICKET</div>
        <div className="page-subtitle">AI PROCESSES YOUR TICKET INSTANTLY WITH FULL EXPLAINABILITY</div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <label className="form-label">Ticket Title</label>
          <input className="form-input" placeholder="e.g. Cannot connect to VPN"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={4}
            placeholder="Describe the issue in detail..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select className="form-input" value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="low">⬢ LOW</option>
              <option value="medium">⬡ MEDIUM</option>
              <option value="high">▲ HIGH</option>
              <option value="critical">⚠ CRITICAL</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Your Email</label>
            <input className="form-input" placeholder="you@company.com"
              value={form.submitted_by}
              onChange={e => setForm({ ...form, submitted_by: e.target.value })} />
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
            fontSize: '12px', letterSpacing: '1px', fontFamily: 'JetBrains Mono',
            border: '1px solid rgba(239,68,68,0.3)'
          }}>⚠ {error}</div>
        )}

        <button className="btn btn-primary" onClick={handleSubmit}
          disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '14px', letterSpacing: '2px' }}>
          {loading ? '⏳ PROCESSING...' : '⊕ DEPLOY TO AI PIPELINE'}
        </button>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', borderColor: 'rgba(139,92,246,0.4)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: '14px', color: '#8b5cf6', marginBottom: '12px', letterSpacing: '2px' }}>
            AI PIPELINE RUNNING
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#8b949e', letterSpacing: '1px' }}>
            {step}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#8b5cf6', opacity: 0.6,
                animation: `blink ${0.6 + i * 0.2}s infinite`
              }} />
            ))}
          </div>
        </div>
      )}

      {/* RESULT */}
      {result && ai && (() => {
        const cfg = decisionConfig[ai.decision] || decisionConfig.escalate_to_human;
        return (
          <div>
            <div style={{
              background: cfg.bg, borderRadius: '16px', padding: '24px',
              marginBottom: '16px', border: `1px solid ${cfg.border}`,
              boxShadow: `0 0 30px ${cfg.border}30`,
              display: 'flex', alignItems: 'center', gap: '20px'
            }}>
              <div style={{ fontSize: '48px' }}>{cfg.icon}</div>
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '16px', color: cfg.color, letterSpacing: '2px', marginBottom: '6px' }}>
                  {cfg.label}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#8b949e', letterSpacing: '1px' }}>
                  TICKET #{result.ticket_id} · {ai.category?.toUpperCase()} ·
                  CONFIDENCE: {Math.round((ai.confidence_score || 0) * 100)}% ({ai.confidence_label?.toUpperCase()})
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="stat-label">Category Detected</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '18px', color: '#8b5cf6', marginTop: '8px', letterSpacing: '2px' }}>
                  {ai.category?.toUpperCase()}
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="stat-label">Confidence Score</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '18px', marginTop: '8px', letterSpacing: '2px',
                  color: ai.confidence_score >= 0.75 ? '#10b981' : ai.confidence_score >= 0.50 ? '#f59e0b' : '#ef4444' }}>
                  {Math.round((ai.confidence_score || 0) * 100)}%
                </div>
              </div>
            </div>

            {ai.solution && (
              <div className="card" style={{ marginBottom: '16px', borderLeft: '3px solid #8b5cf6' }}>
                <div className="chart-title">AI GENERATED SOLUTION</div>
                <div style={{ fontSize: '13px', color: '#c9d1d9', whiteSpace: 'pre-line', lineHeight: '1.8', fontFamily: 'Rajdhani', fontWeight: 500 }}>
                  {ai.solution}
                </div>
              </div>
            )}

            {ai.risk_factors?.length > 0 && (
              <div className="card" style={{ borderLeft: '3px solid #f59e0b' }}>
                <div className="chart-title">⚠ RISK FACTORS</div>
                {ai.risk_factors.map((r, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#8b949e', marginBottom: '6px', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#f59e0b' }}>▸</span> {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}