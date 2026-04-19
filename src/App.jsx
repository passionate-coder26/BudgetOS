import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import PipelineTrackerPage from './pages/PipelineTrackerPage';
import AgentsPage from './pages/AgentsPage';
import ScenarioPlannerPage from './pages/ScenarioPlannerPage';
import { SECTORS, SECTOR_COLORS, getScoreColor, getScoreLabel } from './data/seedData';

// ─────────────────────────────────────────────────────────────────────────────
// REQUIRED COLUMNS (for upload validation)
// ─────────────────────────────────────────────────────────────────────────────
const REQUIRED_COLUMNS = [
  'district', 'population', 'gdp', 'hdi', 'literacy', 'infantMortality',
  'poverty', 'Healthcare', 'Education', 'Infrastructure', 'Agriculture',
];

// ─────────────────────────────────────────────────────────────────────────────
// DATASET NORMALIZER
// Maps uploaded column name variants → canonical app keys
// ─────────────────────────────────────────────────────────────────────────────
function normalizeDataset(rows) {
  return rows.map(row => {
    const r = {};
    Object.keys(row).forEach(k => {
      r[k.trim().toLowerCase().replace(/\s+/g, '')] = row[k];
    });
    return {
      district: String(r.district || r.districtname || r.name || '').trim(),
      population: Number(r.population || r.pop || 0),
      gdp: Number(r.gdp || r.gdplakhs || r.gdp_lakhs || 0),
      hdi: Number(r.hdi || r.hdiscore || r.hdi_score || 0),
      literacy: Number(r.literacy || r.literacyrate || 0),
      infantMortality: Number(r.infantmortality || r.infantmortalityrate || r.imr || 0),
      poverty: Number(r.poverty || r.povertyrate || 0),
      Healthcare: Number(r.healthcare || 0),
      Education: Number(r.education || 0),
      Infrastructure: Number(r.infrastructure || 0),
      Agriculture: Number(r.agriculture || 0),
    };
  }).filter(r => r.district !== '');
}

