import React, { useState, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import PipelineTrackerPage from './pages/PipelineTrackerPage';
import AgentsPage from './pages/AgentsPage';
import ScenarioPlannerPage from './pages/ScenarioPlannerPage';
import { DISTRICTS, getDistrict } from './data/seedData';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedDistrictId, setSelectedDistrictId] = useState('aurangabad');
  const [leakageTrigger, setLeakageTrigger] = useState(null);

  const district = getDistrict(selectedDistrictId);

  // Handle leakage node click from pipeline — navigate to agents page
  const handleLeakageTrigger = useCallback((info) => {
    setLeakageTrigger(info);
    setCurrentPage('agents');
  }, []);

  // Handle district change — reset leakage trigger
  const handleDistrictChange = useCallback((id) => {
    setSelectedDistrictId(id);
    setLeakageTrigger(null);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard district={district} />;
      case 'pipeline':
        return (
          <PipelineTrackerPage
            district={district}
            onTriggerLeakageAgent={handleLeakageTrigger}
          />
        );
      case 'agents':
        return (
          <AgentsPage
            district={district}
            triggerData={leakageTrigger}
            allDistricts={DISTRICTS}
            onNavigate={setCurrentPage}
          />
        );
      case 'scenario':
        return <ScenarioPlannerPage district={district} />;
      default:
        return <Dashboard district={district} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        selectedDistrict={selectedDistrictId}
        onDistrictChange={handleDistrictChange}
        districts={DISTRICTS}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar district={district} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
