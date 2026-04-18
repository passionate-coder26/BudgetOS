import React from 'react';
import {
  LayoutDashboard, GitBranch, Bot, Sliders, ChevronDown, Zap
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline Tracker', icon: GitBranch },
  { id: 'agents', label: 'AI Agents', icon: Bot },
  { id: 'scenario', label: 'Scenario Planner', icon: Sliders },
];

export default function Sidebar({ currentPage, onNavigate, selectedDistrict, onDistrictChange, districts }) {
  return (
    <div className="flex flex-col h-full bg-bg-card border-r border-border w-64 flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 glow-blue">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-text text-lg leading-tight">BudgetOS</div>
            <div className="text-text-subtle text-xs">Budget Intelligence</div>
          </div>
        </div>
      </div>

      {/* District Selector */}
      <div className="p-4 border-b border-border">
        <label className="block text-xs text-text-subtle font-medium mb-2 uppercase tracking-wider">
          Active District
        </label>
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2.5 text-text text-sm 
                       appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 
                       focus:border-primary transition-all"
          >
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-xs text-text-subtle font-medium uppercase tracking-wider mb-3 px-1">
          Navigation
        </div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`nav-link w-full text-left ${currentPage === id ? 'active' : ''}`}
          >
            <Icon size={16} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-text-subtle text-center">
          Powered by Commit || Cry<br />
          <span className="text-text-subtle/60">Maharashtra Budget Analytics</span>
        </div>
      </div>
    </div>
  );
}
