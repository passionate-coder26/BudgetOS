import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { getScoreColor, getScoreLabel } from '../../data/seedData';

export default function TopBar({ district }) {
  if (!district) return null;
  const scoreColor = getScoreColor(district.healthScore);
  const scoreLabel = getScoreLabel(district.healthScore);

  return (
    <div className="h-16 bg-bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-text">{district.name} District</h1>
          <p className="text-xs text-text-subtle">Maharashtra Budget Intelligence Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
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

        <button className="btn-ghost p-2 rounded-lg text-text-subtle hover:text-text">
          <Bell size={18} />
        </button>
        <button className="btn-ghost p-2 rounded-lg text-text-subtle hover:text-text">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
