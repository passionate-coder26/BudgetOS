import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { SECTOR_COLORS, LEAKAGE_REASONS, isLeaking } from '../data/seedData';

// Extended color palette for uploaded dataset sectors
const EXTENDED_COLORS = {
  ...SECTOR_COLORS,
  Healthcare:      '#38bdf8',
  Education:       '#a78bfa',
  Agriculture:     '#34d399',
  Infrastructure:  '#fbbf24',
  'Social Welfare':'#f87171',
  Defense:         '#f97316',
  Technology:      '#60a5fa',
  Welfare:         '#f472b6',
  Environment:     '#4ade80',
};

function getSectorColor(sector) {
  return EXTENDED_COLORS[sector] || '#94a3b8';
}

const PIPELINE_LEVELS = ['district', 'block', 'gramPanchayat', 'beneficiary'];
const LEVEL_LABELS = {
  district:      'District HQ',
  block:         'Block Office',
  gramPanchayat: 'Gram Panchayat',
  beneficiary:   'End Beneficiary',
};

function PipelineNode({ level, data, sector, onClick }) {
  const leaked = isLeaking(data.received);
  const color = getSectorColor(sector);
  const leakReason = data.leakReason ? LEAKAGE_REASONS[data.leakReason] : null;

  return (
    <div
      onClick={() => leaked && onClick({ level, sector, data })}
      className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 
        ${leaked
          ? 'border-red-500/60 bg-red-900/10 cursor-pointer hover:bg-red-900/20 glow-red'
          : 'border-border bg-bg-elevated cursor-default'
        }`}
      style={{ minWidth: '110px' }}
    >
      {/* Status Icon */}
      <div className="absolute -top-2 -right-2">
        {leaked ? (
          <AlertTriangle size={14} className="text-danger" />
        ) : (
          <CheckCircle size={14} className="text-success" />
        )}
      </div>

      {/* Received % */}
      <div
        className="text-lg font-bold mb-0.5"
        style={{ color: leaked ? '#dc2626' : color }}
      >
        {data.received}%
      </div>
      <div className="text-xs text-text-subtle text-center">received</div>
      <div className="text-xs font-semibold text-text mt-1">₹{data.amount}L</div>

      {/* Leak Reason */}
      {leakReason && (
        <div
          className="text-xs mt-2 px-1.5 py-0.5 rounded-full font-medium text-center"
          style={{ backgroundColor: `${leakReason.color}20`, color: leakReason.color }}
        >
          {leakReason.label}
        </div>
      )}
    </div>
  );
}

function SectorPipeline({ sector, pipeline, onNodeClick }) {
  const color = getSectorColor(sector);

  return (
    <div className="card mb-4">
      {/* Sector Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-semibold text-text text-sm">{sector}</span>
        
        {/* Leakage summary */}
        {(() => {
          const endReceived = pipeline.beneficiary.received;
          const leaked = 100 - endReceived;
          return (
            <span
              className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                leaked > 30 ? 'bg-red-500/20 text-red-300' :
                leaked > 15 ? 'bg-amber-500/20 text-amber-300' :
                'bg-green-500/20 text-green-300'
              }`}
            >
              {leaked.toFixed(0)}% leakage
            </span>
          );
        })()}
      </div>

      {/* Nodes Row */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {PIPELINE_LEVELS.map((level, idx) => (
          <React.Fragment key={level}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="text-xs text-text-subtle mb-1 text-center whitespace-nowrap">
                {LEVEL_LABELS[level]}
              </div>
              <PipelineNode
                level={level}
                data={pipeline[level]}
                sector={sector}
                onClick={onNodeClick}
              />
            </div>
            {idx < PIPELINE_LEVELS.length - 1 && (
              <ChevronRight
                size={16}
                className="text-border flex-shrink-0 mt-5"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function PipelineTrackerPage({ district, onTriggerLeakageAgent }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (info) => {
    setSelectedNode(info);
    onTriggerLeakageAgent(info);
  };

  // Derive sectors dynamically from district.pipeline keys (works with any dataset)
  const pipelineSectors = Object.keys(district.pipeline || {});

  // Count red nodes
  const redNodeCount = pipelineSectors.reduce((count, sector) => {
    return count + PIPELINE_LEVELS.filter(level =>
      level !== 'district' && isLeaking(district.pipeline[sector][level].received)
    ).length;
  }, 0);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">Pipeline Fund Flow Tracker</h2>
          <p className="text-text-subtle text-sm mt-0.5">
            Track fund flow from District HQ to End Beneficiary — click red nodes to investigate leakage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            <span className="text-text-muted">{redNodeCount} leakage points</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-text-muted">Normal flow</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="card py-3">
        <div className="flex flex-wrap gap-4 text-xs text-text-muted">
          <span className="font-semibold text-text-subtle">Leakage Types:</span>
          {Object.entries(LEAKAGE_REASONS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: val.color }} />
              <span>{val.label}</span>
            </div>
          ))}
          <span className="ml-auto text-danger animate-pulse font-medium">
            🔴 Click red nodes to investigate
          </span>
        </div>
      </div>

      {/* Pipelines per sector */}
      {pipelineSectors.map(sector => (
        <SectorPipeline
          key={sector}
          sector={sector}
          pipeline={district.pipeline[sector]}
          onNodeClick={handleNodeClick}
        />
      ))}
    </div>
  );
}
