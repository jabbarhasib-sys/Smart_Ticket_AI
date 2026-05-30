import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";
const SHARED_LOGIN_PASSWORD = "123456";

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const PROCESS_STEPS = [
  "Classifying ticket category...",
  "Calculating confidence score...",
  "Searching the knowledge base...",
  "Generating AI solution...",
  "Saving result to the shared queue...",
];

const injectStyles = () => {
  if (document.getElementById("up-styles")) return;

  const el = document.createElement("style");
  el.id = "up-styles";
  el.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Nunito:wght@300;400;500;600;700&display=swap');

/* ========================================== */
/* LIGHT THEME (Cream and Pink)              */
/* ========================================== */
.up-root.light {
  --cream: #fdf8f2;
  --cream-deep: #f5ede0;
  --blush: #f5c6c2;
  --rose: #c96b6b;
  --rose-deep: #a84545;
  --mauve: #9b7b8a;
  --mauve-light: #e8d5dc;
  --text-dark: #2e1b1b;
  --text-mid: #7a5050;
  --text-muted: #b89090;
  --white: #fffcfa;
  --green: #3e9e6f;
  --amber: #e09a3b;
  --red: #c94444;
  
  --font-heading: 'Cormorant Garamond', serif;
  --font-body: 'Nunito', sans-serif;
  
  --blob-1-bg: radial-gradient(circle, #f5c6c2 0%, transparent 70%);
  --blob-2-bg: radial-gradient(circle, #ead0c8 0%, transparent 70%);
  --blob-3-bg: radial-gradient(circle, #f9e4da 0%, transparent 70%);
  --blob-opacity-1: .5;
  --blob-opacity-2: .4;
  --blob-opacity-3: .28;
  
  --left-bg: linear-gradient(155deg, #c96b6b 0%, #9b4a4a 55%, #7a3535 100%);
  --left-border: none;
  --left-noise-opacity: 0.035;
  --left-ring-color: rgba(255,255,255,0.10);
  
  --card-bg: var(--white);
  --card-shadow: 0 1px 3px rgba(90,40,40,0.04), 0 6px 20px rgba(90,40,40,0.08), 0 20px 54px rgba(90,40,40,0.10), 0 0 0 1px rgba(201,107,107,0.07);
  --card-border: none;
  --card-top-bar: linear-gradient(90deg, #c96b6b, #e8856a, #c96b6b);
  
  --step-circle-active-bg: var(--white);
  --step-circle-active-shadow: rgba(201,107,107,0.11);
  --step-circle-idle-bg: var(--cream-deep);
  --step-line-done-bg: rgba(201,107,107,0.35);
  
  --input-focus-shadow: rgba(201,107,107,0.11);
  --input-err-shadow: rgba(201,68,68,0.09);
  
  --btn-bg: linear-gradient(135deg,#c96b6b 0%,#a84545 100%);
  --btn-shadow: 0 4px 16px rgba(168,69,69,0.28), 0 1px 3px rgba(168,69,69,0.18);
  --btn-hover-shadow: 0 7px 22px rgba(168,69,69,0.34);
  --btn-ghost-hover-bg: rgba(201,107,107,0.04);
  
  --panel-bg: rgba(253,248,242,0.72);
  --ticket-item-bg: var(--white);
  --ticket-item-hover-border: rgba(201,107,107,0.35);
  --ticket-item-hover-shadow: rgba(201,107,107,0.09);
  
  --chip-low-color: #4f8c67;
  --chip-low-bg: rgba(62,158,111,0.10);
  --chip-medium-color: #a56b22;
  --chip-medium-bg: rgba(224,154,59,0.12);
  --chip-high-color: #b85a2b;
  --chip-high-bg: rgba(224,107,58,0.12);
  --chip-critical-color: #b13c3c;
  --chip-critical-bg: rgba(201,68,68,0.12);
  
  --chip-resolved-color: var(--green);
  --chip-resolved-bg: rgba(62,158,111,0.10);
  --chip-pending-color: var(--amber);
  --chip-pending-bg: rgba(224,154,59,0.12);
  --chip-open-color: var(--mauve);
  --chip-open-bg: rgba(155,123,138,0.12);
  
  --solution-card-bg: rgba(201,107,107,0.06);
  --solution-card-border: rgba(201,107,107,0.12);
  --explanation-card-bg: rgba(224,154,59,0.06);
  --explanation-card-border: rgba(224,154,59,0.12);
  
  --notice-success-bg: rgba(62,158,111,0.08);
  --notice-success-border: rgba(62,158,111,0.18);
  --notice-error-bg: rgba(201,68,68,0.08);
  --notice-error-border: rgba(201,68,68,0.18);
  
  --otp-box-bg: var(--cream);
  --otp-box-filled-bg: rgba(245,198,194,0.16);
  --otp-box-filled-border: rgba(201,107,107,0.45);
  
  --empty-bg: rgba(255,252,250,0.55);
}

/* ========================================== */
/* DARK THEME (Cosmic Cyberpunk Blue)         */
/* ========================================== */
.up-root.dark {
  --cream: #0B0F1A;
  --cream-deep: #121829;
  --blush: #818cf8;
  --rose: #6366f1;
  --rose-deep: #4f46e5;
  --mauve: #8b5cf6;
  --mauve-light: rgba(255,255,255,0.07);
  --text-dark: #e2e8f0;
  --text-mid: #94a3b8;
  --text-muted: #475569;
  --white: rgba(255,255,255,0.03);
  --green: #10b981;
  --amber: #f59e0b;
  --red: #f87171;
  
  --font-heading: 'Cormorant Garamond', serif;
  --font-body: 'Nunito', sans-serif;
  
  --blob-1-bg: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
  --blob-2-bg: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
  --blob-3-bg: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%);
  --blob-opacity-1: .8;
  --blob-opacity-2: .7;
  --blob-opacity-3: .4;
  
  --left-bg: linear-gradient(155deg, #0e1220 0%, #060810 100%);
  --left-border: 1px solid rgba(255,255,255,0.06);
  --left-noise-opacity: 0.015;
  --left-ring-color: rgba(255,255,255,0.03);
  
  --card-bg: var(--white);
  --card-shadow: 0 0 0 1px rgba(99,102,241,0.07), 0 30px 70px rgba(0,0,0,0.5);
  --card-border: 1px solid rgba(255,255,255,0.07);
  --card-top-bar: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
  
  --step-circle-active-bg: var(--cream);
  --step-circle-active-shadow: rgba(99,102,241,0.15);
  --step-circle-idle-bg: rgba(255,255,255,0.03);
  --step-line-done-bg: rgba(99,102,241,0.3);
  
  --input-focus-shadow: rgba(99,102,241,0.15);
  --input-err-shadow: rgba(248,113,113,0.15);
  
  --btn-bg: linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);
  --btn-shadow: 0 4px 16px rgba(99,102,241,0.28);
  --btn-hover-shadow: 0 7px 22px rgba(99,102,241,0.36);
  --btn-ghost-hover-bg: rgba(99,102,241,0.06);
  
  --panel-bg: rgba(255,255,255,0.02);
  --ticket-item-bg: rgba(255,255,255,0.01);
  --ticket-item-hover-border: rgba(99,102,241,0.35);
  --ticket-item-hover-shadow: rgba(99,102,241,0.09);
  
  --chip-low-color: #52c480;
  --chip-low-bg: rgba(16,185,129,0.1);
  --chip-medium-color: #f59e0b;
  --chip-medium-bg: rgba(245,158,11,0.1);
  --chip-high-color: #f97316;
  --chip-high-bg: rgba(249,115,22,0.1);
  --chip-critical-color: #f87171;
  --chip-critical-bg: rgba(248,113,113,0.1);
  
  --chip-resolved-color: var(--green);
  --chip-resolved-bg: rgba(16,185,129,0.1);
  --chip-pending-color: var(--amber);
  --chip-pending-bg: rgba(245,158,11,0.1);
  --chip-open-color: var(--mauve);
  --chip-open-bg: rgba(139,92,246,0.15);
  
  --solution-card-bg: rgba(99,102,241,0.06);
  --solution-card-border: rgba(99,102,241,0.12);
  --explanation-card-bg: rgba(245,158,11,0.06);
  --explanation-card-border: rgba(245,158,11,0.12);
  
  --notice-success-bg: rgba(16,185,129,0.08);
  --notice-success-border: rgba(16,185,129,0.18);
  --notice-error-bg: rgba(248,113,113,0.08);
  --notice-error-border: rgba(248,113,113,0.18);
  
  --otp-box-bg: rgba(255,255,255,0.04);
  --otp-box-filled-bg: rgba(99,102,241,0.1);
  --otp-box-filled-border: rgba(99,102,241,0.45);
  
  --empty-bg: rgba(255,255,255,0.01);
}

/* ========================================== */
/* CORE COMPONENT STYLES                      */
/* ========================================== */
.up-root {
  min-height: 100vh;
  background: var(--cream);
  display: flex;
  position: relative;
  font-family: var(--font-body), sans-serif;
  overflow: hidden;
  transition: background 0.3s ease;
}

.up-blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; transition: background 0.3s ease; }
.up-blob-1 { width: 560px; height: 560px; background: var(--blob-1-bg); top: -180px; right: -120px; opacity: var(--blob-opacity-1); animation: blobFloat 14s ease-in-out infinite; }
.up-blob-2 { width: 420px; height: 420px; background: var(--blob-2-bg); bottom: -160px; left: -100px; opacity: var(--blob-opacity-2); animation: blobFloat 18s ease-in-out infinite reverse; }
.up-blob-3 { width: 260px; height: 260px; background: var(--blob-3-bg); top: 45%; left: 38%; opacity: var(--blob-opacity-3); animation: blobFloat 22s ease-in-out infinite; }
@keyframes blobFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-28px) scale(1.04)} 66%{transform:translate(-15px,18px) scale(.97)} }

.up-portal-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 5;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.up-portal-action {
  border: 1.5px solid rgba(99,102,241,0.2);
  background: var(--white);
  color: var(--text-mid);
  border-radius: 999px;
  padding: 10px 16px;
  font-family: var(--font-body), sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 28px rgba(0,0,0,0.15);
  backdrop-filter: blur(10px);
  transition: all .18s;
}

.up-portal-action:hover {
  color: var(--rose);
  border-color: rgba(99,102,241,0.5);
  transform: translateY(-1px);
}

.up-auth-toast {
  position: fixed;
  top: 74px;
  right: 20px;
  z-index: 6;
  max-width: 360px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(16,185,129,0.95);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 14px 34px rgba(16,185,129,0.22);
}

.up-left {
  display: none;
  width: 400px;
  flex-shrink: 0;
  background: var(--left-bg);
  border-right: var(--left-border);
  position: relative;
  overflow: hidden;
  padding: 56px 44px;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1;
  transition: background 0.3s ease;
}

@media (min-width: 960px) {
  .up-left { display: flex; }
}

.up-left::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: var(--left-noise-opacity);
  pointer-events: none;
}

.up-ring { position: absolute; border-radius: 50%; border: 1px solid var(--left-ring-color); pointer-events: none; }
.up-ring-1 { width: 320px; height: 320px; bottom: -90px; right: -90px; }
.up-ring-2 { width: 210px; height: 210px; bottom: -35px; right: -35px; }
.up-ring-3 { width: 520px; height: 520px; top: -130px; left: -220px; }
.up-brand, .up-left-body, .up-stats { position: relative; z-index: 2; }
.up-brand-mark { width: 46px; height: 46px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 13px; display: flex; align-items: center; justify-content: center; font-family: var(--font-heading), sans-serif; font-weight: 700; font-size: 20px; color: #fff; margin-bottom: 18px; }
.up-brand-name { font-family: var(--font-heading), sans-serif; font-weight: 600; font-size: 21px; color: #fff; margin-bottom: 4px; }
.up-brand-tag { font-size: 12px; color: rgba(255,255,255,0.35); }
.up-headline { font-family: var(--font-heading), sans-serif; font-weight: 600; font-size: 36px; color: #fff; line-height: 1.22; margin-bottom: 14px; letter-spacing: -.3px; }
.up-headline em { font-style: italic; color: var(--blush); }
.up-desc { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.75; }
.up-stats { display: flex; gap: 26px; }
.up-stat-num { font-family: var(--font-heading), sans-serif; font-weight: 700; font-size: 25px; color: #fff; }
.up-stat-label { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 2px; letter-spacing: .5px; text-transform: uppercase; }

.up-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  position: relative;
  z-index: 1;
}

.up-card {
  width: 100%;
  max-width: 455px;
  background: var(--card-bg);
  border-radius: 28px;
  padding: 46px 42px;
  box-shadow: var(--card-shadow);
  border: var(--card-border);
  backdrop-filter: blur(16px);
  position: relative;
  overflow: hidden;
  transition: background 0.3s, box-shadow 0.3s;
}

.up-card-wide {
  max-width: 1120px;
  padding: 38px 34px;
}

.up-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-top-bar);
}

.up-mobile-brand { display: flex; align-items: center; gap: 9px; margin-bottom: 28px; }
@media (min-width: 960px) { .up-mobile-brand { display: none; } }
.up-mobile-mark { width: 34px; height: 34px; background: var(--rose); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: var(--font-heading), sans-serif; font-weight: 700; font-size: 17px; color: #fff; }
.up-mobile-name { font-family: var(--font-heading), sans-serif; font-size: 18px; font-weight: 600; color: var(--text-dark); }
.up-mobile-name span { color: var(--rose); }

.up-steps { display: flex; align-items: center; margin-bottom: 32px; }
.up-step-item { display: flex; align-items: center; gap: 7px; }
.up-step-circle { width: 27px; height: 27px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; transition: all .3s; flex-shrink: 0; }
.up-step-circle.done { background: var(--rose); color: #fff; }
.up-step-circle.active { background: var(--step-circle-active-bg); border: 2px solid var(--rose); color: var(--rose); box-shadow: 0 0 0 4px var(--step-circle-active-shadow); }
.up-step-circle.idle { background: var(--step-circle-idle-bg); color: var(--text-muted); border: 1.5px solid var(--mauve-light); }
.up-step-label { font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }
.up-step-label.active { color: var(--rose); }
.up-step-label.done { color: var(--mauve); }
.up-step-label.idle { color: var(--text-muted); }
.up-step-line { flex: 1; height: 1.5px; background: var(--mauve-light); margin: 0 7px; min-width: 18px; }
.up-step-line.done { background: var(--step-line-done-bg); }

.up-heading { font-family: var(--font-heading), sans-serif; font-weight: 600; font-size: 31px; color: var(--text-dark); line-height: 1.15; margin-bottom: 6px; letter-spacing: -.3px; }
.up-heading em { font-style: italic; color: var(--rose); }
.up-subtext { font-size: 13.5px; color: var(--text-muted); margin-bottom: 28px; line-height: 1.6; }
.up-subtext strong { color: var(--mauve); font-weight: 600; }

.up-field { position: relative; margin-bottom: 16px; }
.up-label { display: block; font-size: 11px; font-weight: 700; color: var(--text-mid); text-transform: uppercase; letter-spacing: .9px; margin-bottom: 7px; }
.up-input, .up-textarea, .up-select {
  width: 100%;
  background: var(--cream-deep);
  border: 1.5px solid var(--mauve-light);
  border-radius: 11px;
  padding: 12px 15px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-dark);
  font-family: var(--font-body), sans-serif;
  outline: none;
  transition: border-color .22s, box-shadow .22s, background .22s;
  box-sizing: border-box;
  -webkit-appearance: none;
}

.up-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
.up-input:focus, .up-textarea:focus, .up-select:focus { border-color: var(--rose); box-shadow: 0 0 0 4px var(--input-focus-shadow); background: var(--white); }
.up-input::placeholder, .up-textarea::placeholder { color: var(--text-muted); font-weight: 400; }
.up-input.err, .up-textarea.err { border-color: var(--red); box-shadow: 0 0 0 3px var(--input-err-shadow); }
.up-ferr { font-size: 12px; color: var(--red); margin-top: 5px; }

.up-btn {
  width: 100%;
  padding: 13px;
  background: var(--btn-bg);
  border: none;
  border-radius: 11px;
  color: #fff;
  font-family: var(--font-body), sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  margin-top: 8px;
  box-shadow: var(--btn-shadow);
  transition: transform .18s, box-shadow .18s, opacity .18s;
}

.up-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--btn-hover-shadow); }
.up-btn:disabled { opacity: .45; cursor: not-allowed; }

.up-btn-ghost {
  width: 100%;
  padding: 10px;
  background: none;
  border: 1.5px solid var(--mauve-light);
  border-radius: 11px;
  color: var(--text-mid);
  font-family: var(--font-body), sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: all .2s;
}

.up-btn-ghost:hover { border-color: var(--blush); color: var(--rose); background: var(--btn-ghost-hover-bg); }

.up-auth-mode-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.up-auth-mode-btn {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--mauve-light);
  background: var(--cream-deep);
  color: var(--text-mid);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .18s;
}

