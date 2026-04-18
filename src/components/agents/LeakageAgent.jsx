import React, { useState } from 'react';
import { Search, Loader2, CheckCircle, AlertCircle, MapPin, ArrowRight } from 'lucide-react';
import { callGemini, parseJSON } from '../../utils/geminiApi';
import { LEAKAGE_REASONS } from '../../data/seedData';

const STEPS = [
  'Localising the leak source...',
  'Comparing peer districts...',
  'Prescribing targeted fix...',
];

const URGENCY_STYLES = {
  Low: { bg: 'bg-green-900/20 border-green-500/30', text: 'text-green-300', badge: 'badge-success' },
  Medium: { bg: 'bg-amber-900/20 border-amber-500/30', text: 'text-amber-300', badge: 'badge-warning' },
  High: { bg: 'bg-orange-900/20 border-orange-500/30', text: 'text-orange-300', badge: 'bg-orange-500/20 text-orange-300' },
  Critical: { bg: 'bg-red-900/20 border-red-500/30', text: 'text-red-300', badge: 'badge-danger' },
};

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

export default function LeakageAgent({ triggerData, district, peers = [] }) {
  const [status, setStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const hasData = !!triggerData;

  async function runInvestigation() {
    if (!triggerData) return;
    setStatus('running');
    setCurrentStep(0);
    setResult(null);
    setError(null);

    const { level, sector, data } = triggerData;
    const messages = [];
    let step1Data = null;
    let step2Data = null;

    try {
      // === STEP 1: Leak Localisation ===
      setCurrentStep(0);
      const leakReason = data.leakReason ? LEAKAGE_REASONS[data.leakReason] : null;
      const amountLost = 100 - data.received;

      const step1Prompt = `Investigate a fund leakage in ${district.name} district.

Leakage Location:
- Level: ${level} (${level === 'block' ? 'Block Office' : level === 'gramPanchayat' ? 'Gram Panchayat' : 'End Beneficiary'})
- Sector: ${sector}
- Funds allocated to this level: ₹${data.amount} Lakhs
- Funds actually received: ${data.received}% (₹${Math.round(data.amount * data.received / 100)} Lakhs)
- Amount leaked: ${amountLost}% (₹${Math.round(data.amount * amountLost / 100)} Lakhs)
- Tag: ${leakReason?.label || 'Unknown'}

Task: Diagnose the leak — how much is stuck, what type of block, likely duration.
Return ONLY valid JSON:
{"leakType":"string","amountStuck":number,"blockDescription":"string (2-3 sentences)"}`;

      messages.push({ role: 'user', content: step1Prompt });
      const reply1 = await callGemini(messages);
      step1Data = parseJSON(reply1);
      messages.push({ role: 'assistant', content: reply1 });

      // === STEP 2: Peer Comparison ===
      setCurrentStep(1);
      // peers = top-2 HDI districts from the dataset, passed as a prop
      const peerSummary = peers.map(p => ({
        name: p.district,
        hdi: p.hdi,
        literacy: p.literacy,
        infantMortality: p.infantMortality,
      }));

      const step2Prompt = `Now compare ${district.name}'s ${sector} leakage at ${level} level with peer districts.

Peer districts (top-performing by HDI in the dataset):
${JSON.stringify(peerSummary, null, 2)}

${district.name} has only ${data.received}% receipt rate at ${level} level.
Explain what these peer districts likely do differently to achieve better fund flow efficiency.
Return ONLY valid JSON:
{"peerDistricts":[{"name":"string","receiptRate":number,"whatTheyDoDifferently":"string"}]}`;

      messages.push({ role: 'user', content: step2Prompt });
      const reply2 = await callGemini(messages);
      step2Data = parseJSON(reply2);
      messages.push({ role: 'assistant', content: reply2 });

      // === STEP 3: Fix Prescription ===
      setCurrentStep(2);
      const step3Prompt = `Prescribe a specific, actionable fix for the leakage in ${district.name}.

Based on our analysis:
- Leak type: ${step1Data?.leakType}
- Amount stuck: ₹${step1Data?.amountStuck} Lakhs
- Peer districts doing better: ${step2Data?.peerDistricts?.map(d => d.name).join(', ')}

Give a concrete prescription with specific actors and timelines.
Return ONLY valid JSON:
{
  "leakType": "string",
  "amountStuck": number,
  "peerDistricts": [{"name":"string","whatTheyDoDifferently":"string"}],
  "rootCause": "string (1 sentence)",
  "fix": {"actor":"string","action":"string","timeToResolve":"string"},
  "urgency": "Low|Medium|High|Critical"
}`;

      messages.push({ role: 'user', content: step3Prompt });
      const reply3 = await callGemini(messages);
      const step3Data = parseJSON(reply3);

      setResult(step3Data || {
        leakType: step1Data?.leakType || 'Unknown',
        amountStuck: step1Data?.amountStuck || 0,
        peerDistricts: step2Data?.peerDistricts || [],
        rootCause: 'Investigation incomplete.',
        fix: { actor: 'District Admin', action: 'Manual review required', timeToResolve: 'TBD' },
        urgency: 'High',
      });
      setStatus('done');

    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  const urgencyStyle = result ? (URGENCY_STYLES[result.urgency] || URGENCY_STYLES.High) : null;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Search size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-text">Leakage Investigation Agent</h3>
              <p className="text-xs text-text-subtle mt-0.5">Triggered from Pipeline Tracker red nodes</p>
            </div>
          </div>
          <div className={`badge ${
            !hasData ? 'badge-primary' :
            status === 'running' ? 'badge-warning' :
            status === 'done' ? 'badge-success' : 
            status === 'error' ? 'badge-danger' : 'badge-primary'
          }`}>
            {!hasData ? 'Waiting' : status === 'idle' ? 'Ready' : status === 'running' ? 'Running...' : status === 'done' ? 'Complete' : 'Error'}
          </div>
        </div>

        {/* Trigger Info */}
        {triggerData ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-red-300">Leakage Detected</div>
                <div className="text-xs text-text-muted mt-0.5">
                  <strong>{triggerData.sector}</strong> sector · <strong className="capitalize">{triggerData.level}</strong> level · 
                  Only <strong className="text-danger">{triggerData.data.received}%</strong> received (₹{triggerData.data.amount}L allocated)
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-bg-elevated border border-border rounded-xl p-3 mb-4 text-sm text-text-subtle text-center">
            Go to <strong className="text-text">Pipeline Tracker</strong> and click a 🔴 red node to trigger this agent.
          </div>
        )}

        {status === 'running' && <StepProgress currentStep={currentStep} steps={STEPS} />}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-3">
            <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <button
          onClick={runInvestigation}
          disabled={!hasData || status === 'running'}
          className="btn-primary w-full justify-center"
          style={{ backgroundColor: hasData ? '#dc2626' : undefined }}
        >
          {status === 'running' ? (
            <><Loader2 size={16} className="animate-spin" /> Investigating...</>
          ) : (
            <><Search size={16} /> Investigate Leakage</>
          )}
        </button>
      </div>

      {/* Results */}
      {status === 'done' && result && (
        <div className="space-y-4 animate-slide-up">
          {/* Urgency + Amount */}
          <div className={`card border ${urgencyStyle.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`badge text-sm ${urgencyStyle.badge}`}>
                {result.urgency} Urgency
              </span>
              <div className="text-2xl font-bold text-danger">₹{result.amountStuck}L</div>
            </div>
            <div className="text-xs text-text-subtle mb-1">Leak Type</div>
            <div className="font-semibold text-text">{result.leakType}</div>
            {result.rootCause && (
              <div className="mt-3 text-sm text-text-muted bg-bg/40 rounded-lg p-2.5">
                <span className="text-text-subtle font-medium">Root Cause: </span>
                {result.rootCause}
              </div>
            )}
          </div>

          {/* Peer Districts */}
          {result.peerDistricts?.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-text mb-3">Peer Districts Comparison</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.peerDistricts.slice(0, 2).map((peer, i) => (
                  <div key={i} className="bg-green-900/10 border border-green-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-success" />
                      <span className="font-semibold text-success text-sm">{peer.name}</span>
                      {peer.receiptRate && (
                        <span className="ml-auto text-xs text-success font-bold">{peer.receiptRate}% received</span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">{peer.whatTheyDoDifferently}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fix Prescription */}
          {result.fix && (
            <div className="card border border-primary/30">
              <h4 className="font-semibold text-text mb-3 flex items-center gap-2">
                <ArrowRight size={16} className="text-blue-400" />
                Prescribed Fix
              </h4>
              <div className="space-y-2">
                <div className="flex gap-2 text-sm">
                  <span className="text-text-subtle w-20 flex-shrink-0">Actor:</span>
                  <span className="font-semibold text-text">{result.fix.actor}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-text-subtle w-20 flex-shrink-0">Action:</span>
                  <span className="text-text">{result.fix.action}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-text-subtle w-20 flex-shrink-0">Timeline:</span>
                  <span className={`font-semibold ${urgencyStyle.text}`}>{result.fix.timeToResolve}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
