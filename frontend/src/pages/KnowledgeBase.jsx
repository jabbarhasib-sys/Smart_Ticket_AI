import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';
const COLORS = {
  network: '#8b5cf6',
  software: '#06b6d4',
  hardware: '#ec4899',
  access: '#10b981',
  performance: '#f97316',
  other: '#8b949e'
};

export default function KnowledgeBase() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newIssue, setNewIssue] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [newCategory, setNewCategory] = useState('software');
  const [adding, setAdding] = useState(false);
  
  // Search Playground State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  
  // Feedback Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API}/kb/`);
      setEntries(res.data);
    } catch (e) {
      console.error(e);
      showToast('❌ Error loading knowledge base entries');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newIssue.trim() || !newSolution.trim()) return;
    setAdding(true);
    try {
      await axios.post(`${API}/kb/`, {
        issue: newIssue,
        solution: newSolution,
        category: newCategory
      });
      showToast('✅ SOP Added & Embedded into ChromaDB!');
      setNewIssue('');
      setNewSolution('');
      fetchEntries();
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to add knowledge base entry');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this vector entry from ChromaDB?`)) return;
    try {
      await axios.delete(`${API}/kb/${id}`);
      showToast('🗑️ Vector entry deleted successfully');
      fetchEntries();
      // Remove from search results if present
      setSearchResults(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to delete vector entry');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await axios.get(`${API}/kb/search`, {
        params: {
          query: searchQuery,
          category: searchCategory,
          top_k: 3
        }
      });
      setSearchResults(res.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
      showToast('❌ Vector query search failed');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearched(false);
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
      <div className="loading-text">LOADING VECTOR KNOWLEDGE BASE...</div>
    </div>
  );

  return (
    <div>
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="toast" style={{ borderLeft: '3px solid var(--neon-cyan)', color: 'var(--text-primary)' }}>
          <span>ℹ️</span>
          <div>
            <div style={{ fontWeight: 700, letterSpacing: '1px', fontSize: '11px', color: 'var(--neon-cyan)' }}>SYSTEM NOTICE</div>
            <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}>{toast}</div>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title">📖 VECTOR KNOWLEDGE BASE</div>
        <div className="page-subtitle">CHROMADB EMBEDDING CONTROL & SOP DIRECTORY MANAGER</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px', marginBottom: '24px' }}>
        {/* LEFT COLUMN: VECTOR PLAYGROUND */}
        <div className="card" style={{ borderColor: 'rgba(6, 182, 212, 0.3)', background: 'rgba(6, 182, 212, 0.02)' }}>
          <div className="chart-title" style={{ color: 'var(--neon-cyan)' }}>
            🧬 INTERACTIVE VECTOR SEARCH PLAYGROUND
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Type a natural language issue below to test the active **Semantic Search Pipeline**. The engine will automatically generate embeddings using sentence transformers and calculate the cosine distances in the database.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter query to test vector matching (e.g. printer jammed, VPN dropped)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}
              />
            </div>
            <div style={{ width: '120px' }}>
              <select
                className="form-input"
                value={searchCategory}
                onChange={e => setSearchCategory(e.target.value)}
                style={{ borderColor: 'rgba(6, 182, 212, 0.3)', paddingRight: '24px' }}
              >
                <option value="all">All Category</option>
                <option value="network">Network</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="access">Access</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--neon-cyan), #0891b2)', boxShadow: '0 0 15px rgba(6,182,212,0.3)', whiteSpace: 'nowrap' }} disabled={searching}>
              {searching ? '🧬 SEARCHING...' : '🔍 QUERY VECTOR'}
            </button>
            {searched && (
              <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={clearSearch}>
                CLEAR
              </button>
            )}
          </form>

          {/* SEARCH RESULTS */}
          {searched && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ fontSize: '11px', color: 'var(--neon-cyan)', fontFamily: 'JetBrains Mono', letterSpacing: '1px', marginBottom: '12px' }}>
                MATCHES FOUND IN CHROMADB (TOP K = 3)
              </div>
              {searchResults.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '12px', border: '1px dashed rgba(6,182,212,0.2)', borderRadius: '10px' }}>
                  NO SEMANTIC MATCHES FOUND FOR THIS CATEGORY
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {searchResults.map((res, i) => (
                    <div key={i} style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '12px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: COLORS[res.category], background: `${COLORS[res.category]}15`, padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          {res.category.toUpperCase()}
                        </span>
                        {/* SIMILARITY CONFIDENCE BAR */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>Score Distance: {res.distance}</span>
                          <div className="conf-bar-bg" style={{ width: '80px', background: 'rgba(255,255,255,0.05)' }}>
                            <div className="conf-bar-fill" style={{ width: `${res.similarity_percentage}%`, background: `linear-gradient(90deg, var(--neon-cyan), #0891b2)` }} />
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--neon-cyan)', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                            {res.similarity_percentage}% Match
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: '#f0f6fc' }}>
                        Issue Pattern: {res.issue}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                        💡 **Learned SOP Resolution:** {res.solution}
                      </div>
                      <div style={{ fontSize: '10px', color: '#30363d', fontFamily: 'JetBrains Mono', marginTop: '8px', textAlign: 'right' }}>
                        ID: {res.id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ADD ENTRY FORM */}
        <div className="card" style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}>
          <div className="chart-title" style={{ color: 'var(--neon-purple)' }}>
            📥 ADD KNOWLEDGE BASE RULE
          </div>
          <form onSubmit={handleAddEntry}>
            <div className="form-group">
              <label className="form-label">Issue / Symptom Description</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Describe the issue pattern that users submit (e.g. work station has blue screen crash)..."
                value={newIssue}
                onChange={e => setNewIssue(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">SOP Solution Steps</label>
              <textarea
                className="form-input"
                rows={5}
                placeholder="Provide numbered, actionable standard operating procedure steps to resolve the issue..."
                value={newSolution}
                onChange={e => setNewSolution(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                style={{ paddingRight: '24px' }}
              >
                <option value="network">Network</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="access">Access</option>
                <option value="performance">Performance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', letterSpacing: '2px' }} disabled={adding}>
              {adding ? '⏳ EMBEDDING & SAVING...' : '✅ ADD RULE & RE-INDEX'}
            </button>
          </form>
        </div>
      </div>

      {/* FULL VECTOR SOP CATALOG */}
      <div className="card">
        <div className="chart-title">
          📚 ACTIVE KNOWLEDGE BASE CATALOG ({entries.length} RULES CURRENTLY INDEXED)
        </div>
        {entries.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#30363d', fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '2px' }}>
            VECTOR STORE IS EMPTY — ADD A SOP TO BEGIN
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {entries.map((item, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s',
                  position: 'relative'
                }}
                className="kb-catalog-card"
              >
                {/* DELETE BUTTON */}
                <button
                  onClick={() => handleDeleteEntry(item.id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#c9d1d9',
                    fontSize: '12px',
                    cursor: 'pointer',
                    opacity: 0.5,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.opacity = 1}
                  onMouseLeave={e => e.target.style.opacity = 0.5}
                >
                  ✕
                </button>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: COLORS[item.category], background: `${COLORS[item.category]}15`, padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {item.category.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: '9px',
                      fontFamily: 'JetBrains Mono',
                      color: item.source === 'human_feedback' ? 'var(--neon-green)' : item.source === 'admin_portal' ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                      background: item.source === 'human_feedback' ? 'rgba(16,185,129,0.1)' : item.source === 'admin_portal' ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.05)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {item.source === 'human_feedback' ? 'AUTO-LEARNED' : item.source === 'admin_portal' ? 'ADMIN' : 'SEED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#f0f6fc', marginBottom: '8px', lineHeight: 1.4, paddingRight: '16px' }}>
                    {item.issue}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6, marginBottom: '16px' }}>
                    {item.solution}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(139, 92, 246, 0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: '#30363d' }}>
                    {item.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