.up-auth-mode-btn.active {
  border-color: var(--rose);
  background: rgba(99,102,241,0.09);
  color: var(--rose);
  box-shadow: 0 8px 18px rgba(99,102,241,0.08);
}

.up-auth-note {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-top: -4px;
  margin-bottom: 14px;
}

.up-otp-row { margin-bottom: 22px; }
.up-otp-box {
  width: 100%;
  height: 58px;
  text-align: center;
  font-family: var(--font-heading), sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: .38em;
  color: var(--rose);
  background: var(--otp-box-bg);
  border: 1.5px solid var(--mauve-light);
  border-radius: 11px;
  outline: none;
  transition: all .2s;
  box-sizing: border-box;
  padding: 0 18px;
}

.up-otp-box:focus { border-color: var(--rose); box-shadow: 0 0 0 4px var(--input-focus-shadow); background: var(--white); }
.up-otp-box.filled { border-color: var(--otp-box-filled-border); background: var(--otp-box-filled-bg); }
.up-otp-box.oerr { border-color: var(--red); color: var(--red); }
.up-otp-err { text-align: center; font-size: 12.5px; color: var(--red); margin-bottom: 12px; padding: 8px 12px; background: rgba(248,113,113,0.07); border-radius: 8px; }
.up-resend { text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 12px; }
.up-resend-btn { background: none; border: none; color: var(--rose); cursor: pointer; font-size: 13px; font-weight: 600; text-decoration: underline; padding: 0; font-family: var(--font-body), sans-serif; }
.up-dev-pill { margin-top: 12px; padding: 9px 12px; background: rgba(139,92,246,0.05); border: 1px dashed rgba(139,92,246,0.2); border-radius: 9px; text-align: center; font-size: 12px; color: var(--mauve); }

