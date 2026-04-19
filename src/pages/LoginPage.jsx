import React, { useState } from 'react';
import { authenticate, detectRoleFromUsername } from '../data/officialAccounts';
import { Lock, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';

// Shared input style
const INPUT_STYLE = {
  width: '100%',
  background: '#1a2535',
  border: '1px solid #1F2D45',
  borderRadius: '10px',
  padding: '11px 14px',
  color: '#E2E8F0',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const FEATURES = [
  { icon: '⚡', label: 'AI-Powered Analysis' },
  { icon: '🔍', label: 'Fund Leakage Detection' },
  { icon: '📊', label: 'Scenario Simulation' },
  { icon: '🏘', label: 'Village-Level Insights' },
];

const ROLE_BADGE_COLORS = {
  'District Officer': { bg: 'rgba(0,212,180,0.12)', border: 'rgba(0,212,180,0.35)', text: '#00D4B4' },
  'Block Officer':    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', text: '#60a5fa' },
  'GP Officer':       { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', text: '#a78bfa' },
};

export default function LoginPage({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState('');

  const detectedRole = detectRoleFromUsername(username.trim());
  const badgeStyle = detectedRole ? ROLE_BADGE_COLORS[detectedRole] : null;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const user = authenticate(username.trim(), password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#E2E8F0] font-sans flex items-center justify-center relative overflow-hidden">
      {/* dot bg */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-stretch pt-12 lg:pt-8">

        {/* ── LEFT COLUMN: Branding ─────────────────────────────── */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center lg:pl-4">
          <div className="mb-10">
            <h1 className="text-[36px] font-[600] text-[#00D4B4] tracking-tight leading-none mb-4">BudgetOS</h1>
            <p className="text-[20px] font-medium text-white mb-3">Official Portal Access</p>
            <p className="text-[15px] text-[#64748B] leading-[1.6]">
              Secure login for District, Block, and Gram Panchayat officers to enter and validate fund flow data.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            {FEATURES.map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full bg-[#111827] border border-[#1F2D45] flex items-center justify-center text-[#00D4B4] text-[14px]">
                  {f.icon}
                </div>
                <span className="text-[#94A3B8] font-medium text-[14px]">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-[#1F2D45]/50 flex items-center gap-2">
            <span className="text-[13px] text-[#64748B] font-medium">Powered by Gemini AI</span>
          </div>

          {onBack && (
            <button onClick={onBack} className="mt-4 text-[13px] text-[#64748B] hover:text-[#00D4B4] transition-colors underline text-left">
              ← Back to citizen view
            </button>
          )}
        </div>

        {/* DIVIDER */}
        <div className="hidden lg:block w-[1px] bg-gradient-to-b from-transparent via-[#1F2D45] to-transparent" />

        {/* ── RIGHT COLUMN: Form ────────────────────────────────── */}
        <div className="w-full lg:w-[60%] flex flex-col justify-center">
          <div className="bg-[#111827] border border-[#1F2D45] rounded-[16px] p-6 sm:p-[32px] shadow-2xl">
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#00D4B4]/10 border border-[#00D4B4]/30 flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#00D4B4]" />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold text-white leading-tight">Government Official Portal</h2>
                <p className="text-[13px] text-[#64748B]">Restricted access — officials only</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-[#64748B] font-semibold mb-2">
                  Username
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    placeholder="e.g. district_aurangabad"
                    style={{
                      ...INPUT_STYLE,
                      paddingLeft: '38px',
                      borderColor: focus === 'user' ? '#00D4B4' : '#1F2D45',
                    }}
                    onFocus={() => setFocus('user')}
                    onBlur={() => setFocus('')}
                    autoComplete="username"
                  />
                </div>

                {/* Role detection badge */}
                {detectedRole && badgeStyle && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: badgeStyle.bg, border: `1px solid ${badgeStyle.border}`, color: badgeStyle.text }}>
                    <ShieldCheck size={11} />
                    {detectedRole}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-[#64748B] font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter password"
                    style={{
                      ...INPUT_STYLE,
                      paddingLeft: '38px',
                      paddingRight: '40px',
                      borderColor: focus === 'pass' ? '#00D4B4' : error ? '#EF4444' : '#1F2D45',
                    }}
                    onFocus={() => setFocus('pass')}
                    onBlur={() => setFocus('')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94a3b8] transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-[8px] px-4 py-3 text-[#f87171] text-[13px] flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className="w-full h-[48px] rounded-[12px] bg-[#00D4B4] text-[#0A0E1A] font-[600] text-[14px] tracking-[0.02em] hover:bg-[#00ebd0] hover:scale-[1.01] transition-all duration-200 shadow-[0_0_15px_rgba(0,212,180,0.2)] flex items-center justify-center gap-2 mt-2"
              >
                <Lock size={16} />
                Login to Portal
              </button>
            </form>

            {/* Demo hint */}
            <div className="mt-6 pt-5 border-t border-[#1F2D45]/60">
              <p className="text-[12px] text-[#64748B] text-center">
                Demo: try <span className="text-[#00D4B4] font-mono">district_aurangabad</span> / <span className="text-[#00D4B4] font-mono">dist123</span>
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-[#64748B] text-center">
                <div className="bg-[#1a2535] rounded-lg p-2 border border-[#1F2D45]">
                  <div className="text-[#00D4B4] font-semibold mb-1">District</div>
                  district_aurangabad / dist123
                </div>
                <div className="bg-[#1a2535] rounded-lg p-2 border border-[#1F2D45]">
                  <div className="text-[#60a5fa] font-semibold mb-1">Block</div>
                  block_aurangabad_1 / block123
                </div>
                <div className="bg-[#1a2535] rounded-lg p-2 border border-[#1F2D45]">
                  <div className="text-[#a78bfa] font-semibold mb-1">GP</div>
                  gp_aurangabad_1 / gp123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
