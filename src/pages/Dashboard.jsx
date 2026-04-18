import React from 'react';
import SectorCard from '../components/dashboard/SectorCard';
import AllocationChart from '../components/dashboard/AllocationChart';
import IndicatorsPanel from '../components/dashboard/IndicatorsPanel';
import { SECTORS } from '../data/seedData';

export default function Dashboard({ district }) {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text">Budget Dashboard</h2>
        <p className="text-text-subtle text-sm mt-0.5">
          Overview of budget allocations and district health indicators
        </p>
      </div>

      {/* Sector Cards */}
      <div>
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Sector Health
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {SECTORS.map(sector => (
            <SectorCard
              key={sector}
              sector={sector}
              allocation={district.allocation[sector]}
              recommended={district.recommendedAllocation[sector]}
              health={district.sectorHealth[sector]}
            />
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <AllocationChart
          allocation={district.allocation}
          recommended={district.recommendedAllocation}
        />
        <IndicatorsPanel district={district} />
      </div>
    </div>
  );
}