.up-profile-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.up-profile-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--rose);
  margin-bottom: 8px;
}

.up-inline-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.up-small-btn {
  border: 1px solid rgba(99,102,241,0.18);
  background: rgba(99,102,241,0.06);
  color: var(--rose);
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.up-small-btn:disabled { opacity: .5; cursor: not-allowed; }

.up-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}

.up-summary-card {
  background: var(--panel-bg);
  border: 1px solid var(--mauve-light);
  border-radius: 16px;
  padding: 16px;
}

.up-summary-label {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 8px;
}

.up-summary-value {
  font-family: var(--font-heading), sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
}

.up-summary-note {
  font-size: 12px;
  color: var(--text-mid);
}

.up-workspace {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.up-panel {
  background: var(--panel-bg);
  border: 1px solid var(--mauve-light);
  border-radius: 20px;
  padding: 18px;
}

.up-panel-title {
  font-family: var(--font-heading), sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.up-panel-copy {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 16px;
}

.up-notice {
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 12.5px;
  margin-bottom: 14px;
  border: 1px solid;
}

.up-notice-success {
  color: var(--green);
  background: var(--notice-success-bg);
  border-color: var(--notice-success-border);
}

.up-notice-error {
  color: var(--red);
  background: var(--notice-error-bg);
  border-color: var(--notice-error-border);
}

.up-proc {
  text-align: center;
  padding: 20px 0 8px;
}

.up-proc-ring {
  width: 54px;
  height: 54px;
  border: 3px solid var(--mauve-light);
  border-top-color: var(--rose);
  border-radius: 50%;
  animation: spin .85s linear infinite;
  margin: 0 auto 18px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.up-proc-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 7px;
}

.up-proc-label.active {
  color: var(--rose);
  font-weight: 700;
}

.up-ticket-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
}

.up-ticket-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 620px;
  overflow-y: auto;
  padding-right: 2px;
}

.up-ticket-item {
  background: var(--ticket-item-bg);
  border: 1px solid var(--mauve-light);
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: all .18s;
}

.up-ticket-item:hover,
.up-ticket-item.active {
  border-color: var(--ticket-item-hover-border);
  box-shadow: 0 8px 20px var(--ticket-item-hover-shadow);
  transform: translateY(-1px);
}

.up-ticket-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.up-ticket-id {
  color: var(--rose);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .8px;
}

.up-ticket-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 6px;
  line-height: 1.4;
}

