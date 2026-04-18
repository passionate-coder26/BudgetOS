import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { SECTOR_COLORS } from '../../data/seedData';

export default function IndicatorsPanel({ district }) {
  const { indicators, history } = district;

  const historyData = Object.entries(history).map(([year, allocs]) => ({
    year,
    ...allocs,
  }));

  return (
    <div className="grid grid-cols-1 gap-5">
      {/* Indicators Grid */}
      <div className="card">
        <h3 className="font-semibold text-text mb-4">District Indicators</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Human Development Index', value: indicators.HDI.toFixed(2), unit: '', color: indicators.HDI >= 0.7 ? '#16a34a' : indicators.HDI >= 0.6 ? '#d97706' : '#dc2626' },
            { label: 'Literacy Rate', value: indicators.literacyRate, unit: '%', color: indicators.literacyRate >= 80 ? '#16a34a' : indicators.literacyRate >= 70 ? '#d97706' : '#dc2626' },
            { label: 'Infant Mortality', value: indicators.infantMortality, unit: '/1000', color: indicators.infantMortality <= 25 ? '#16a34a' : indicators.infantMortality <= 35 ? '#d97706' : '#dc2626' },
            { label: 'Below Poverty Line', value: indicators.povertyPercent, unit: '%', color: indicators.povertyPercent <= 12 ? '#16a34a' : indicators.povertyPercent <= 20 ? '#d97706' : '#dc2626' },
            { label: 'GDP Per Capita', value: `₹${(indicators.gdpPerCapita / 1000).toFixed(0)}K`, unit: '', color: indicators.gdpPerCapita >= 120000 ? '#16a34a' : indicators.gdpPerCapita >= 80000 ? '#d97706' : '#dc2626' },
            { label: 'Population', value: `${(indicators.population / 1000000).toFixed(1)}M`, unit: '', color: '#94a3b8' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-bg-elevated rounded-xl p-3 border border-border">
              <div className="text-xs text-text-subtle mb-1">{label}</div>
              <div className="text-xl font-bold" style={{ color }}>{value}{unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Chart */}
      <div className="card">
        <h3 className="font-semibold text-text mb-1">Budget History (2019–2024)</h3>
        <p className="text-xs text-text-subtle mb-4">Allocation % by sector over 6 years</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3f5e" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #2d3f5e', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#f1f5f9' }}
              itemStyle={{ color: '#94a3b8' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            {Object.keys(SECTOR_COLORS).map(sector => (
              <Line
                key={sector}
                type="monotone"
                dataKey={sector}
                stroke={SECTOR_COLORS[sector]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
