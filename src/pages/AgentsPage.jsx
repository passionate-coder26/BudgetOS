import React from 'react';
import { Activity, Search, Bot } from 'lucide-react';
import DiagnosisAgent from '../components/agents/DiagnosisAgent';
import LeakageAgent from '../components/agents/LeakageAgent';
import { DISTRICTS } from '../data/seedData';

export default function AgentsPage({ district, triggerData, allDistricts }) {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text flex items-center gap-2">
          <Bot size={20} className="text-blue-400" />
          AI Agents
        </h2>
        <p className="text-text-subtle text-sm mt-0.5">
          Autonomous Claude-powered agents for budget diagnosis and leakage investigation
        </p>
      </div>

      {/* Model info badge */}
      <div className="flex items-center gap-2 bg-bg-elevated border border-border rounded-xl px-4 py-2.5 w-fit">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs text-text-muted">
          Model: <strong className="text-text">claude-sonnet-4-20250514</strong>
        </span>
        <span className="text-text-subtle">·</span>
        <span className="text-xs text-text-muted">Multi-turn reasoning · 3 steps per agent</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Budget Diagnosis Agent */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
              Budget Diagnosis Agent
            </h3>
          </div>
          <DiagnosisAgent district={district} allDistricts={allDistricts} />
        </div>

        {/* Leakage Investigation Agent */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Search size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
              Leakage Investigation Agent
            </h3>
          </div>
          <LeakageAgent triggerData={triggerData} district={district} />
        </div>
      </div>
    </div>
  );
}