.up-ticket-copy {
  font-size: 12.5px;
  color: var(--text-mid);
  line-height: 1.6;
  margin-bottom: 10px;
}

.up-ticket-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.up-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.up-chip-priority.low { color: var(--chip-low-color); background: var(--chip-low-bg); }
.up-chip-priority.medium { color: var(--chip-medium-color); background: var(--chip-medium-bg); }
.up-chip-priority.high { color: var(--chip-high-color); background: var(--chip-high-bg); }
.up-chip-priority.critical { color: var(--chip-critical-color); background: var(--chip-critical-bg); }

.up-chip-status.auto_resolved,
.up-chip-status.human_resolved { color: var(--chip-resolved-color); background: var(--chip-resolved-bg); }
.up-chip-status.pending_human { color: var(--chip-pending-color); background: var(--chip-pending-bg); }
.up-chip-status.open { color: var(--chip-open-color); background: var(--chip-open-bg); }

.up-detail-card {
  background: var(--ticket-item-bg);
  border: 1px solid var(--mauve-light);
  border-radius: 20px;
  padding: 20px;
  min-height: 100%;
}

.up-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0 18px;
}

.up-detail-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 5px;
}

.up-detail-value {
  font-size: 13px;
  color: var(--text-mid);
  line-height: 1.5;
}

.up-solution-card {
  background: var(--solution-card-bg);
  border: 1px solid var(--solution-card-border);
  border-left: 3px solid var(--rose);
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
}

.up-explanation-card {
  background: var(--explanation-card-bg);
  border: 1px solid var(--explanation-card-border);
  border-left: 3px solid var(--amber);
  border-radius: 16px;
  padding: 16px;
  margin-top: 14px;
}

.up-empty {
  border: 1px dashed var(--mauve-light);
  border-radius: 18px;
  padding: 28px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
  background: var(--empty-bg);
}

.up-slide { animation: upSlide .32s cubic-bezier(.22,1,.36,1); }
@keyframes upSlide { from { opacity: 0; transform: translateX(16px) scale(.99); } to { opacity: 1; transform: none; } }

@media (max-width: 1180px) {
  .up-card-wide { max-width: 1000px; }
  .up-workspace { grid-template-columns: 320px minmax(0, 1fr); }
}

@media (max-width: 900px) {
  .up-portal-actions {
    top: 14px;
    right: 14px;
    left: 14px;
  }

  .up-auth-toast {
    top: 68px;
    right: 14px;
    left: 14px;
    max-width: none;
  }

  .up-portal-action {
    flex: 1 1 auto;
    text-align: center;
  }

  .up-card-wide {
    padding: 28px 22px;
  }

  .up-summary-grid,
  .up-workspace,
  .up-ticket-shell,
  .up-detail-grid {
    grid-template-columns: 1fr;
  }
}
.up-btn:disabled { opacity: .45; cursor: not-allowed; }

.up-btn-ghost {
  width: 100%;
  padding: 10px;
  background: none;
  border: 1.5px solid var(--mauve-light);
  border-radius: 11px;
  color: var(--text-mid);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: all .2s;
}

.up-btn-ghost:hover { border-color: var(--blush); color: var(--rose); background: rgba(99,102,241,0.06); }

.up-auth-mode-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.up-auth-mode-btn {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--mauve-light);
  background: rgba(255,255,255,0.02);
  color: var(--text-mid);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .18s;
}

.up-auth-mode-btn.active {
  border-color: var(--rose);
  background: rgba(99,102,241,0.09);
  color: var(--rose);
  box-shadow: 0 8px 18px rgba(99,102,241,0.08);
}

.up-auth-note {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-top: -4px;
  margin-bottom: 14px;
}

.up-otp-row { margin-bottom: 22px; }
.up-otp-box {
  width: 100%;
  height: 58px;
  text-align: center;
  font-family: 'Syne', sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: .38em;
  color: var(--rose);
  background: rgba(255,255,255,0.04);
  border: 1.5px solid var(--mauve-light);
  border-radius: 11px;
  outline: none;
  transition: all .2s;
  box-sizing: border-box;
  padding: 0 18px;
}

.up-otp-box:focus { border-color: var(--rose); box-shadow: 0 0 0 4px rgba(99,102,241,0.15); background: rgba(255,255,255,0.02); }
.up-otp-box.filled { border-color: rgba(99,102,241,0.45); background: rgba(99,102,241,0.1); }
.up-otp-box.oerr { border-color: var(--red); color: var(--red); }
.up-otp-err { text-align: center; font-size: 12.5px; color: var(--red); margin-bottom: 12px; padding: 8px 12px; background: rgba(248,113,113,0.07); border-radius: 8px; }
.up-resend { text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 12px; }
.up-resend-btn { background: none; border: none; color: var(--rose); cursor: pointer; font-size: 13px; font-weight: 600; text-decoration: underline; padding: 0; font-family: 'DM Sans', sans-serif; }
.up-dev-pill { margin-top: 12px; padding: 9px 12px; background: rgba(139,92,246,0.05); border: 1px dashed rgba(139,92,246,0.2); border-radius: 9px; text-align: center; font-size: 12px; color: var(--mauve); }

.up-profile-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.up-profile-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--rose);
  margin-bottom: 8px;
}

.up-inline-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.up-small-btn {
  border: 1px solid rgba(99,102,241,0.18);
  background: rgba(99,102,241,0.06);
  color: var(--rose);
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.up-small-btn:disabled { opacity: .5; cursor: not-allowed; }

.up-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}

.up-summary-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--mauve-light);
  border-radius: 16px;
  padding: 16px;
}

.up-summary-label {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 8px;
}

.up-summary-value {
  font-family: 'Syne', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: var(--text-dark);
}

.up-summary-note {
  font-size: 12px;
  color: var(--text-mid);
}

.up-workspace {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.up-panel {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--mauve-light);
  border-radius: 20px;
  padding: 18px;
}

.up-panel-title {
  font-family: 'Syne', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.up-panel-copy {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 16px;
}

.up-notice {
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 12.5px;
  margin-bottom: 14px;
  border: 1px solid;
}

.up-notice-success {
  color: var(--green);
  background: rgba(16,185,129,0.08);
  border-color: rgba(16,185,129,0.18);
}

.up-notice-error {
  color: var(--red);
  background: rgba(248,113,113,0.08);
  border-color: rgba(248,113,113,0.18);
}

.up-proc {
  text-align: center;
  padding: 20px 0 8px;
}

.up-proc-ring {
  width: 54px;
  height: 54px;
  border: 3px solid var(--mauve-light);
  border-top-color: var(--rose);
  border-radius: 50%;
  animation: spin .85s linear infinite;
  margin: 0 auto 18px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.up-proc-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 7px;
}

.up-proc-label.active {
  color: var(--rose);
  font-weight: 700;
}

.up-ticket-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
}

.up-ticket-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 620px;
  overflow-y: auto;
  padding-right: 2px;
}

.up-ticket-item {
  background: rgba(255,255,255,0.01);
  border: 1px solid var(--mauve-light);
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: all .18s;
}

