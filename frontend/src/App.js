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
function AdminSidebar() {
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
          Smart<span style={{ color: "#818cf8" }}>Ticket</span>
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

      {/* Logout */}
      <button style={S.logoutBtn} onClick={logout}>⎋ Logout</button>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  AdminLayout  —  sidebar + content wrapper
// ─────────────────────────────────────────────────────────────────────────────
function AdminLayout({ children }) {
  return (
    <div style={S.adminRoot}>
      <AdminSidebar />
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
            <AdminLayout><Dashboard /></AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/queue" element={
          <PrivateRoute>
            <AdminLayout><TicketQueue /></AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/kb" element={
          <PrivateRoute>
            <AdminLayout><KnowledgeBase /></AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute>
            <AdminLayout><Analytics /></AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/submit" element={
          <PrivateRoute>
            <AdminLayout><SubmitTicket /></AdminLayout>
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
    background: "#0B0F1A",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    background: "rgba(255,255,255,0.025)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
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
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: "14px",
  },
  sidebarMark: {
    width: "32px", height: "32px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    borderRadius: "9px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "800", fontSize: "12px", color: "#fff",
    fontFamily: "'Syne', sans-serif",
  },
  sidebarName: {
    fontWeight: "700", fontSize: "15px", color: "#e2e8f0",
    fontFamily: "'Syne', sans-serif",
  },
  sidebarBadge: {
    marginLeft: "auto",
    padding: "2px 8px",
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.22)",
    borderRadius: "20px",
    fontSize: "9px", fontWeight: "600", color: "#818cf8",
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
    textDecoration: "none", color: "#64748b",
    fontSize: "13px", fontWeight: "500",
    transition: "all 0.2s",
  },
  navItemActive: {
    background: "rgba(99,102,241,0.1)",
    color: "#818cf8",
    border: "1px solid rgba(99,102,241,0.18)",
  },
  navIcon: {
    fontSize: "13px", width: "16px", textAlign: "center",
  },
  sidebarDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.05)",
    margin: "12px 18px",
  },
  portalLink: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 20px",
    textDecoration: "none", color: "#475569",
    fontSize: "12px", fontWeight: "500",
    transition: "color 0.2s",
  },
  agentCard: {
    margin: "10px 14px 0",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.16)",
  },
  agentCardLabel: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: "5px",
  },
  agentCardName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#e2e8f0",
  },
  logoutBtn: {
    margin: "8px 8px 0",
    padding: "9px 12px",
    background: "none",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "9px",
    color: "#475569", fontSize: "12px", fontWeight: "500",
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
