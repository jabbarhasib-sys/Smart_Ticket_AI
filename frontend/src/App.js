import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";

import Dashboard   from "./pages/Dashboard";
import TicketQueue from "./pages/TicketQueue";
import SubmitTicket from "./pages/SubmitTicket";
import Analytics   from "./pages/Analytics";
import UserPortal  from "./pages/UserPortal";
import AdminLogin  from "./pages/AdminLogin";
import KnowledgeBase from "./pages/KnowledgeBase";

import "./App.css";

// ─────────────────────────────────────────────────────────────────────────────
//  PrivateRoute  —  blocks access to admin routes without a token
// ─────────────────────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const token = localStorage.getItem("agent_token");
  return token ? children : <Navigate to="/admin/login" replace />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  AdminSidebar  —  visible only on protected /dashboard/* routes
// ─────────────────────────────────────────────────────────────────────────────
function AdminSidebar({ theme, toggleTheme }) {
  const location = useLocation();
  const adminName = localStorage.getItem("agent_name") || "Admin";

  const navItems = [
    { path: "/dashboard",  label: "Dashboard",    icon: "⬡" },
    { path: "/queue",      label: "Ticket Queue", icon: "◈" },
    { path: "/kb",         label: "Knowledge Base", icon: "📖" },
    { path: "/analytics",  label: "Analytics",    icon: "◉" },
    { path: "/submit",     label: "Submit Ticket",icon: "+"  },
  ];

  const logout = () => {
    localStorage.removeItem("agent_token");
    localStorage.removeItem("agent_name");
    window.location.href = "/admin/login";
  };

  return (
    <aside style={S.sidebar}>
      {/* Logo */}
      <div style={S.sidebarLogo}>
        <div style={S.sidebarMark}>AI</div>
        <span style={S.sidebarName}>
          Smart<span style={{ color: "var(--neon-purple)" }}>Ticket</span>
        </span>
        <span style={S.sidebarBadge}>Admin</span>
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              style={{ ...S.navItem, ...(active ? S.navItemActive : {}) }}>
              <span style={S.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User portal link */}
      <div style={S.sidebarDivider} />
      <Link to="/" style={S.portalLink}>
        <span style={{ fontSize: "13px" }}>↗</span> User Portal
      </Link>

      <div style={S.agentCard}>
        <div style={S.agentCardLabel}>Logged in as</div>
        <div style={S.agentCardName}>{adminName}</div>
      </div>

      {/* Theme Switcher */}
      <button style={S.themeBtn} onClick={toggleTheme}>
        {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {/* Logout */}
      <button style={S.logoutBtn} onClick={logout}>⎋ Logout</button>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  AdminLayout  —  sidebar + content wrapper
// ─────────────────────────────────────────────────────────────────────────────
function AdminLayout({ children, theme, toggleTheme }) {
  return (
    <div style={S.adminRoot}>
      <AdminSidebar theme={theme} toggleTheme={toggleTheme} />
      <main style={S.adminMain}>{children}</main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  App  —  router entry point
//
//  URL structure:
//    /                → UserPortal  (public — for end users)
//    /admin/login     → AdminLogin  (public — for handling team)
//    /dashboard       → Dashboard   (protected)
//    /queue           → TicketQueue (protected)
//    /kb              → KnowledgeBase (protected)
//    /analytics       → Analytics   (protected)
//    /submit          → SubmitTicket(protected — internal use)
//    *                → redirect to /
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = React.useState(localStorage.getItem("admin_theme") || "dark");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(p => (p === "dark" ? "light" : "dark"));

  return (
    <Router>
      <Routes>

        {/* ════ PUBLIC: User-facing portal ════ */}
        <Route path="/" element={<UserPortal />} />

        {/* ════ PUBLIC: Admin login ════ */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ════ PROTECTED: Admin dashboard ════ */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <AdminLayout theme={theme} toggleTheme={toggleTheme}><Dashboard /></AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/queue" element={
          <PrivateRoute>
            <AdminLayout theme={theme} toggleTheme={toggleTheme}><TicketQueue /></AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/kb" element={
          <PrivateRoute>
            <AdminLayout theme={theme} toggleTheme={toggleTheme}><KnowledgeBase /></AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute>
            <AdminLayout theme={theme} toggleTheme={toggleTheme}><Analytics /></AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/submit" element={
          <PrivateRoute>
            <AdminLayout theme={theme} toggleTheme={toggleTheme}><SubmitTicket /></AdminLayout>
          </PrivateRoute>
        } />

        {/* ════ Fallback ════ */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Styles  —  inline so we don't touch existing App.css
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  adminRoot: {
    display: "flex",
    minHeight: "100vh",
    background: "var(--bg-primary)",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    background: "var(--bg-card)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
    flexShrink: 0,
  },
  sidebarLogo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 18px 22px",
    borderBottom: "1px solid var(--border)",
    marginBottom: "14px",
  },
  sidebarMark: {
    width: "32px", height: "32px",
    background: "linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))",
    borderRadius: "9px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "800", fontSize: "12px", color: "#fff",
    fontFamily: "'Syne', sans-serif",
  },
  sidebarName: {
    fontWeight: "700", fontSize: "15px", color: "var(--text-primary)",
    fontFamily: "'Syne', sans-serif",
  },
  sidebarBadge: {
    marginLeft: "auto",
    padding: "2px 8px",
    background: "rgba(139, 92, 246, 0.12)",
    border: "1px solid rgba(139, 92, 246, 0.22)",
    borderRadius: "20px",
    fontSize: "9px", fontWeight: "600", color: "var(--neon-purple)",
    textTransform: "uppercase", letterSpacing: "0.6px",
  },
  nav: {
    flex: 1,
    display: "flex", flexDirection: "column", gap: "2px",
    padding: "0 8px",
  },
  navItem: {
    display: "flex", alignItems: "center", gap: "9px",
    padding: "9px 12px", borderRadius: "9px",
    textDecoration: "none", color: "var(--text-secondary)",
    fontSize: "13px", fontWeight: "500",
    transition: "all 0.2s",
  },
  navItemActive: {
    background: "linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(139, 92, 246, 0.07))",
    color: "var(--neon-pink)",
    borderTop: "1px solid rgba(236, 72, 153, 0.25)",
    borderRight: "1px solid rgba(236, 72, 153, 0.25)",
    borderBottom: "1px solid rgba(236, 72, 153, 0.25)",
    borderLeft: "3px solid var(--neon-pink)",
  },
  navIcon: {
    fontSize: "13px", width: "16px", textAlign: "center",
  },
  sidebarDivider: {
    height: "1px",
    background: "var(--border)",
    margin: "12px 18px",
  },
  portalLink: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 20px",
    textDecoration: "none", color: "var(--text-secondary)",
    fontSize: "12px", fontWeight: "500",
    transition: "color 0.2s",
  },
  agentCard: {
    margin: "10px 14px 0",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(139, 92, 246, 0.05)",
    border: "1px solid var(--border)",
  },
  agentCardLabel: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
    marginBottom: "5px",
  },
  agentCardName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  themeBtn: {
    margin: "8px 8px 0",
    padding: "9px 12px",
    background: "none",
    border: "1px solid var(--border)",
    borderRadius: "9px",
    color: "var(--text-secondary)", fontSize: "12px", fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  logoutBtn: {
    margin: "8px 8px 0",
    padding: "9px 12px",
    background: "none",
    border: "1px solid var(--border)",
    borderRadius: "9px",
    color: "var(--text-secondary)", fontSize: "12px", fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  adminMain: {
    flex: 1,
    overflow: "auto",
  },
};
