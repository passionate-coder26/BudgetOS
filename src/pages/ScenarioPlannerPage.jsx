import React, { useState } from 'react';
import { Sliders, Lightbulb } from 'lucide-react';
import ScenarioAgent from '../components/agents/ScenarioAgent';

const EXAMPLE_GOALS = [
  'Reduce infant mortality in this district by 40%',
  'Improve literacy rate to above 85% within 3 years',
  'Eliminate extreme poverty by reallocating social welfare funds',
  'Improve agriculture productivity and farmer incomes',
  'Boost infrastructure to attract industrial investment',
];

export default function ScenarioPlannerPage({ district, dataset, avgHdi }) {
  const [goal, setGoal] = useState('');

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text flex items-center gap-2">
          <Sliders size={20} className="text-purple-400" />
          Scenario Planner
        </h2>
        <p className="text-text-subtle text-sm mt-0.5">
          Type a natural language goal — Gemini will generate and compare 3 budget reallocation scenarios
        </p>
      </div>

      {/* Example Goals */}
      <div className="card py-3">
        <div className="flex items-start gap-2">
          <Lightbulb size={14} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-text-subtle font-medium">Example goals — click to use:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {EXAMPLE_GOALS.map((eg, i) => (
                <button
                  key={i}
                  onClick={() => setGoal(eg.replace('this district', district.name))}
                  className="text-xs px-3 py-1 rounded-full bg-bg-elevated border border-border 
                             text-text-muted hover:text-text hover:border-primary/50 transition-all cursor-pointer"
                >
                  {eg.replace('this district', district.name)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Agent */}
      <ScenarioAgent
        district={district}
        goal={goal}
        onGoalChange={setGoal}
        dataset={dataset}
        avgHdi={avgHdi}
      />
    </div>
  );
}
