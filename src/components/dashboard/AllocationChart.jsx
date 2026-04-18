import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { SECTORS, SECTOR_COLORS } from '../../data/seedData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-elevated border border-border rounded-xl p-3 text-sm shadow-xl">
        <p className="font-semibold text-text mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-text-muted">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: entry.fill }} />
            <span>{entry.name}: <strong className="text-text">{entry.value}%</strong></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AllocationChart({ allocation, recommended }) {
  const data = SECTORS.map(sector => ({
    sector: sector.split(' ')[0], // Shorten labels
    'Current': allocation[sector],
    'Recommended': recommended[sector],
  }));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-text">Budget Allocation vs Recommended</h3>
          <p className="text-xs text-text-subtle mt-0.5">Current distribution compared to AI-recommended targets</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-text-muted">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-text-muted">Recommended</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%" barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3f5e" vertical={false} />
          <XAxis
            dataKey="sector"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 35]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30,64,175,0.1)' }} />
          <Bar dataKey="Current" fill="#1e40af" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Recommended" fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
