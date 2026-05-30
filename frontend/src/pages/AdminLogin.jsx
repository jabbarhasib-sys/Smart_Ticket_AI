import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ADMIN_OPTIONS = [
  { value: "sangamesh-rajole", label: "Sangamesh Rajole" },
  { value: "kashif-mehdi", label: "Kashif Mehdi" },
  { value: "jabbar-hasib", label: "Jabbar Hasib" },
];

const injectStyles = () => {
  if (document.getElementById("al-styles")) return;
  const el = document.createElement("style");
  el.id = "al-styles";
  el.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

/* ── Dark mode defaults (CSS variables) ── */
:root {
  --red: #f87171;
  --text-muted: #6b7280;
}
[data-theme="light"] {
  --red: #dc2626;
  --text-muted: #b89090;
}

.al-root {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease;
}
.al-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px);
  background-size: 55px 55px;
  transition: opacity 0.3s;
}
[data-theme="light"] .al-grid {
  background-image: linear-gradient(rgba(201,107,107,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201,107,107,0.06) 1px, transparent 1px);
}
.al-glow-1 { position:fixed; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%); top:-150px; right:-100px; pointer-events:none; z-index:0; }
.al-glow-2 { position:fixed; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%); bottom:-120px; left:-80px; pointer-events:none; z-index:0; }
[data-theme="light"] .al-glow-1 { background:radial-gradient(circle,rgba(201,107,107,0.10) 0%,transparent 70%); }
[data-theme="light"] .al-glow-2 { background:radial-gradient(circle,rgba(155,123,138,0.08) 0%,transparent 70%); }

.al-card {
  position: relative; z-index: 10;
  width: 100%; max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 44px 40px;
  margin: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px var(--border);
  backdrop-filter: blur(20px);
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
}
[data-theme="light"] .al-card {
  box-shadow: 0 8px 32px rgba(90,40,40,0.10), 0 0 0 1px var(--border);
}
.al-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; border-radius:22px 22px 0 0; background:linear-gradient(90deg, var(--neon-purple), var(--neon-cyan), var(--neon-purple)); }

