import React, { useState } from 'react';
import { Sliders, Loader2, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { callClaude, parseJSON } from '../../utils/claudeApi';
import { SECTOR_COLORS, SECTORS } from '../../data/seedData';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const STEPS = [
  'Decomposing your goal...',
  'Simulating 3 reallocation scenarios...',
  'Selecting optimal scenario...',
];

function StepProgress({ currentStep, steps }) {
  return (
    <div className="space-y-2 mb-4">
      {steps.map((label, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              done ? 'bg-success' : active ? 'bg-primary animate-pulse' : 'bg-bg-elevated border border-border'
            }`}>
              {done ? <CheckCircle size={12} className="text-white" /> :
               active ? <Loader2 size={12} className="text-white animate-spin" /> :
               <span className="text-xs text-text-subtle">{idx + 1}</span>}
            </div>
            <span className={`text-sm ${done ? 'text-success' : active ? 'text-text' : 'text-text-subtle'}`}>
              Step {idx + 1}/3 — {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AllocationDonut({ allocation }) {
  const data = Object.entries(allocation).map(([sector, pct]) => ({
    name: sector,
    value: pct,
    color: SECTOR_COLORS[sector] || '#94a3b8',
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #2d3f5e', borderRadius: '12px', fontSize: '12px' }}
          formatter={(v) => [`${v}%`, '']}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
          formatter={(value) => value.split(' ')[0]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ScenarioCard({ scenario, index, isRecommended, currentAllocation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`card border-2 transition-all duration-300 ${
        isRecommended
          ? 'border-success/60 bg-green-900/10 relative'
          : 'border-border hover:border-border/80'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="badge badge-success text-xs px-3 py-1">✓ Recommended</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 mt-1">
        <h4 className="font-bold text-text">Scenario {index + 1}</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-subtle">Feasibility</span>
          <span
            className="text-sm font-bold"
            style={{
              color: (scenario.feasibilityScore || 0) >= 7 ? '#16a34a' :
                     (scenario.feasibilityScore || 0) >= 5 ? '#d97706' : '#dc2626'
            }}
          >
            {scenario.feasibilityScore || '—'}/10
          </span>
        </div>
      </div>

      {/* Projected Outcome */}
      {scenario.projectedOutcome && (
        <p className="text-sm text-text-muted bg-bg/40 rounded-lg p-2.5 mb-3 leading-relaxed">
          {scenario.projectedOutcome}
        </p>
      )}

      {/* Sector Changes */}
      {scenario.sectorChanges && scenario.sectorChanges.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {scenario.sectorChanges.slice(0, 5).map((change, i) => {
            const delta = typeof change.delta === 'number' ? change.delta :
              (typeof change.newAllocation === 'number' && currentAllocation?.[change.sector]
                ? change.newAllocation - currentAllocation[change.sector]
                : null);
            return (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-text-muted">{change.sector}</span>
                {delta !== null && (
                  <div className={`flex items-center gap-1 font-semibold ${delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : 'text-text-subtle'}`}>
                    {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : null}
                    {delta > 0 ? '+' : ''}{delta}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-text-subtle hover:text-text transition-colors"
      >
        {expanded ? '▲ Less' : '▼ More details'}
      </button>

      {expanded && scenario.newAllocation && (
        <div className="mt-3 pt-3 border-t border-border animate-fade-in">
          <AllocationDonut allocation={scenario.newAllocation} />
        </div>
      )}
    </div>
  );
}

export default function ScenarioAgent({ district, goal, onGoalChange }) {
  const [status, setStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function runScenario() {
    if (!goal?.trim()) return;
    setStatus('running');
    setCurrentStep(0);
    setResult(null);
    setError(null);

    const messages = [];
    let step1Data = null;
    let step2Data = null;

    try {
      // === STEP 1: Goal Decomposition ===
      setCurrentStep(0);
      const step1Prompt = `You are a government budget scenario planner for Indian districts.

User Goal: "${goal}"

District: ${district.name}
Current Sector Allocations (%): ${JSON.stringify(district.allocation)}
District Indicators: ${JSON.stringify(district.indicators)}

National benchmarks for reference:
- Infant mortality target: < 20 per 1000
- Literacy target: > 85%
- HDI target: > 0.7
- Poverty target: < 10%

Task: Parse which outcome metric this goal targets, identify relevant sectors, find gaps.
Return ONLY valid JSON:
{"targetMetric":"string","relevantSectors":["string"],"currentGaps":[{"metric":"string","current":number,"benchmark":number,"gap":"string"}]}`;

      messages.push({ role: 'user', content: step1Prompt });
      const reply1 = await callClaude(messages);
      step1Data = parseJSON(reply1);
      messages.push({ role: 'assistant', content: reply1 });

      // === STEP 2: Multi-Scenario Generation ===
      setCurrentStep(1);
      const step2Prompt = `Now generate 3 distinct budget reallocation scenarios to achieve: "${goal}"

Current allocation: ${JSON.stringify(district.allocation)}
Relevant sectors from analysis: ${JSON.stringify(step1Data?.relevantSectors)}
Current gaps: ${JSON.stringify(step1Data?.currentGaps)}

Total budget must remain 100%. Each scenario should be meaningfully different.
Return ONLY valid JSON:
{"scenarios":[{"id":1,"sectorChanges":[{"sector":"string","delta":number,"newAllocation":number}],"projectedOutcome":"string","feasibilityScore":number}]}`;

      messages.push({ role: 'user', content: step2Prompt });
      const reply2 = await callClaude(messages);
      step2Data = parseJSON(reply2);
      messages.push({ role: 'assistant', content: reply2 });

      // === STEP 3: Optimal Selection ===
      setCurrentStep(2);
      const step3Prompt = `Select the best scenario and explain the tradeoffs.

Goal: "${goal}"
Scenarios generated: ${JSON.stringify(step2Data?.scenarios)}
Current allocation: ${JSON.stringify(district.allocation)}

Choose which scenario best achieves the goal with realistic feasibility. Explain what each sector gains/loses.
Return ONLY valid JSON:
{
  "targetMetric": "string",
  "scenarios": [same 3 scenarios with any refinements],
  "recommendedScenario": 0,
  "newAllocation": {"Healthcare":number,"Education":number,"Agriculture":number,"Infrastructure":number,"Social Welfare":number},
  "tradeoffs": [{"sector":"string","change":number,"impact":"positive|negative|neutral","reason":"string"}],
  "projectedOutcome": "string (2 sentences)"
}`;

      messages.push({ role: 'user', content: step3Prompt });
      const reply3 = await callClaude(messages);
      const step3Data = parseJSON(reply3);

      if (step3Data) {
        // Merge scenarios from step2 if step3 didn't include them
        if ((!step3Data.scenarios || step3Data.scenarios.length === 0) && step2Data?.scenarios) {
          step3Data.scenarios = step2Data.scenarios;
        }
        setResult(step3Data);
      } else if (step2Data) {
        setResult({ scenarios: step2Data.scenarios, recommendedScenario: 0 });
      }
      setStatus('done');

    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Sliders size={20} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-text">Scenario Planning Agent</h3>
            <p className="text-xs text-text-subtle mt-0.5">3-step multi-turn Claude scenario generation</p>
          </div>
          <div className={`badge ${
            status === 'idle' ? 'badge-primary' :
            status === 'running' ? 'badge-warning' :
            status === 'done' ? 'badge-success' : 'badge-danger'
          }`}>
            {status === 'idle' ? 'Ready' : status === 'running' ? 'Running...' : status === 'done' ? 'Complete' : 'Error'}
          </div>
        </div>

        {/* Goal Input */}
        <div className="mb-4">
          <label className="block text-xs text-text-subtle font-medium mb-1.5 uppercase tracking-wider">
            Planning Goal
          </label>
          <textarea
            value={goal}
            onChange={(e) => onGoalChange(e.target.value)}
            placeholder={`e.g. Reduce infant mortality in ${district.name} by 30% within 2 years`}
            rows={3}
            className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-text text-sm 
                       resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                       placeholder:text-text-subtle transition-all"
          />
        </div>

        {status === 'running' && <StepProgress currentStep={currentStep} steps={STEPS} />}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-xl mb-3">
            <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <button
          onClick={runScenario}
          disabled={!goal?.trim() || status === 'running'}
          className="btn-primary w-full justify-center"
          style={{ backgroundColor: '#7c3aed' }}
        >
          {status === 'running' ? (
            <><Loader2 size={16} className="animate-spin" /> Planning Scenarios...</>
          ) : (
            <><Sliders size={16} /> Run Scenario Planning</>
          )}
        </button>
      </div>

      {/* Results */}
      {status === 'done' && result && (
        <div className="space-y-4 animate-slide-up">
          {/* Target metric */}
          {result.targetMetric && (
            <div className="flex items-center gap-3 card py-3">
              <div className="w-2 h-8 rounded-full bg-purple-500" />
              <div>
                <div className="text-xs text-text-subtle">Goal Target</div>
                <div className="font-semibold text-text">{result.targetMetric}</div>
              </div>
              {result.projectedOutcome && (
                <p className="ml-4 text-sm text-text-muted flex-1">{result.projectedOutcome}</p>
              )}
            </div>
          )}

          {/* 3 Scenario Cards */}
          {result.scenarios?.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
                Generated Scenarios
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {result.scenarios.slice(0, 3).map((scenario, idx) => (
                  <ScenarioCard
                    key={idx}
                    scenario={scenario}
                    index={idx}
                    isRecommended={idx === (result.recommendedScenario ?? 0)}
                    currentAllocation={district.allocation}
                  />
                ))}
              </div>
            </>
          )}

          {/* Recommended Allocation Donut */}
          {result.newAllocation && (
            <div className="card">
              <h4 className="font-semibold text-text mb-1">Recommended New Allocation</h4>
              <p className="text-xs text-text-subtle mb-3">
                Scenario {(result.recommendedScenario ?? 0) + 1} — optimised for chosen goal
              </p>
              <AllocationDonut allocation={result.newAllocation} />
            </div>
          )}

          {/* Tradeoffs Table */}
          {result.tradeoffs?.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-text mb-3">Tradeoff Analysis</h4>
              <div className="space-y-2">
                {result.tradeoffs.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-text-muted w-32 flex-shrink-0">{t.sector}</span>
                    <span
                      className={`text-sm font-bold w-14 text-right flex-shrink-0 ${
                        t.change > 0 ? 'text-success' : t.change < 0 ? 'text-danger' : 'text-text-subtle'
                      }`}
                    >
                      {t.change > 0 ? '+' : ''}{t.change}%
                    </span>
                    <span className={`badge text-xs flex-shrink-0 ${
                      t.impact === 'positive' ? 'badge-success' :
                      t.impact === 'negative' ? 'badge-danger' : 'badge-primary'
                    }`}>{t.impact}</span>
                    <span className="text-xs text-text-subtle flex-1">{t.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