// ─────────────────────────────────────────────────────────────────────────────
// HYDRATE DISTRICT
// Converts a flat dataset row into the full district object the app expects.
// Pipeline, sectorHealth, history are generated algorithmically from the data.
// ─────────────────────────────────────────────────────────────────────────────
function hydrateDistrict(row) {
  // Compute a health score from indicator values (0–100 scale)
  const hdiScore = Math.min(100, row.hdi * 100);
  const literacyScore = Math.min(100, row.literacy);
  const imrScore = Math.max(0, 100 - row.infantMortality * 1.5);
  const povertyScore = Math.max(0, 100 - row.poverty * 2);
  const healthScore = Math.round((hdiScore * 0.35 + literacyScore * 0.25 + imrScore * 0.2 + povertyScore * 0.2));

  // Build allocation directly from uploaded sector columns (user-provided percentages)
  const UPLOAD_SECTORS = ['Healthcare', 'Education', 'Infrastructure', 'Agriculture'];
  const allocation = {};
  UPLOAD_SECTORS.forEach(k => {
    allocation[k] = Number(row[k]) || 0;
  });

  // Recommended: nudge toward HDI-improving sectors
  const recommendedAllocation = { ...allocation };
  if (row.hdi < 0.65) {
    recommendedAllocation.Healthcare = Math.min(35, allocation.Healthcare + 5);
    recommendedAllocation.Education = Math.min(35, allocation.Education + 3);
    const excess = (recommendedAllocation.Healthcare - allocation.Healthcare)
      + (recommendedAllocation.Education - allocation.Education);
    recommendedAllocation.Infrastructure = Math.max(5, allocation.Infrastructure - Math.ceil(excess / 2));
    recommendedAllocation.Agriculture = Math.max(5, allocation.Agriculture - Math.floor(excess / 2));
  }

  // Sector health: derive from allocation adequacy & HDI
  const sectorHealth = {};
  UPLOAD_SECTORS.forEach(sector => {
    const base = healthScore + (allocation[sector] - 20) * 0.8;
    const score = Math.max(10, Math.min(95, Math.round(base + (Math.random() * 6 - 3))));
    const trend = score > 65 ? 'up' : score > 50 ? 'stable' : 'down';
    sectorHealth[sector] = { score, trend };
  });

  // Pipeline: generate receipt % per level based on sector health
  const pipeline = {};
  UPLOAD_SECTORS.forEach(sector => {
    const sh = sectorHealth[sector].score;
    const baseAmount = Math.round(allocation[sector] * 100); // proxy ₹ lakhs
    const blockPct = Math.max(55, Math.min(98, Math.round(sh * 0.95 + Math.random() * 6 - 3)));
    const gpPct = Math.max(40, Math.min(95, Math.round(blockPct * 0.88 + Math.random() * 6 - 3)));
    const benPct = Math.max(25, Math.min(92, Math.round(gpPct * 0.88 + Math.random() * 6 - 3)));
    const leakReasons = ['delay', 'capacity', 'tied_grant', 'diversion', null];
    const pickLeak = (pct) => pct < 60 ? (Math.random() < 0.5 ? 'diversion' : 'delay')
      : pct < 75 ? (Math.random() < 0.5 ? 'capacity' : 'tied_grant')
        : pct < 80 ? 'tied_grant' : null;
    pipeline[sector] = {
      district: { received: 100, amount: baseAmount },
      block: { received: blockPct, amount: Math.round(baseAmount * blockPct / 100), leakReason: blockPct < 80 ? pickLeak(blockPct) : null },
      gramPanchayat: { received: gpPct, amount: Math.round(baseAmount * gpPct / 100), leakReason: gpPct < 80 ? pickLeak(gpPct) : null },
      beneficiary: { received: benPct, amount: Math.round(baseAmount * benPct / 100), leakReason: benPct < 80 ? pickLeak(benPct) : null },
    };
  });

  // History: generate 6 years of gradual convergence toward current allocation
  const history = {};
  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  years.forEach((yr, i) => {
    const progress = i / (years.length - 1); // 0 → 1
    history[yr] = {};
    UPLOAD_SECTORS.forEach(sector => {
      const start = allocation[sector] + (Math.random() * 6 - 3);
      history[yr][sector] = Math.max(2, Math.round(start + (allocation[sector] - start) * progress));
    });
    // Normalise each year to 100
    const total = Object.values(history[yr]).reduce((a, b) => a + b, 0);
    const scale = 100 / total;
    UPLOAD_SECTORS.forEach(sector => { history[yr][sector] = Math.round(history[yr][sector] * scale); });
  });

  return {
    id: row.district.toLowerCase().replace(/\s+/g, '_'),
    name: row.district,
    indicators: {
      HDI: row.hdi,
      literacyRate: row.literacy,
      infantMortality: row.infantMortality,
      povertyPercent: row.poverty,
      gdpPerCapita: row.gdp,
      population: row.population,
    },
    // Raw flat fields kept for agent access
    _raw: row,
    healthScore,
    allocation,
    recommendedAllocation,
    sectorHealth,
    pipeline,
    history,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA — Maharashtra districts converted to flat upload format
// (used when "Use Sample Data" is clicked)
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_FLAT_DATA = [
  { district: 'Aurangabad', population: 3695928, gdp: 78500, hdi: 0.61, literacy: 72.4, infantMortality: 38, poverty: 24.3, Healthcare: 21, Education: 26, Infrastructure: 30, Agriculture: 23 },
  { district: 'Nashik', population: 6107187, gdp: 112000, hdi: 0.68, literacy: 80.1, infantMortality: 28, poverty: 16.2, Healthcare: 25, Education: 30, Infrastructure: 26, Agriculture: 19 },
  { district: 'Pune', population: 9429408, gdp: 198000, hdi: 0.76, literacy: 86.2, infantMortality: 19, poverty: 9.8, Healthcare: 27, Education: 32, Infrastructure: 29, Agriculture: 12 },
  { district: 'Nagpur', population: 4653570, gdp: 125000, hdi: 0.69, literacy: 83.1, infantMortality: 25, poverty: 14.6, Healthcare: 26, Education: 28, Infrastructure: 28, Agriculture: 18 },
  { district: 'Solapur', population: 4317756, gdp: 62000, hdi: 0.58, literacy: 68.9, infantMortality: 44, poverty: 28.7, Healthcare: 20, Education: 25, Infrastructure: 27, Agriculture: 28 },
  { district: 'Amravati', population: 2887826, gdp: 71000, hdi: 0.63, literacy: 76.5, infantMortality: 33, poverty: 21.4, Healthcare: 23, Education: 27, Infrastructure: 25, Agriculture: 25 },
  { district: 'Kolhapur', population: 3876001, gdp: 142000, hdi: 0.71, literacy: 82.4, infantMortality: 22, poverty: 12.1, Healthcare: 26, Education: 30, Infrastructure: 26, Agriculture: 18 },
  { district: 'Latur', population: 2454196, gdp: 48000, hdi: 0.55, literacy: 64.3, infantMortality: 52, poverty: 33.8, Healthcare: 20, Education: 24, Infrastructure: 26, Agriculture: 30 },
];

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE TEMPLATE DOWNLOAD
// ─────────────────────────────────────────────────────────────────────────────
function downloadSampleTemplate() {
  const headers = REQUIRED_COLUMNS.join(',');
  const sampleRow = [
    'SampleDistrict', '1500000', '85000', '0.72', '88.5', '18.2',
    '22.1', '25', '28', '27', '20',
  ].join(',');
  const csv = `${headers}\n${sampleRow}\n`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'budgetos_dataset_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// DATASET UPLOAD PAGE
// ─────────────────────────────────────────────────────────────────────────────
function DatasetUploadPage({ onDatasetLoaded }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [previewRows, setPreviewRows] = useState(null);
  const [detectedCols, setDetectedCols] = useState([]);
  const [missingCols, setMissingCols] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [parsedRows, setParsedRows] = useState(null);
  const inputRef = useRef(null);

  function processRows(rows) {
    if (!rows || rows.length === 0) {
      setParseError('File appears to be empty.');
      setIsValid(false);
      return;
    }
    const cols = Object.keys(rows[0]);
    const missing = REQUIRED_COLUMNS.filter(
      (c) => !cols.some((k) => k.trim().toLowerCase() === c.toLowerCase())
    );
    setDetectedCols(cols);
    setMissingCols(missing);
    setPreviewRows(rows.slice(0, 5));
    setParseError(null);
    const valid = missing.length === 0;
    setIsValid(valid);
    if (valid) setParsedRows(rows);
  }

  function parseCSV(file) {
    window.Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => processRows(result.data),
      error: (err) => { setParseError(`CSV parse error: ${err.message}`); setIsValid(false); },
    });
  }

  function parseExcel(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = window.XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(ws, { defval: '' });
        processRows(rows);
      } catch (err) {
        setParseError(`Excel parse error: ${err.message}`); setIsValid(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function parseJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        processRows(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setParseError(`JSON parse error: ${err.message}`); setIsValid(false);
      }
    };
    reader.readAsText(file);
  }

  function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    setPreviewRows(null); setDetectedCols([]); setMissingCols([]);
    setParseError(null); setIsValid(false); setParsedRows(null);
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') parseCSV(file);
    else if (ext === 'xlsx' || ext === 'xls') parseExcel(file);
    else if (ext === 'json') parseJSON(file);
    else setParseError('Unsupported file type. Use .xlsx, .xls, .csv, or .json');
  }

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const onInputChange = (e) => handleFile(e.target.files[0]);

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#E2E8F0] font-sans flex items-center justify-center relative overflow-hidden">
      {/* Background radial dots pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Progress Line */}
        <div className="absolute top-0 left-0 w-full flex flex-col items-center pt-8 opacity-80 pointer-events-none">
          <span className="text-[#00D4B4] text-[10px] font-semibold tracking-[0.12em] uppercase mb-2">Step 1 of 1 — Load Dataset</span>
          <div className="w-[120px] h-[2px] bg-[#1F2D45] rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-[#00D4B4] rounded-full shadow-[0_0_8px_#00D4B4]"></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-stretch pt-20 lg:pt-8 w-full">

          {/* LEFT COLUMN: BRANDING (40%) */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center mb-10 lg:mb-0 lg:pl-4">
            <div className="mb-10">
              <h1 className="text-[48px] font-bold text-[#00D4B4] tracking-tight leading-none mb-4">BudgetOS</h1>
              <p className="text-[20px] font-medium text-white mb-3">Allocate smarter. Every rupee, every sector, every district.</p>
              <p className="text-[15px] text-[#64748B] leading-[1.6]">
                AI-powered budget optimization that tells you where to spend, how much — and whether it actually reached the people.
              </p>
            </div>

            <div className="space-y-4 mb-12">
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full bg-[#111827] border border-[#1F2D45] flex items-center justify-center text-[#00D4B4] text-[14px]">⚡</div>
                <span className="text-[#94A3B8] font-medium text-[14px]">AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full bg-[#111827] border border-[#1F2D45] flex items-center justify-center text-[#00D4B4] text-[14px]">🔍</div>
                <span className="text-[#94A3B8] font-medium text-[14px]">Fund Leakage Detection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full bg-[#111827] border border-[#1F2D45] flex items-center justify-center text-[#00D4B4] text-[14px]">📊</div>
                <span className="text-[#94A3B8] font-medium text-[14px]">Scenario Simulation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full bg-[#111827] border border-[#1F2D45] flex items-center justify-center text-[#00D4B4] text-[14px]">🏘</div>
                <span className="text-[#94A3B8] font-medium text-[14px]">Village-Level Insights</span>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[#1F2D45]/50 flex items-center gap-2">
              <span className="text-[13px] text-[#64748B] font-medium">Powered by Commit || Cry</span>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="hidden lg:block w-[1px] bg-gradient-to-b from-transparent via-[#1F2D45] to-transparent"></div>

          {/* RIGHT COLUMN: UPLOAD ZONE (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col justify-center">

            <div className="bg-[#111827] border border-[#1F2D45] rounded-[16px] p-6 sm:p-[32px] shadow-2xl relative w-full">

              {!isValid && !previewRows && (
                <div
                  className={`min-h-[220px] rounded-[12px] border-[2px] dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-200 group
                    ${dragOver ? 'border-[#00D4B4] bg-[#00D4B4]/[0.08]' : 'border-[#00D4B4] bg-[#00D4B4]/[0.03] hover:border-[#00D4B4] hover:bg-[#00D4B4]/[0.06]'}`
                  }
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.json" className="hidden" onChange={onInputChange} />

                  <div className="mb-4 text-[#00D4B4] opacity-90 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>

                  <div className="text-[18px] font-[500] text-white mb-1.5">
                    {dragOver ? 'Drop it here!' : 'Drag & drop your dataset file'}
                  </div>

                  <div className="text-[#64748B] text-[13px] mb-5">
                    Supports .xlsx .xls .csv .json
                  </div>

                  <div className="flex items-center gap-3 w-full max-w-[180px] mb-5 opacity-60">
                    <div className="h-[1px] flex-1 bg-[#1F2D45]"></div>
                    <span className="text-[11px] uppercase tracking-wider text-[#64748B]">or</span>
                    <div className="h-[1px] flex-1 bg-[#1F2D45]"></div>
                  </div>

                  <button
                    className="bg-[#00D4B4] text-[#0A0E1A] font-[500] px-6 py-2.5 rounded-full text-[14px] hover:bg-[#00ebd0] transition-colors shadow-lg"
                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  >
                    Browse Files
                  </button>
                </div>
              )}

              {/* SUCCESS BANNER */}
              {isValid && fileName && (
                <div className="bg-[#00D4B4]/10 border border-[#00D4B4]/30 rounded-[12px] p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00D4B4]/20 flex items-center justify-center text-[#00D4B4]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div>
                      <div className="text-[#00D4B4] font-semibold text-[14px]">{fileName}</div>
                      <div className="text-[#64748B] text-[12px]">{fileSize} • {parsedRows?.length || 0} rows</div>
                    </div>
                  </div>
                  <button onClick={() => { setFileName(null); setPreviewRows(null); setIsValid(false); setParseError(null) }} className="text-[#64748B] hover:text-white transition-colors text-[13px] underline">
                    Change file
                  </button>
                </div>
              )}

              {/* VALIDATION ERROR STATE */}
              {parseError && (
                <div className="bg-[#EF4444]/[0.15] border-l-[3px] border-[#EF4444] rounded-r-[8px] p-4 mt-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[#EF4444] mt-0.5">⚠️</span>
                    <div className="text-[#EF4444] text-[14px]">
                      {parseError}
                    </div>
                  </div>
                </div>
              )}

              {missingCols.length > 0 && !parseError && (
                <div className="bg-[#EF4444]/[0.15] border-l-[3px] border-[#EF4444] rounded-r-[8px] p-4 mt-2">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-[#EF4444] mt-0.5">⚠️</span>
                    <div className="text-[#EF4444] font-medium text-[14px]">
                      Validation Error: Missing required columns
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-7">
                    {missingCols.map(c => (
                      <span key={c} className="bg-[#EF4444]/20 border border-[#EF4444]/40 rounded-full px-2.5 py-0.5 text-[12px] text-[#fca5a5]">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 ml-7">
                    <button onClick={() => { setFileName(null); setPreviewRows(null); setIsValid(false); setParseError(null); setMissingCols([]) }} className="text-[#EF4444] hover:text-[#f87171] text-[13px] underline transition-colors">
                      Try another file
                    </button>
                  </div>
                </div>
              )}

              {/* TABLE PREVIEW */}
              {isValid && previewRows && previewRows.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#64748B] font-semibold">Data Preview</span>
                    <span className="text-[11px] text-[#64748B]">Showing first 5 of {parsedRows?.length || previewRows.length} rows</span>
                  </div>

                  <div className="rounded-[8px] border border-[#1F2D45] overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[12px]">
                      <thead>
                        <tr>
                          {detectedCols.map(c => (
                            <th key={c} className="bg-[#00D4B4] text-[#0A0E1A] px-3 py-2 font-medium whitespace-nowrap">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, ri) => (
                          <tr key={ri} className={ri % 2 === 1 ? 'bg-[#1a2535]' : 'bg-[#111827]'}>
                            {detectedCols.map(c => (
                              <td key={c} className="px-3 py-2 text-[#94a3b8] border-t border-[#1F2D45] whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                {String(row[c] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex flex-col gap-[12px] mt-[24px]">
                <button
                  className={`flex items-center justify-center gap-2 w-full h-[48px] rounded-[12px] text-[#0A0E1A] text-[14px] font-[500] tracking-[0.02em] transition-all duration-200
                    ${isValid
                      ? 'bg-[#00D4B4] hover:bg-[#00ebd0] hover:scale-[1.01] cursor-pointer shadow-[0_0_15px_rgba(0,212,180,0.2)]'
                      : 'bg-[#00D4B4] opacity-30 cursor-not-allowed'}`}
                  disabled={!isValid}
                  onClick={() => {
                    if (isValid && parsedRows) {
                      onDatasetLoaded(normalizeDataset(parsedRows));
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Confirm &amp; Load Dataset
                </button>

                <div className="flex flex-col">
                  <button
                    className="flex items-center justify-center gap-2 w-full h-[48px] rounded-[12px] border border-[#1F2D45] bg-[#111827] text-[#E2E8F0] text-[14px] font-[500] tracking-[0.02em] transition-all duration-200 hover:border-[#00D4B4] hover:text-[#00D4B4] group"
                    onClick={() => onDatasetLoaded(normalizeDataset(SAMPLE_FLAT_DATA))}
                  >
                    <span>📦</span>
                    Use Sample Data
                  </button>
                  <span className="text-[12px] text-[#64748B] text-center mt-2 group-hover:text-[#94a3b8] transition-colors">
                    8 Maharashtra districts preloaded
                  </span>
                </div>
              </div>

              {/* TEMPLATE LINK */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={downloadSampleTemplate}
                  className="flex items-center gap-2 px-[16px] py-[8px] rounded-full border border-[#1F2D45] text-[#94a3b8] text-[12px] hover:border-[#00D4B4] hover:text-[#00D4B4] transition-colors"
                >
                  <span>↓</span>
                  Download sample template (.csv)
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [leakageTrigger, setLeakageTrigger] = useState(null);

  // ── Dataset state (null = show upload page) ─────────────────────────────
  const [dataset, setDataset] = useState(null);       // flat normalized rows
  const [hydratedDistricts, setHydratedDistricts] = useState([]);       // full district objects
  const [selectedDistrict, setSelectedDistrict] = useState(null);       // district name string

  // Hydrate district objects whenever dataset changes
  useEffect(() => {
    if (dataset && dataset.length > 0) {
      const hydrated = dataset.map(hydrateDistrict);
      setHydratedDistricts(hydrated);
      setSelectedDistrict(hydrated[0].name);
    }
  }, [dataset]);

  const handleLeakageTrigger = useCallback((info) => {
    setLeakageTrigger(info);
    setCurrentPage('agents');
  }, []);

  const handleDistrictChange = useCallback((name) => {
    setSelectedDistrict(name);
    setLeakageTrigger(null);
  }, []);

  // ── Gate: show upload page until dataset is loaded ───────────────────────
  if (!dataset) {
    return <DatasetUploadPage onDatasetLoaded={(rows) => setDataset(rows)} />;
  }

  // Guard: wait for hydration
  if (hydratedDistricts.length === 0 || !selectedDistrict) {
    return <div className="flex h-screen items-center justify-center bg-bg text-text">Loading…</div>;
  }

  // Active district full object
  const district = hydratedDistricts.find(d => d.name === selectedDistrict) || hydratedDistricts[0];

  // Sidebar expects array of { id, name } objects
  const districtList = hydratedDistricts.map(d => ({ id: d.name, name: d.name }));

  // Dataset stats for agents
  const avgHdi = (dataset.reduce((s, d) => s + d.hdi, 0) / dataset.length).toFixed(2);
  const peers = dataset
    .filter(d => d.district !== selectedDistrict)
    .sort((a, b) => b.hdi - a.hdi)
    .slice(0, 2);

  const renderPage = () => {
    if (!district) return null;
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            district={district}
            dataset={dataset}
            onChangeDataset={() => setDataset(null)}
          />
        );
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
            allDistricts={districtList}
            onNavigate={setCurrentPage}
            dataset={dataset}
            avgHdi={avgHdi}
            peers={peers}
          />
        );
      case 'scenario':
        return (
          <ScenarioPlannerPage
            district={district}
            dataset={dataset}
            avgHdi={avgHdi}
          />
        );
      default:
        return (
          <Dashboard
            district={district}
            dataset={dataset}
            onChangeDataset={() => setDataset(null)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        selectedDistrict={selectedDistrict}
        onDistrictChange={handleDistrictChange}
        districts={districtList}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          district={district}
          onChangeDataset={() => setDataset(null)}
        />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
