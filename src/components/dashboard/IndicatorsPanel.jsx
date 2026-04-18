import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
// Removed unused sector color utilities

function normalize(value, allValues, invert = false) {
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  if (max === min) return 50;
  const n = (value - min) / (max - min) * 100;
  return invert ? 100 - n : n;
}

export default function IndicatorsPanel({ district, dataset }) {
  const { indicators } = district;

  const avg = {
    hdi: dataset.reduce((s,d) => s+d.hdi, 0) / dataset.length,
    literacy: dataset.reduce((s,d) => s+d.literacy, 0) / dataset.length,
    infantMortality: dataset.reduce((s,d) => s+d.infantMortality, 0) / dataset.length,
    poverty: dataset.reduce((s,d) => s+d.poverty, 0) / dataset.length,
    perCapita: dataset.reduce((s,d) => s+(d.gdp/d.population*100000), 0) / dataset.length,
    healthcare: dataset.reduce((s,d) => s+(Number(d.Healthcare)||0), 0) / dataset.length,
  };

  const allArr = {
    hdi: dataset.map(d => d.hdi),
    lit: dataset.map(d => d.literacy),
    imr: dataset.map(d => d.infantMortality),
    pov: dataset.map(d => d.poverty),
    pc: dataset.map(d => d.gdp/d.population*100000),
    hc: dataset.map(d => Number(d.Healthcare)||0)
  };

  const radarData = [
    {
      subject: 'HDI Score',
      districtScore: normalize(indicators.HDI, allArr.hdi),
      avgScore: normalize(avg.hdi, allArr.hdi)
    },
    {
      subject: 'Literacy Rate',
      districtScore: normalize(indicators.literacyRate, allArr.lit),
      avgScore: normalize(avg.literacy, allArr.lit)
    },
    {
      subject: 'Infant Mortality',
      districtScore: normalize(indicators.infantMortality, allArr.imr, true),
      avgScore: normalize(avg.infantMortality, allArr.imr, true)
    },
    {
      subject: 'Poverty Rate',
      districtScore: normalize(indicators.povertyPercent, allArr.pov, true),
      avgScore: normalize(avg.poverty, allArr.pov, true)
    },
    {
      subject: 'Per Capita Income',
      districtScore: normalize(indicators.gdpPerCapita / indicators.population * 100000, allArr.pc),
      avgScore: normalize(avg.perCapita, allArr.pc)
    },
    {
      subject: 'Healthcare Allocation %',
      districtScore: normalize(district.allocation.Healthcare, allArr.hc),
      avgScore: normalize(avg.healthcare, allArr.hc)
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5">
      {/* Indicators Grid */}
      <div className="card">
        <h3 className="font-semibold text-text mb-4">District Indicators</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Human Development Index', value: indicators.HDI.toFixed(2), unit: '', color: indicators.HDI >= 0.7 ? '#16a34a' : indicators.HDI >= 0.6 ? '#d97706' : '#dc2626' },
            { label: 'Literacy Rate', value: Number(indicators.literacyRate).toFixed(2), unit: '%', color: indicators.literacyRate >= 80 ? '#16a34a' : indicators.literacyRate >= 70 ? '#d97706' : '#dc2626' },
            { label: 'Infant Mortality', value: Number(indicators.infantMortality).toFixed(2), unit: '/1000', color: indicators.infantMortality <= 25 ? '#16a34a' : indicators.infantMortality <= 35 ? '#d97706' : '#dc2626' },
            { label: 'Below Poverty Line', value: Number(indicators.povertyPercent).toFixed(2), unit: '%', color: indicators.povertyPercent <= 12 ? '#16a34a' : indicators.povertyPercent <= 20 ? '#d97706' : '#dc2626' },
            { label: 'Per Capita Income', value: `₹${(indicators.gdpPerCapita / 1000).toFixed(0)}K`, unit: '', color: indicators.gdpPerCapita >= 120000 ? '#16a34a' : indicators.gdpPerCapita >= 80000 ? '#d97706' : '#dc2626' },
            { label: 'Population', value: `${(indicators.population / 1000000).toFixed(2)}M`, unit: '', color: '#94a3b8' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-bg-elevated rounded-xl p-3 border border-border">
              <div className="text-xs text-text-subtle mb-1">{label}</div>
              <div className="text-xl font-bold" style={{ color }}>{value}{unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar Chart */}
      <div className="card">
        <h3 className="font-semibold text-text mb-1">District Performance vs State Average</h3>
        <p className="text-xs text-text-subtle mb-4">Normalized scores across key indicators (100 = best)</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#2d3f5e" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #2d3f5e', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#f1f5f9' }}
              itemStyle={{ color: '#94a3b8' }}
              formatter={(value) => value.toFixed(0)}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Radar
              name={district.name}
              dataKey="districtScore"
              stroke="#00D4B4"
              fill="#00D4B4"
              fillOpacity={0.4}
            />
            <Radar
              name="State Average"
              dataKey="avgScore"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