.al-brand { display:flex; align-items:center; gap:10px; margin-bottom:32px; }
.al-mark { width:38px; height:38px; background:linear-gradient(135deg, var(--neon-purple), var(--neon-cyan)); border-radius:10px; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; font-size:15px; color:#fff; }
.al-brand-text { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; color:var(--text-primary); }
.al-brand-text span { color:var(--neon-purple); }
.al-badge { margin-left:auto; padding:3px 10px; background:rgba(124,58,237,0.12); border:1px solid rgba(124,58,237,0.25); border-radius:20px; font-size:10px; font-weight:600; color:var(--neon-purple); text-transform:uppercase; letter-spacing:0.6px; }
[data-theme="light"] .al-badge { background:rgba(201,107,107,0.10); border-color:rgba(201,107,107,0.25); }

.al-title { font-family:'Syne',sans-serif; font-weight:800; font-size:24px; color:var(--text-primary); margin-bottom:5px; letter-spacing:-0.3px; }
.al-sub { font-size:13px; color:var(--text-secondary); margin-bottom:28px; }
.al-sub b { color:var(--text-primary); font-weight:600; }

.al-field { margin-bottom:16px; }
.al-label { display:block; font-size:11px; font-weight:600; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:7px; }

.al-input {
  width:100%;
  background:var(--bg-primary);
  border:1px solid var(--border);
  border-radius:10px;
  padding:12px 14px;
  font-size:13.5px;
  color:var(--text-primary);
  font-family:'DM Sans',sans-serif;
  outline:none;
  transition:border-color .2s,box-shadow .2s,background .2s,color .2s;
  box-sizing:border-box;
  -webkit-appearance:none;
}
.al-input:focus { border-color:var(--neon-purple); box-shadow:0 0 0 3px rgba(124,58,237,0.1); }
.al-input::placeholder { color:var(--text-muted); }
[data-theme="light"] .al-input {
  background: #fdf8f2;
  border-color: #e8d5dc;
  color: #2e1b1b;
}
[data-theme="light"] .al-input:focus {
  border-color: #c96b6b;
  box-shadow: 0 0 0 3px rgba(201,107,107,0.12);
  background: #fffcfa;
}
[data-theme="light"] .al-input::placeholder { color:#b89090; }
[data-theme="light"] .al-input option {
  background: #fffcfa;
  color: #2e1b1b;
}

.al-iw { position:relative; }
.al-iw .al-input { padding-right:42px; }
.al-pwtog { position:absolute; right:11px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--text-secondary); padding:3px; transition:color .2s; display:flex; align-items:center; }
.al-pwtog:hover { color:var(--neon-purple); }
[data-theme="light"] .al-pwtog:hover { color:#c96b6b; }

.al-err { font-size:12px; color:var(--red); margin-top:5px; }
.al-err-box {
  padding:10px 13px;
  background:rgba(248,113,113,0.07);
  border:1px solid rgba(248,113,113,0.18);
  border-radius:9px;
  font-size:12.5px;
  color:var(--red);
  margin-bottom:14px;
}
[data-theme="light"] .al-err-box {
  background:rgba(220,38,38,0.05);
  border-color:rgba(220,38,38,0.15);
}

.al-btn {
  width:100%;
  padding:13px;
  background:linear-gradient(135deg, var(--neon-purple) 0%, var(--neon-cyan) 100%);
  border:none;
  border-radius:10px;
  color:#fff;
  font-family:'DM Sans',sans-serif;
  font-weight:600;
  font-size:14px;
  cursor:pointer;
  box-shadow:0 4px 16px rgba(124,58,237,0.28);
  transition:transform .18s,opacity .18s,box-shadow .18s;
  margin-top:6px;
}
[data-theme="light"] .al-btn {
  background:linear-gradient(135deg, #c96b6b 0%, #9b7b8a 100%);
  box-shadow:0 4px 16px rgba(201,107,107,0.30);
}
.al-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 7px 22px rgba(124,58,237,0.36); }
[data-theme="light"] .al-btn:hover:not(:disabled) { box-shadow:0 7px 22px rgba(201,107,107,0.40); }
.al-btn:active:not(:disabled) { transform:translateY(0); }
.al-btn:disabled { opacity:.45; cursor:not-allowed; }

.al-footer { text-align:center; margin-top:20px; font-size:12.5px; color:var(--text-secondary); }
.al-footer a { color:var(--neon-purple); text-decoration:none; font-weight:500; transition:opacity .2s; }
.al-footer a:hover { opacity:.75; }
[data-theme="light"] .al-footer a { color:#c96b6b; }

/* Theme toggle button in the corner */
.al-theme-toggle {
  position: absolute;
  top: 20px; right: 20px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: all 0.18s;
  z-index: 20;
  font-family: 'DM Sans', sans-serif;
}
[data-theme="light"] .al-theme-toggle {
  background: #fffcfa;
  border-color: #e8d5dc;
  color: #7a5050;
  box-shadow: 0 2px 12px rgba(90,40,40,0.08);
}
.al-theme-toggle:hover {
  border-color: var(--neon-purple);
  color: var(--text-primary);
}
[data-theme="light"] .al-theme-toggle:hover {
  border-color: #c96b6b;
  color: #2e1b1b;
}

.al-slide { animation:alSlide .3s cubic-bezier(.22,1,.36,1); }
@keyframes alSlide { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
`;
  document.head.appendChild(el);
};

export default function AdminLogin() {
  useEffect(() => { injectStyles(); }, []);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("admin_theme") || "dark");
  const [form, setForm] = useState({ admin: ADMIN_OPTIONS[0].value, password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errs, setErrs] = useState({});
  const [apiErr, setApiErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (localStorage.getItem("agent_token")) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const submit = async (e) => {
    e?.preventDefault();
    const ne = {};
    if (!form.admin) ne.admin = "Please select an admin";
    if (!form.password) ne.password = "Password is required";
    if (Object.keys(ne).length) {
      setErrs(ne);
      return;
    }

    setErrs({});
    setApiErr("");
    setLoading(true);

    try {
      const email = `${form.admin}@support.com`;
      const response = await axios.post("http://127.0.0.1:8000/agents/login", {
        email: email,
        password: form.password
      });

      if (response.data?.success) {
        localStorage.setItem("agent_token", "agent-session");
        localStorage.setItem("agent_name", response.data.name);
        navigate("/dashboard", { replace: true });
      } else {
        setApiErr("Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const detail = err.response?.data?.detail || "Could not connect to authentication server.";
      setApiErr(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-root">
      {/* Theme Toggle */}
      <button
        className="al-theme-toggle"
        onClick={() => setTheme(p => p === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="al-grid" />
      <div className="al-glow-1" />
      <div className="al-glow-2" />
      <div className="al-card">
        <div className="al-brand">
          <div className="al-mark">AI</div>
          <span className="al-brand-text">Smart<span>Ticket</span></span>
          <span className="al-badge">Admin</span>
        </div>
        <div className="al-slide">
          <h1 className="al-title">Handling Team</h1>
          <p className="al-sub">This portal is restricted to <b>support agents only</b>.</p>
          <form onSubmit={submit}>
            <div className="al-field">
              <label className="al-label">Login As</label>
              <select
                className="al-input"
                value={form.admin}
                autoFocus
                onChange={e => {
                  setForm(p => ({ ...p, admin: e.target.value }));
                  setErrs(p => ({ ...p, admin: "" }));
                }}
              >
                {ADMIN_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errs.admin && <div className="al-err">Warning: {errs.admin}</div>}
            </div>
            <div className="al-field">
              <label className="al-label">Password</label>
              <div className="al-iw">
                <input
                  className="al-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter shared password"
                  value={form.password}
                  onChange={e => {
                    setForm(p => ({ ...p, password: e.target.value }));
                    setErrs(p => ({ ...p, password: "" }));
                    setApiErr("");
                  }}
                />
                <button type="button" className="al-pwtog" onClick={() => setShowPw(p => !p)}>
                  {showPw
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errs.password && <div className="al-err">Warning: {errs.password}</div>}
            </div>
            {apiErr && <div className="al-err-box">Warning: {apiErr}</div>}
            <button type="submit" className="al-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In to Dashboard ->"}
            </button>
          </form>
          <div className="al-footer">
            Not an agent? <Link to="/">Go to User Portal -></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
