import React, { useState } from 'react';
import { Play, CheckCircle, AlertCircle, Loader2, Activity, BarChart3, Zap } from 'lucide-react';
import { callClaude, parseJSON } from '../../utils/claudeApi';
import { SECTORS } from '../../data/seedData';

const STEPS = [
  'Scanning district indicators...',
  'Tracing fund flow pipeline...',
  'Analysing history & generating interventions...',
];

function HealthRing({ score }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;
  const color = score >= 75 ? '#16a34a' : score >= 55 ? '#d97706' : '#dc2626';

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#2d3f5e" strokeWidth="10" />
        <circle
          cx="72" cy="72" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-bold" style={{ color }}>{score}</div>
        <div className="text-xs text-text-subtle">/ 100</div>
      </div>
    </div>
  );
}

function StepProgress({ currentStep, totalSteps, steps }) {
  return (
    <div className="space-y-2 mb-4">
      {steps.map((label, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
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

export default function DiagnosisAgent({ district, allDistricts }) {
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function runDiagnosis() {
    setStatus('running');
    setCurrentStep(0);
    setResult(null);
    setError(null);

    const messages = [];
    let step1Data = null;
    let step2Data = null;

    try {
      // === STEP 1: Indicator Scan ===
      setCurrentStep(0);
      const step1Prompt = `You are analyzing budget data for ${district.name} district.

District Indicators:
${JSON.stringify(district.indicators, null, 2)}

Current Sector Allocations (%):
${JSON.stringify(district.allocation, null, 2)}

Sector Health Scores:
${JSON.stringify(district.sectorHealth, null, 2)}

Task: Identify the top 3 critical problem sectors, score each sector's underfunding risk from 0-10.
Return ONLY valid JSON (no markdown):
{"criticalSectors":[{"sector":"string","riskScore":number,"reason":"string"}]}`;

      messages.push({ role: 'user', content: step1Prompt });
      const reply1 = await callClaude(messages);
      step1Data = parseJSON(reply1);
      messages.push({ role: 'assistant', content: reply1 });

      // === STEP 2: Pipeline Trace ===
      setCurrentStep(1);
      const step2Prompt = `Now analyze the fund flow pipeline for ${district.name}.

Pipeline Data (% received at each level):
${JSON.stringify(district.pipeline, null, 2)}

Critical sectors flagged in step 1: ${step1Data?.criticalSectors?.map(s => s.sector).join(', ') || SECTORS.join(', ')}

Task: Find where money stops for each flagged sector. Classify the cause.
Return ONLY valid JSON:
{"leakagePoints":[{"level":"string","sector":"string","cause":"delay|tied_grant|capacity_gap|diversion","amountStuck":number,"description":"string"}]}`;

      messages.push({ role: 'user', content: step2Prompt });
      const reply2 = await callClaude(messages);
      step2Data = parseJSON(reply2);
      messages.push({ role: 'assistant', content: reply2 });

      // === STEP 3+4: History + Full Report ===
      setCurrentStep(2);
      const step3Prompt = `Final synthesis for ${district.name}.

6-Year Spend History:
${JSON.stringify(district.history, null, 2)}

Recommended vs Current Allocations:
Current: ${JSON.stringify(district.allocation)}
Recommended: ${JSON.stringify(district.recommendedAllocation)}

Task: Synthesise ALL findings into a complete diagnosis. Determine if leakage is chronic or new.
Return ONLY valid JSON:
{
  "criticalSectors": [{"sector":"string","riskScore":number,"reason":"string"}],
  "leakagePoints": [{"level":"string","sector":"string","cause":"string","amountStuck":number,"description":"string"}],
  "isChronicProblem": boolean,
  "worstYear": "string",
  "interventions": [{"what":"string","why":"string","level":"string","expectedImpact":"string"}],
  "overallHealthScore": number,
  "summary": "string (2 sentences max)"
}`;

      messages.push({ role: 'user', content: step3Prompt });
      const reply3 = await callClaude(messages);
      const step3Data = parseJSON(reply3);

      if (step3Data) {
        setResult(step3Data);
        setStatus('done');
      } else {
        // Fallback: combine step 1 + 2
        setResult({
          criticalSectors: step1Data?.criticalSectors || [],
          leakagePoints: step2Data?.leakagePoints || [],
          isChronicProblem: true,
          worstYear: '2022',
          interventions: [],
          overallHealthScore: district.healthScore,
          summary: `Analysis completed for ${district.name}. Multiple leakage points detected across sectors.`,
        });
        setStatus('done');
      }

    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="space-y-4">
      {/* Agent Card Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Activity size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-text">Budget Diagnosis Agent</h3>
              <p className="text-xs text-text-subtle mt-0.5">3-step multi-turn Claude analysis</p>
            </div>
          </div>
          <div className={`badge ${
            status === 'idle' ? 'badge-primary' :
            status === 'running' ? 'badge-warning' :
            status === 'done' ? 'badge-success' : 'badge-danger'
          }`}>
            {status === 'idle' ? 'Ready' : status === 'running' ? 'Running...' : status === 'done' ? 'Complete' : 'Error'}
          </div>
        </div>

        <p className="text-sm text-text-muted mb-4">
          Performs a comprehensive 3-step budget analysis: scans district indicators, traces pipeline leakage, and generates prioritised interventions.
        </p>

        {status === 'running' && (
          <StepProgress currentStep={currentStep} totalSteps={3} steps={STEPS} />
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-3">
            <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <button
          onClick={runDiagnosis}
          disabled={status === 'running'}
          className="btn-primary w-full justify-center"
        >
          {status === 'running' ? (
            <><Loader2 size={16} className="animate-spin" /> Running Diagnosis...</>
          ) : (
            <><Play size={16} /> Run Full Diagnosis</>
          )}
        </button>
      </div>

      {/* Results */}
      {status === 'done' && result && (
        <div className="space-y-4 animate-slide-up">
          {/* Health Score */}
          <div className="card flex items-center gap-6">
            <HealthRing score={result.overallHealthScore || district.healthScore} />
            <div className="flex-1">
              <div className="text-xs text-text-subtle font-semibold uppercase tracking-wider mb-1">
                Overall Budget Health
              </div>
              <div className="font-bold text-text text-lg mb-2">
                {result.overallHealthScore >= 75 ? 'Healthy' : result.overallHealthScore >= 55 ? 'At Risk' : 'Critical'}
              </div>
              {result.summary && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-sm text-text-muted leading-relaxed">
                  {result.summary}
                </div>
              )}
              <div className="flex gap-3 mt-3 text-xs">
                <span className={`badge ${result.isChronicProblem ? 'badge-danger' : 'badge-warning'}`}>
                  {result.isChronicProblem ? '⚠ Chronic Issue' : '↗ Emerging Issue'}
                </span>
                {result.worstYear && (
                  <span className="badge badge-primary">Worst Year: {result.worstYear}</span>
                )}
              </div>
            </div>
          </div>

          {/* Critical Sectors */}
          {result.criticalSectors?.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-text mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-400" />
                Critical Sectors (Risk Scores)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.criticalSectors.map((cs, i) => (
                  <div key={i} className="bg-bg-elevated rounded-xl p-3 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-text text-sm">{cs.sector}</span>
                      <span className={`text-sm font-bold ${
                        cs.riskScore >= 8 ? 'text-danger' : cs.riskScore >= 6 ? 'text-warning' : 'text-success'
                      }`}>{cs.riskScore}/10</span>
                    </div>
                    <div className="h-1.5 bg-bg rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cs.riskScore * 10}%`,
                          backgroundColor: cs.riskScore >= 8 ? '#dc2626' : cs.riskScore >= 6 ? '#d97706' : '#16a34a'
                        }}
                      />
                    </div>
                    <p className="text-xs text-text-subtle">{cs.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leakage Points Table */}
          {result.leakagePoints?.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-text mb-3">Leakage Points Detected</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-subtle text-xs uppercase tracking-wider">
                      <th className="text-left pb-2 pr-4">Sector</th>
                      <th className="text-left pb-2 pr-4">Level</th>
                      <th className="text-left pb-2 pr-4">Cause</th>
                      <th className="text-right pb-2">₹ Stuck (L)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.leakagePoints.map((lp, i) => (
                      <tr key={i} className="hover:bg-bg-elevated/50">
                        <td className="py-2 pr-4 text-text font-medium">{lp.sector}</td>
                        <td className="py-2 pr-4 text-text-muted capitalize">{lp.level}</td>
                        <td className="py-2 pr-4">
                          <span className={`badge text-xs ${
                            lp.cause === 'diversion' ? 'badge-danger' :
                            lp.cause === 'delay' ? 'badge-warning' : 'badge-primary'
                          }`}>{lp.cause}</span>
                        </td>
                        <td className="py-2 text-right font-semibold text-danger">₹{lp.amountStuck}L</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Interventions */}
          {result.interventions?.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-text mb-3 flex items-center gap-2">
                <Zap size={16} className="text-warning" />
                Prioritised Interventions
              </h4>
              <div className="space-y-3">
                {result.interventions.map((iv, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-bg-elevated rounded-xl border border-border">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-400">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text text-sm">{iv.what}</span>
                        {iv.level && <span className="badge badge-primary text-xs">{iv.level}</span>}
                      </div>
                      <p className="text-xs text-text-subtle">{iv.why}</p>
                      {iv.expectedImpact && (
                        <p className="text-xs text-success mt-1">↗ {iv.expectedImpact}</p>
                      )}
                    </div>
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
