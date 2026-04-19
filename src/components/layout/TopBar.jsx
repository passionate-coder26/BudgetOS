import React from 'react';
import { Bell, Settings, Database, Lock, LogOut, Eye } from 'lucide-react';
import { getScoreColor, getScoreLabel } from '../../data/seedData';

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL BANNER — shown as a second row when a user is logged in
// ─────────────────────────────────────────────────────────────────────────────
function OfficialBanner({ user, onSwitchView, onLogout }) {
  const roleColors = {
    'District Officer': '#00D4B4',
    'Block Officer':    '#60a5fa',
    'GP Officer':       '#a78bfa',
  };
  const color = roleColors[user.level] || '#00D4B4';

  return (
    <div style={{
      background: 'rgba(0,212,180,0.06)',
      borderBottom: '1px solid rgba(0,212,180,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 24px', flexShrink: 0, gap: '12px', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Official Portal Active</span>
        <span style={{ width: 1, height: 14, background: '#1F2D45' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color }}>
          {user.displayName}
        </span>
        <span style={{ fontSize: '12px', color: '#64748B' }}>·</span>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{user.level}</span>
        <span style={{ fontSize: '12px', color: '#64748B' }}>·</span>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{user.district} District</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onSwitchView}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 500, padding: '4px 12px',
            borderRadius: '8px', border: '1px solid #1F2D45',
            background: 'transparent', color: '#94a3b8', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#00D4B4'; e.currentTarget.style.color = '#00D4B4'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F2D45'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <Eye size={12} /> Switch to Citizen View
        </button>
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 500, padding: '4px 12px',
            borderRadius: '8px', border: '1px solid rgba(239,68,68,0.35)',
            background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
        >
          <LogOut size={12} /> Logout
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP BAR
// ─────────────────────────────────────────────────────────────────────────────
export default function TopBar({ district, onChangeDataset, loggedInUser, onOfficialLogin, onSwitchView, onLogout }) {
  if (!district) return null;
  const scoreColor = getScoreColor(district.healthScore);
  const scoreLabel = getScoreLabel(district.healthScore);

  return (
    <div className="flex-shrink-0 bg-bg-card border-b border-border">
      {/* Banner */}
      {loggedInUser && (
        <OfficialBanner user={loggedInUser} onSwitchView={onSwitchView} onLogout={onLogout} />
      )}

      {/* Main bar */}
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-text">{district.name} District</h1>
            <p className="text-xs text-text-subtle">Maharashtra Budget Intelligence Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Health Score Badge */}
          <div className="flex items-center gap-2 bg-bg-elevated rounded-xl px-4 py-2 border border-border">
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: scoreColor }}
            />
            <span className="text-sm font-semibold" style={{ color: scoreColor }}>
              {district.healthScore}/100
            </span>
            <span className="text-text-subtle text-sm">·</span>
            <span className="text-sm text-text-muted">{scoreLabel}</span>
          </div>

          {onChangeDataset && (
            <button
              onClick={onChangeDataset}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-text-subtle hover:text-accent hover:border-accent transition-all duration-200"
              title="Change Dataset"
            >
              <Database size={13} />
              Change Dataset
            </button>
          )}

          {/* Official Login button — only shown when not logged in */}
          {!loggedInUser && (
            <button
              onClick={onOfficialLogin}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-text-subtle hover:text-[#00D4B4] hover:border-[#00D4B4] transition-all duration-200"
              title="Official Login"
            >
              <Lock size={13} />
              Official Login
            </button>
          )}

          <button className="btn-ghost p-2 rounded-lg text-text-subtle hover:text-text">
            <Bell size={18} />
          </button>
          <button className="btn-ghost p-2 rounded-lg text-text-subtle hover:text-text">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
