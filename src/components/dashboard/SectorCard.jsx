import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SECTOR_COLORS } from '../../data/seedData';

// Extended palette covers both original and uploaded dataset sectors
const EXTENDED_COLORS = {
  ...SECTOR_COLORS,
  Healthcare:    '#38bdf8',
  Education:     '#a78bfa',
  Agriculture:   '#34d399',
  Infrastructure:'#fbbf24',
  'Social Welfare':'#f87171',
  Defense:       '#f97316',
  Technology:    '#60a5fa',
  Welfare:       '#f472b6',
  Environment:   '#4ade80',
};

export default function SectorCard({ sector, allocation, recommended, health }) {
  const color = EXTENDED_COLORS[sector] || '#94a3b8';
  const score = health?.score ?? 0;
  const trend = health?.trend ?? 'stable';
  const diff = recommended - allocation;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#94a3b8';

  const sectorKey = sector.toLowerCase().replace(' ', '');

  return (
    <div 
      className="card hover:border-opacity-50 transition-all duration-300 hover:-translate-y-0.5 group"
      style={{ borderColor: `${color}30` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div 
            className="text-xs font-semibold uppercase tracking-wider mb-1 px-2 py-0.5 rounded-md inline-block"
            style={{ color, backgroundColor: `${color}15` }}
          >
            {sector}
          </div>
        </div>
        <TrendIcon size={16} style={{ color: trendColor }} />
      </div>

      {/* Allocation */}
      <div className="mb-3">
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-2xl font-bold text-text">{allocation}%</span>
          <span className="text-xs text-text-subtle">
            Rec: <span style={{ color }}>{recommended}%</span>
          </span>
        </div>
        
        {/* Bar */}
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(allocation, 100)}%`, backgroundColor: color }}
          />
        </div>
        
        {diff !== 0 && (
          <div className="text-xs mt-1" style={{ color: diff > 0 ? '#16a34a' : '#dc2626' }}>
            {diff > 0 ? `+${diff}% needed` : `${diff}% surplus`}
          </div>
        )}
      </div>

      {/* Health Score */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-text-subtle">Health Score</span>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${score}%`,
                backgroundColor: score >= 75 ? '#16a34a' : score >= 55 ? '#d97706' : '#dc2626',
              }}
            />
          </div>
          <span
            className="text-xs font-bold"
            style={{
              color: score >= 75 ? '#16a34a' : score >= 55 ? '#d97706' : '#dc2626',
            }}
          >
            {score}
          </span>
        </div>
      </div>
    </div>
  );
}