.up-ticket-item:hover,
.up-ticket-item.active {
  border-color: rgba(99,102,241,0.35);
  box-shadow: 0 8px 20px rgba(99,102,241,0.09);
  transform: translateY(-1px);
}

.up-ticket-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.up-ticket-id {
  color: var(--rose);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .8px;
}

.up-ticket-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 6px;
  line-height: 1.4;
}

.up-ticket-copy {
  font-size: 12.5px;
  color: var(--text-mid);
  line-height: 1.6;
  margin-bottom: 10px;
}

.up-ticket-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.up-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.up-chip-priority.low { color: #52c480; background: rgba(16,185,129,0.1); }
.up-chip-priority.medium { color: #f59e0b; background: rgba(245,158,11,0.1); }
.up-chip-priority.high { color: #f97316; background: rgba(249,115,22,0.1); }
.up-chip-priority.critical { color: #f87171; background: rgba(248,113,113,0.1); }

.up-chip-status.auto_resolved,
.up-chip-status.human_resolved { color: var(--green); background: rgba(16,185,129,0.1); }
.up-chip-status.pending_human { color: var(--amber); background: rgba(245,158,11,0.1); }
.up-chip-status.open { color: var(--mauve); background: rgba(139,92,246,0.15); }

.up-detail-card {
  background: rgba(255,255,255,0.01);
  border: 1px solid var(--mauve-light);
  border-radius: 20px;
  padding: 20px;
  min-height: 100%;
}

.up-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0 18px;
}

.up-detail-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 5px;
}

.up-detail-value {
  font-size: 13px;
  color: var(--text-mid);
  line-height: 1.5;
}

.up-solution-card {
  background: rgba(99,102,241,0.06);
  border: 1px solid rgba(99,102,241,0.12);
  border-left: 3px solid var(--rose);
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
}

.up-explanation-card {
  background: rgba(245,158,11,0.06);
  border: 1px solid rgba(245,158,11,0.12);
  border-left: 3px solid var(--amber);
  border-radius: 16px;
  padding: 16px;
  margin-top: 14px;
}

.up-empty {
  border: 1px dashed var(--mauve-light);
  border-radius: 18px;
  padding: 28px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
  background: rgba(255,255,255,0.01);
}

.up-slide { animation: upSlide .32s cubic-bezier(.22,1,.36,1); }
@keyframes upSlide { from { opacity: 0; transform: translateX(16px) scale(.99); } to { opacity: 1; transform: none; } }

@media (max-width: 1180px) {
  .up-card-wide { max-width: 1000px; }
  .up-workspace { grid-template-columns: 320px minmax(0, 1fr); }
}

@media (max-width: 900px) {
  .up-portal-actions {
    top: 14px;
    right: 14px;
    left: 14px;
  }

  .up-auth-toast {
    top: 68px;
    right: 14px;
    left: 14px;
    max-width: none;
  }

  .up-portal-action {
    flex: 1 1 auto;
    text-align: center;
  }

  .up-card-wide {
    padding: 28px 22px;
  }

  .up-summary-grid,
  .up-workspace,
  .up-ticket-shell,
  .up-detail-grid {
    grid-template-columns: 1fr;
  }
}
.up-btn:disabled { opacity: .45; cursor: not-allowed; }

.up-btn-ghost {
  width: 100%;
  padding: 10px;
  background: none;
  border: 1.5px solid var(--mauve-light);
  border-radius: 11px;
  color: var(--text-mid);
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: all .2s;
}

.up-btn-ghost:hover { border-color: var(--blush); color: var(--rose); background: rgba(201,107,107,0.04); }

.up-auth-mode-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.up-auth-mode-btn {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--mauve-light);
  background: var(--cream);
  color: var(--text-mid);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .18s;
}

.up-auth-mode-btn.active {
  border-color: var(--rose);
  background: rgba(201,107,107,0.09);
  color: var(--rose);
  box-shadow: 0 8px 18px rgba(201,107,107,0.08);
}

.up-auth-note {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-top: -4px;
  margin-bottom: 14px;
}

.up-otp-row { margin-bottom: 22px; }
.up-otp-box {
  width: 100%;
  height: 58px;
  text-align: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: .38em;
  color: var(--rose);
  background: var(--cream);
  border: 1.5px solid var(--mauve-light);
  border-radius: 11px;
  outline: none;
  transition: all .2s;
  box-sizing: border-box;
  padding: 0 18px;
}

.up-otp-box:focus { border-color: var(--rose); box-shadow: 0 0 0 4px rgba(201,107,107,0.11); background: var(--white); }
.up-otp-box.filled { border-color: rgba(201,107,107,0.45); background: rgba(245,198,194,0.16); }
.up-otp-box.oerr { border-color: var(--red); color: var(--red); }
.up-otp-err { text-align: center; font-size: 12.5px; color: var(--red); margin-bottom: 12px; padding: 8px 12px; background: rgba(201,68,68,0.07); border-radius: 8px; }
.up-resend { text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 12px; }
.up-resend-btn { background: none; border: none; color: var(--rose); cursor: pointer; font-size: 13px; font-weight: 600; text-decoration: underline; padding: 0; font-family: 'Nunito', sans-serif; }
.up-dev-pill { margin-top: 12px; padding: 9px 12px; background: rgba(155,123,138,0.07); border: 1px dashed rgba(155,123,138,0.28); border-radius: 9px; text-align: center; font-size: 12px; color: var(--mauve); }

.up-profile-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.up-profile-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--rose);
  margin-bottom: 8px;
}

.up-inline-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.up-small-btn {
  border: 1px solid rgba(201,107,107,0.18);
  background: rgba(201,107,107,0.06);
  color: var(--rose);
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.up-small-btn:disabled { opacity: .5; cursor: not-allowed; }

.up-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}

.up-summary-card {
  background: var(--cream);
  border: 1px solid var(--mauve-light);
  border-radius: 16px;
  padding: 16px;
}

.up-summary-label {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 8px;
}

.up-summary-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
}

.up-summary-note {
  font-size: 12px;
  color: var(--text-mid);
}

.up-workspace {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.up-panel {
  background: rgba(253,248,242,0.72);
  border: 1px solid var(--mauve-light);
  border-radius: 20px;
  padding: 18px;
}

.up-panel-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.up-panel-copy {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 16px;
}

.up-notice {
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 12.5px;
  margin-bottom: 14px;
  border: 1px solid;
}

.up-notice-success {
  color: var(--green);
  background: rgba(62,158,111,0.08);
  border-color: rgba(62,158,111,0.18);
}

.up-notice-error {
  color: var(--red);
  background: rgba(201,68,68,0.08);
  border-color: rgba(201,68,68,0.18);
}

.up-proc {
  text-align: center;
  padding: 20px 0 8px;
}

.up-proc-ring {
  width: 54px;
  height: 54px;
  border: 3px solid var(--mauve-light);
  border-top-color: var(--rose);
  border-radius: 50%;
  animation: spin .85s linear infinite;
  margin: 0 auto 18px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.up-proc-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 7px;
}

.up-proc-label.active {
  color: var(--rose);
  font-weight: 700;
}

.up-ticket-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
}

.up-ticket-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 620px;
  overflow-y: auto;
  padding-right: 2px;
}

