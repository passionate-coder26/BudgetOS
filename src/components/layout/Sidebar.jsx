import React, { useState } from 'react';
import {
  LayoutDashboard, GitBranch, Bot, Sliders, ChevronDown, Zap, Menu, X
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline Tracker', icon: GitBranch },
  { id: 'agents', label: 'AI Agents', icon: Bot },
  { id: 'scenario', label: 'Scenario Planner', icon: Sliders },
];

export default function Sidebar({ currentPage, onNavigate, selectedDistrict, onDistrictChange, districts }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 glow-blue">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-text text-lg leading-tight">BudgetOS</div>
            <div className="text-text-subtle text-xs">Budget Intelligence</div>
          </div>
        </div>
        {/* Mobile close */}
        <button
          className="md:hidden text-text-subtle hover:text-text"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
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
            onClick={() => handleNav(id)}
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

  return (
    <>
      {/* Mobile hamburger button — shown in TopBar area via absolute positioning */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-lg bg-bg-card border border-border 
                   flex items-center justify-center text-text-subtle hover:text-text transition-all"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col h-full bg-bg-card border-r border-border w-64 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar (slide-in) */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-bg-card border-r border-border z-50 
                    transform transition-transform duration-300 flex flex-col
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </div>
    </>
  );
}
