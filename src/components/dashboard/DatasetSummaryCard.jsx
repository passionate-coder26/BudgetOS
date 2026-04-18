import React from 'react';

/**
 * Small card shown on Dashboard summarising the loaded dataset.
 * @param {{ dataset: Array, onChangeDataset: () => void }} props
 */
export default function DatasetSummaryCard({ dataset, onChangeDataset }) {
  if (!dataset || dataset.length === 0) return null;

  const sorted  = [...dataset].sort((a, b) => b.hdi - a.hdi);
  const best    = sorted[0];
  const worst   = sorted[sorted.length - 1];
  const avgPov  = (dataset.reduce((s, d) => s + (d.poverty || 0), 0) / dataset.length).toFixed(1);

  return (
    <div className="card flex flex-wrap items-center gap-4 py-3 px-4 text-xs">
      <span className="text-text-subtle font-semibold uppercase tracking-wider">Dataset</span>
      <span className="text-text-muted">
        <span className="font-bold text-text">{dataset.length}</span> districts loaded
      </span>
      <span className="text-text-muted">
        Best HDI: <span className="font-bold text-success">{best.district}</span>
        <span className="text-text-subtle"> ({best.hdi.toFixed(2)})</span>
      </span>
      <span className="text-text-muted">
        Worst HDI: <span className="font-bold text-danger">{worst.district}</span>
        <span className="text-text-subtle"> ({worst.hdi.toFixed(2)})</span>
      </span>
      <span className="text-text-muted">
        Avg poverty: <span className="font-bold text-warning">{avgPov}%</span>
      </span>
      {onChangeDataset && (
        <button
          onClick={onChangeDataset}
          className="ml-auto text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
        >
          Change Dataset
        </button>
      )}
    </div>
  );
}