.up-ticket-item {
  background: var(--white);
  border: 1px solid var(--mauve-light);
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: all .18s;
}

.up-ticket-item:hover,
.up-ticket-item.active {
  border-color: rgba(201,107,107,0.35);
  box-shadow: 0 8px 20px rgba(201,107,107,0.09);
  transform: translateY(-1px);
}

.up-ticket-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.up-ticket-id {
  color: var(--rose);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .8px;
}

.up-ticket-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 6px;
  line-height: 1.4;
}

.up-ticket-copy {
  font-size: 12.5px;
  color: var(--text-mid);
  line-height: 1.6;
  margin-bottom: 10px;
}

.up-ticket-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.up-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.up-chip-priority.low { color: #4f8c67; background: rgba(62,158,111,0.10); }
.up-chip-priority.medium { color: #a56b22; background: rgba(224,154,59,0.12); }
.up-chip-priority.high { color: #b85a2b; background: rgba(224,107,58,0.12); }
.up-chip-priority.critical { color: #b13c3c; background: rgba(201,68,68,0.12); }

.up-chip-status.auto_resolved,
.up-chip-status.human_resolved { color: var(--green); background: rgba(62,158,111,0.10); }
.up-chip-status.pending_human { color: var(--amber); background: rgba(224,154,59,0.12); }
.up-chip-status.open { color: var(--mauve); background: rgba(155,123,138,0.12); }

.up-detail-card {
  background: var(--white);
  border: 1px solid var(--mauve-light);
  border-radius: 20px;
  padding: 20px;
  min-height: 100%;
}

.up-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0 18px;
}

.up-detail-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 5px;
}

.up-detail-value {
  font-size: 13px;
  color: var(--text-mid);
  line-height: 1.5;
}

.up-solution-card {
  background: rgba(201,107,107,0.06);
  border: 1px solid rgba(201,107,107,0.12);
  border-left: 3px solid var(--rose);
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
}

.up-explanation-card {
  background: rgba(224,154,59,0.06);
  border: 1px solid rgba(224,154,59,0.12);
  border-left: 3px solid var(--amber);
  border-radius: 16px;
  padding: 16px;
  margin-top: 14px;
}

.up-empty {
  border: 1px dashed var(--mauve-light);
  border-radius: 18px;
  padding: 28px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
  background: rgba(255,252,250,0.55);
}

.up-slide { animation: upSlide .32s cubic-bezier(.22,1,.36,1); }
@keyframes upSlide { from { opacity: 0; transform: translateX(16px) scale(.99); } to { opacity: 1; transform: none; } }

@media (max-width: 1180px) {
  .up-card-wide { max-width: 1000px; }
  .up-workspace { grid-template-columns: 320px minmax(0, 1fr); }
}

@media (max-width: 900px) {
  .up-portal-actions {
    top: 14px;
    right: 14px;
    left: 14px;
  }

  .up-auth-toast {
    top: 68px;
    right: 14px;
    left: 14px;
    max-width: none;
  }

  .up-portal-action {
    flex: 1 1 auto;
    text-align: center;
  }

  .up-card-wide {
    padding: 28px 22px;
  }

  .up-summary-grid,
  .up-workspace,
  .up-ticket-shell,
  .up-detail-grid {
    grid-template-columns: 1fr;
  }
}
`;

  document.head.appendChild(el);
};

function Steps({ current }) {
  const list = [
    { key: "login", label: "Sign In" },
    { key: "portal", label: "Profile" },
  ];
  const currentIndex = list.findIndex(item => item.key === current);

  return (
    <div className="up-steps">
      {list.map((item, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "active" : "idle";
        return (
          <div key={item.key} className="up-step-item" style={{ flex: index < list.length - 1 ? 1 : "0 0 auto" }}>
            <div className={`up-step-circle ${state}`}>{state === "done" ? "OK" : index + 1}</div>
            <span className={`up-step-label ${state}`}>{item.label}</span>
            {index < list.length - 1 && <div className={`up-step-line ${state === "done" ? "done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

function LoginStep({ onNext }) {
  const [loginValue, setLoginValue] = useState("");
  const [provider, setProvider] = useState("email");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event?.preventDefault();
    const trimmedValue = loginValue.trim();
    const normalizedEmail = trimmedValue.toLowerCase();
    const normalizedPhone = trimmedValue.replace(/[^\d+]/g, "");

    if (!trimmedValue) {
      setError(provider === "phone" ? "Phone number is required" : "Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password !== SHARED_LOGIN_PASSWORD) {
      setError("Password must be 123456");
      return;
    }

    if (provider === "phone") {
      if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
        setError("Enter a valid phone number with country code, for example +919876543210.");
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        setError("Enter a valid email address");
        return;
      }
      if (provider === "gmail" && !normalizedEmail.endsWith("@gmail.com")) {
        setError("Please enter a Gmail address when using Gmail sign in.");
        return;
      }
    }

    setError("");
    setLoading(true);
    const result = await onNext({
      provider,
      email: provider === "phone" ? null : normalizedEmail,
      phoneNumber: provider === "phone" ? normalizedPhone : null,
      password,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.message || "Could not log in right now.");
    }
  };

  return (
    <div className="up-slide">
      <Steps current="login" />
      <h1 className="up-heading">Choose your<br /><em>login method.</em></h1>
      <p className="up-subtext">Use Email, Gmail, or Phone, then enter the shared password to open your personal ticket workspace.</p>
      <form onSubmit={submit}>
        <div className="up-auth-mode-row">
          <button
            type="button"
            className={`up-auth-mode-btn ${provider === "email" ? "active" : ""}`}
            onClick={() => {
              setProvider("email");
              setError("");
            }}
          >
            Continue with Email
          </button>
          <button
            type="button"
            className={`up-auth-mode-btn ${provider === "gmail" ? "active" : ""}`}
            onClick={() => {
              setProvider("gmail");
              setError("");
            }}
          >
            Continue with Gmail
          </button>
          <button
            type="button"
            className={`up-auth-mode-btn ${provider === "phone" ? "active" : ""}`}
            onClick={() => {
              setProvider("phone");
              setError("");
            }}
          >
            Continue with Phone
          </button>
        </div>
        <div className="up-auth-note">
          {provider === "gmail"
            ? "Choose your Gmail account by entering a Gmail address, then use the shared password below."
            : provider === "phone"
              ? "Enter a phone number with country code, then use the shared password below."
              : "Enter any valid email address, then use the shared password below."}
        </div>
        <div className="up-field">
          <label className="up-label">
            {provider === "gmail" ? "Gmail account" : provider === "phone" ? "Phone number" : "Email address"}
          </label>
          <input
            className={`up-input${error ? " err" : ""}`}
            type={provider === "phone" ? "tel" : "email"}
            placeholder={provider === "gmail" ? "you@gmail.com" : provider === "phone" ? "+919876543210" : "you@company.com"}
            value={loginValue}
            onChange={event => {
              setLoginValue(event.target.value);
              setError("");
            }}
            autoFocus
          />
        </div>
        <div className="up-field">
          <label className="up-label">Password</label>
          <input
            className={`up-input${error ? " err" : ""}`}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={event => {
              setPassword(event.target.value);
              setError("");
            }}
          />
          {error && <div className="up-ferr">Warning: {error}</div>}
        </div>
        <button type="submit" className="up-btn" disabled={loading}>
          {loading
            ? "Signing in..."
            : provider === "gmail"
              ? "Login with Gmail ->"
              : provider === "phone"
                ? "Login with Phone ->"
                : "Login with Email ->"}
        </button>
      </form>
    </div>
  );
}

function StatusChip({ status }) {
  const labelMap = {
    open: "Open",
    pending_human: "Pending Human",
    auto_resolved: "Auto Resolved",
    human_resolved: "Human Resolved",
  };

  return (
    <span className={`up-chip up-chip-status ${status || "open"}`}>
      {labelMap[status] || "Open"}
    </span>
  );
}

function PriorityChip({ priority }) {
  return (
    <span className={`up-chip up-chip-priority ${priority || "medium"}`}>
      {(priority || "medium").toUpperCase()}
    </span>
  );
}

function TicketComposer({ email, creating, onCreateTicket, createError, notice }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });
  const [errors, setErrors] = useState({});
  const [processIndex, setProcessIndex] = useState(0);

  useEffect(() => {
    if (!creating) {
      setProcessIndex(0);
      return undefined;
    }

    const interval = setInterval(() => {
      setProcessIndex(current => (current + 1) % PROCESS_STEPS.length);
    }, 800);

    return () => clearInterval(interval);
  }, [creating]);

  const submit = async () => {
    const nextErrors = {};
    if (!form.title.trim() || form.title.trim().length < 5) {
      nextErrors.title = "Please enter a descriptive title with at least 5 characters.";
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      nextErrors.description = "Please describe the issue in more detail.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const created = await onCreateTicket(form);
    if (created) {
      setForm({ title: "", description: "", priority: "medium" });
      setErrors({});
    }
  };

  return (
    <div className="up-panel">
      <div className="up-panel-title">Raise a ticket</div>
      <div className="up-panel-copy">Every ticket raised here goes straight into the shared admin queue and stays attached to <strong>{email}</strong>.</div>

      {notice && <div className="up-notice up-notice-success">{notice}</div>}
      {createError && <div className="up-notice up-notice-error">{createError}</div>}

      {creating ? (
        <div className="up-proc">
          <div className="up-proc-ring" />
          {PROCESS_STEPS.map((step, index) => (
            <div key={step} className={`up-proc-label ${index === processIndex ? "active" : ""}`}>
              {index <= processIndex ? `OK ${step}` : step}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="up-field">
            <label className="up-label">Issue title</label>
            <input
              className={`up-input${errors.title ? " err" : ""}`}
              type="text"
              placeholder="Unable to connect to VPN from home"
              value={form.title}
              onChange={event => {
                setForm(current => ({ ...current, title: event.target.value }));
                setErrors(current => ({ ...current, title: "" }));
              }}
            />
            {errors.title && <div className="up-ferr">Warning: {errors.title}</div>}
          </div>

          <div className="up-field">
            <label className="up-label">Description</label>
            <textarea
              className={`up-textarea${errors.description ? " err" : ""}`}
              placeholder="What is happening? What did you try? Which error message are you seeing?"
              value={form.description}
              onChange={event => {
                setForm(current => ({ ...current, description: event.target.value }));
                setErrors(current => ({ ...current, description: "" }));
              }}
            />
            {errors.description && <div className="up-ferr">Warning: {errors.description}</div>}
          </div>

          <div className="up-field">
            <label className="up-label">Priority</label>
            <select
              className="up-select"
              value={form.priority}
              onChange={event => setForm(current => ({ ...current, priority: event.target.value }))}
            >
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </div>

          <button className="up-btn" onClick={submit}>Submit to Shared Queue -></button>
        </>
      )}
    </div>
  );
}

function TicketList({ tickets, selectedTicketId, onSelectTicket, loadingTickets }) {
  return (
    <div className="up-panel">
      <div className="up-panel-title">My tickets</div>
      <div className="up-panel-copy">These are the tickets raised with your login ID. Clicking a ticket opens the AI answer and resolution details.</div>

      {loadingTickets ? (
        <div className="up-empty">Loading your ticket history...</div>
      ) : tickets.length === 0 ? (
        <div className="up-empty">No tickets yet. Raise your first issue from the panel on the left and it will appear here and in the admin queue.</div>
      ) : (
        <div className="up-ticket-list">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className={`up-ticket-item ${selectedTicketId === ticket.id ? "active" : ""}`}
              onClick={() => onSelectTicket(ticket.id)}
            >
              <div className="up-ticket-top">
                <div className="up-ticket-id">TICKET #{ticket.id}</div>
                <StatusChip status={ticket.status} />
              </div>
              <div className="up-ticket-title">{ticket.title}</div>
              <div className="up-ticket-copy">
                {ticket.description.length > 110 ? `${ticket.description.slice(0, 110)}...` : ticket.description}
              </div>
              <div className="up-ticket-meta">
                <PriorityChip priority={ticket.priority} />
                <span className="up-chip">{ticket.category ? ticket.category.toUpperCase() : "PENDING CATEGORY"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketDetail({ ticket }) {
  if (!ticket) {
    return (
      <div className="up-detail-card">
        <div className="up-empty">Select a ticket to see the AI answer, status, confidence, and the final resolution shown in the queue.</div>
      </div>
    );
  }

  return (
    <div className="up-detail-card">
      <div className="up-ticket-id">TICKET #{ticket.id}</div>
      <div className="up-panel-title" style={{ marginTop: "6px", marginBottom: "8px" }}>{ticket.title}</div>
      <div className="up-ticket-copy" style={{ marginBottom: 0 }}>{ticket.description}</div>

      <div className="up-detail-grid">
        <div>
          <div className="up-detail-label">Status</div>
          <div className="up-detail-value"><StatusChip status={ticket.status} /></div>
        </div>
        <div>
          <div className="up-detail-label">Priority</div>
          <div className="up-detail-value"><PriorityChip priority={ticket.priority} /></div>
        </div>
        <div>
          <div className="up-detail-label">Category</div>
          <div className="up-detail-value">{ticket.category || "Processing"}</div>
        </div>
        <div>
          <div className="up-detail-label">Confidence</div>
          <div className="up-detail-value">
            {typeof ticket.confidence_score === "number"
              ? `${Math.round(ticket.confidence_score * 100)}%`
              : "Not available yet"}
          </div>
        </div>
        <div>
          <div className="up-detail-label">Submitted by</div>
          <div className="up-detail-value">{ticket.submitted_by}</div>
        </div>
        <div>
          <div className="up-detail-label">Last updated</div>
          <div className="up-detail-value">{ticket.updated_at ? new Date(ticket.updated_at).toLocaleString() : "Just now"}</div>
        </div>
      </div>

      <div className="up-solution-card">
        <div className="up-detail-label" style={{ color: "var(--rose)" }}>AI Answer / Resolution</div>
        <div className="up-detail-value" style={{ whiteSpace: "pre-line" }}>
          {ticket.ai_solution || "The AI is still processing this ticket. Refresh in a moment to see the generated answer."}
        </div>
      </div>

      {ticket.explanation && (
        <div className="up-explanation-card">
          <div className="up-detail-label" style={{ color: "var(--amber)" }}>Why the AI chose this</div>
          <div className="up-detail-value" style={{ whiteSpace: "pre-line" }}>{ticket.explanation}</div>
        </div>
      )}
    </div>
  );
}

function PortalStep({
  email,
  tickets,
  selectedTicket,
  selectedTicketId,
  loadingTickets,
  refreshing,
  createError,
  notice,
  creating,
  onCreateTicket,
  onSelectTicket,
  onRefresh,
  onSignOut,
}) {
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(ticket => ticket.status === "auto_resolved" || ticket.status === "human_resolved").length;
  const pendingTickets = tickets.filter(ticket => ticket.status === "open" || ticket.status === "pending_human").length;

  return (
    <div className="up-slide">
      <Steps current="portal" />

      <div className="up-profile-head">
        <div>
          <div className="up-profile-kicker">User profile</div>
          <h1 className="up-heading">Welcome back,<br /><em>{email}</em></h1>
          <p className="up-subtext">This workspace shows only the tickets raised with your login ID, along with the AI-generated answer and final resolution.</p>
        </div>

        <div className="up-inline-actions">
          <button className="up-small-btn" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh Tickets"}
          </button>
          <button className="up-small-btn" onClick={onSignOut}>Switch User</button>
        </div>
      </div>

      <div className="up-summary-grid">
        <div className="up-summary-card">
          <div className="up-summary-label">Tickets raised</div>
          <div className="up-summary-value">{totalTickets}</div>
          <div className="up-summary-note">All issues submitted with this login ID.</div>
        </div>
        <div className="up-summary-card">
          <div className="up-summary-label">Resolved</div>
          <div className="up-summary-value">{resolvedTickets}</div>
          <div className="up-summary-note">Solved by AI or completed by an admin.</div>
        </div>
        <div className="up-summary-card">
          <div className="up-summary-label">Pending</div>
          <div className="up-summary-value">{pendingTickets}</div>
          <div className="up-summary-note">Still in progress or waiting for review.</div>
        </div>
      </div>

      <div className="up-workspace">
        <TicketComposer
          email={email}
          creating={creating}
          onCreateTicket={onCreateTicket}
          createError={createError}
          notice={notice}
        />

        <div className="up-ticket-shell">
          <TicketList
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={onSelectTicket}
            loadingTickets={loadingTickets}
          />
          <TicketDetail ticket={selectedTicket} />
        </div>
      </div>
    </div>
  );
}

export default function UserPortal() {
  useEffect(() => { injectStyles(); }, []);

  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [createError, setCreateError] = useState("");

  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId) || null;
  const isPortal = step === "portal";

  const reset = () => {
    setStep("login");
    setEmail("");
    setTickets([]);
    setSelectedTicketId(null);
    setLoadingTickets(false);
    setRefreshing(false);
    setCreating(false);
    setNotice("");
    setCreateError("");
  };

  const goHome = () => {
    reset();
    navigate("/");
  };

  const goToDeveloperLogin = () => {
    navigate("/admin/login");
  };

  const loadTickets = async (userEmail, options = {}) => {
    const silent = Boolean(options.silent);

    if (silent) setRefreshing(true);
    else setLoadingTickets(true);

    try {
      const response = await axios.get(`${API}/tickets/`, {
        params: { submitted_by: userEmail },
      });

      setTickets(response.data);
      setCreateError("");
    } catch (error) {
      setCreateError("Could not load your tickets. Please make sure the backend server is running.");
    } finally {
      if (silent) setRefreshing(false);
      else setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (step === "portal" && email) {
      loadTickets(email);
    }
  }, [step, email]);

  useEffect(() => {
    if (!tickets.length) {
      setSelectedTicketId(null);
      return;
    }

    if (!selectedTicketId || !tickets.some(ticket => ticket.id === selectedTicketId)) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  const handleCreateTicket = async (form) => {
    setCreating(true);
    setCreateError("");
    setNotice("");

    try {
      const response = await axios.post(`${API}/tickets/`, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        submitted_by: email,
      });

      await loadTickets(email, { silent: true });
      setSelectedTicketId(response.data.ticket_id);
      setNotice(`Ticket #${response.data.ticket_id} was created successfully and added to the shared dashboard queue.`);
      return true;
    } catch (error) {
      setCreateError("Ticket submission failed. Please check that the backend server is running and try again.");
      return false;
    } finally {
      setCreating(false);
    }
  };

  const handleLogin = async ({ email: nextEmail, phoneNumber, provider }) => {
    const nextValue = provider === "phone" ? phoneNumber : nextEmail;
    setEmail(nextValue);
    setStep("portal");
    return { success: true };
  };

  return (
    <div className={`up-root ${theme}`}>
      <div className="up-blob up-blob-1" />
      <div className="up-blob up-blob-2" />
      <div className="up-blob up-blob-3" />

      <div className="up-portal-actions">
        <button className="up-portal-action" onClick={() => setTheme(p => p === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <button className="up-portal-action" onClick={goHome}>Home</button>
        <button className="up-portal-action" onClick={goToDeveloperLogin}>Server / Developer Login</button>
      </div>

      <div className="up-left">
        <div className="up-ring up-ring-1" />
        <div className="up-ring up-ring-2" />
        <div className="up-ring up-ring-3" />

        <div className="up-brand">
          <div className="up-brand-mark">S</div>
          <div className="up-brand-name">Smart Ticket AI</div>
          <div className="up-brand-tag">Shared queue for users and admins</div>
        </div>

        <div className="up-left-body">
          <div className="up-headline">Raise a ticket once and watch it flow from your <em>profile</em> into the admin queue.</div>
          <div className="up-desc">Users can now log in with email, submit tickets into the live backend queue, and review every AI answer and final resolution from one workspace.</div>
        </div>

        <div className="up-stats">
          <div><div className="up-stat-num">1</div><div className="up-stat-label">Shared Backend</div></div>
          <div><div className="up-stat-num">100%</div><div className="up-stat-label">User Scoped</div></div>
          <div><div className="up-stat-num">Live</div><div className="up-stat-label">Queue Sync</div></div>
        </div>
      </div>

      <div className="up-right">
        <div className={`up-card ${isPortal ? "up-card-wide" : ""}`}>
          <div className="up-mobile-brand">
            <div className="up-mobile-mark">S</div>
            <div className="up-mobile-name">Smart<span>Ticket</span> AI</div>
          </div>

          {step === "login" && (
            <LoginStep
              onNext={handleLogin}
            />
          )}

          {step === "portal" && (
            <PortalStep
              email={email}
              tickets={tickets}
              selectedTicket={selectedTicket}
              selectedTicketId={selectedTicketId}
              loadingTickets={loadingTickets}
              refreshing={refreshing}
              createError={createError}
              notice={notice}
              creating={creating}
              onCreateTicket={handleCreateTicket}
              onSelectTicket={setSelectedTicketId}
              onRefresh={() => loadTickets(email, { silent: true })}
              onSignOut={reset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
