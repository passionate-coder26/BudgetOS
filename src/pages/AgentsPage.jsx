import React from 'react';
import { Activity, Search, Bot, Sliders, ArrowRight } from 'lucide-react';
import DiagnosisAgent from '../components/agents/DiagnosisAgent';
import LeakageAgent from '../components/agents/LeakageAgent';
import { DISTRICTS } from '../data/seedData';

function ScenarioAgentCard({ onNavigate }) {
  return (
    <div className="card border border-purple-500/20 hover:border-purple-500/40 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Sliders size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-text">Scenario Planning Agent</h3>
            <p className="text-xs text-text-subtle mt-0.5">3-step multi-turn Gemini scenario generation</p>
          </div>
        </div>
        <div className="badge badge-primary">Ready</div>
      </div>

      <p className="text-sm text-text-muted mb-4">
        Type a natural language goal (e.g. "Reduce infant mortality by 40%") and Claude simulates 3
        budget reallocation scenarios with feasibility scores and tradeoff analysis.
      </p>

      {/* Steps preview */}
      <div className="space-y-1.5 mb-4">
        {[
          'Step 1 — Goal Decomposition: parse target metric & gaps',
          'Step 2 — Scenario Generation: simulate 3 reallocation plans',
          'Step 3 — Optimal Selection: pick best scenario + tradeoffs',
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-text-subtle">
            <div className="w-4 h-4 rounded-full bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0">
              <span className="text-[10px]">{i + 1}</span>
            </div>
            {step}
          </div>
        ))}
      </div>

      <button
        onClick={() => onNavigate('scenario')}
        className="btn-primary w-full justify-center"
        style={{ backgroundColor: '#7c3aed' }}
      >
        <Sliders size={16} />
        Open Scenario Planner
        <ArrowRight size={14} className="ml-auto" />
      </button>
    </div>
  );
}

export default function AgentsPage({ district, triggerData, allDistricts, onNavigate }) {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
          Three autonomous Gemini-powered agents for budget diagnosis, leakage investigation, and scenario planning
        </p>
      </div>

      {/* Model info badge */}
      <div className="flex items-center gap-2 bg-bg-elevated border border-border rounded-xl px-4 py-2.5 w-fit">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Model: <strong className="text-text">gemini-1.5-pro</strong>
        <span className="text-text-subtle">·</span>
        <span className="text-xs text-text-muted">Multi-turn reasoning · 3 API calls per agent</span>
      </div>

      {/* Top row: Diagnosis + Leakage */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Budget Diagnosis Agent */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
              Agent 1 — Budget Diagnosis
            </h3>
          </div>
          <DiagnosisAgent district={district} allDistricts={allDistricts} />
        </div>

        {/* Leakage Investigation Agent */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Search size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
              Agent 3 — Leakage Investigation
            </h3>
          </div>
          <LeakageAgent triggerData={triggerData} district={district} />
        </div>
      </div>

      {/* Bottom: Scenario Planning Agent */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sliders size={16} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
            Agent 2 — Scenario Planning
          </h3>
        </div>
        <ScenarioAgentCard onNavigate={onNavigate} />
      </div>
    </div>
  );
}
