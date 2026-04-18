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
      district:        String(r.district || r.districtname || r.name || '').trim(),
      population:      Number(r.population || r.pop || 0),
      gdp:             Number(r.gdp || r.gdplakhs || r.gdp_lakhs || 0),
      hdi:             Number(r.hdi || r.hdiscore || r.hdi_score || 0),
      literacy:        Number(r.literacy || r.literacyrate || 0),
      infantMortality: Number(r.infantmortality || r.infantmortalityrate || r.imr || 0),
      poverty:         Number(r.poverty || r.povertyrate || 0),
      Healthcare:      Number(r.healthcare || 0),
      Education:       Number(r.education || 0),
      Infrastructure:  Number(r.infrastructure || 0),
      Agriculture:     Number(r.agriculture || 0),
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
  const hdiScore      = Math.min(100, row.hdi * 100);
  const literacyScore = Math.min(100, row.literacy);
  const imrScore      = Math.max(0, 100 - row.infantMortality * 1.5);
  const povertyScore  = Math.max(0, 100 - row.poverty * 2);
  const healthScore   = Math.round((hdiScore * 0.35 + literacyScore * 0.25 + imrScore * 0.2 + povertyScore * 0.2));

  // Build allocation from uploaded sector columns, normalised to sum to 100
  const UPLOAD_SECTORS = ['Healthcare', 'Education', 'Infrastructure', 'Agriculture'];
  const rawTotal = UPLOAD_SECTORS.reduce((s, k) => s + (Number(row[k]) || 0), 0);
  const allocation = {};
  if (rawTotal > 0) {
    UPLOAD_SECTORS.forEach(k => {
      allocation[k] = Math.round((Number(row[k]) / rawTotal) * 100);
    });
    // Correct rounding drift
    const diff = 100 - Object.values(allocation).reduce((a, b) => a + b, 0);
    allocation[UPLOAD_SECTORS[0]] += diff;
  } else {
    const even = Math.floor(100 / UPLOAD_SECTORS.length);
    UPLOAD_SECTORS.forEach((k, i) => { allocation[k] = even + (i === 0 ? 100 - even * UPLOAD_SECTORS.length : 0); });
  }

  // Recommended: nudge toward HDI-improving sectors
  const recommendedAllocation = { ...allocation };
  if (row.hdi < 0.65) {
    recommendedAllocation.Healthcare  = Math.min(35, allocation.Healthcare + 5);
    recommendedAllocation.Education   = Math.min(35, allocation.Education + 3);
    const excess = (recommendedAllocation.Healthcare - allocation.Healthcare)
                 + (recommendedAllocation.Education - allocation.Education);
    recommendedAllocation.Infrastructure = Math.max(5, allocation.Infrastructure - Math.ceil(excess / 2));
    recommendedAllocation.Agriculture    = Math.max(5, allocation.Agriculture - Math.floor(excess / 2));
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
    const blockPct   = Math.max(55, Math.min(98, Math.round(sh * 0.95 + Math.random() * 6 - 3)));
    const gpPct      = Math.max(40, Math.min(95, Math.round(blockPct * 0.88 + Math.random() * 6 - 3)));
    const benPct     = Math.max(25, Math.min(92, Math.round(gpPct * 0.88 + Math.random() * 6 - 3)));
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
  { district:'Aurangabad', population:3695928, gdp:78500,  hdi:0.61, literacy:72.4, infantMortality:38, poverty:24.3, Healthcare:21, Education:26, Infrastructure:30, Agriculture:23 },
  { district:'Nashik',     population:6107187, gdp:112000, hdi:0.68, literacy:80.1, infantMortality:28, poverty:16.2, Healthcare:25, Education:30, Infrastructure:26, Agriculture:19 },
  { district:'Pune',       population:9429408, gdp:198000, hdi:0.76, literacy:86.2, infantMortality:19, poverty:9.8,  Healthcare:27, Education:32, Infrastructure:29, Agriculture:12 },
  { district:'Nagpur',     population:4653570, gdp:125000, hdi:0.69, literacy:83.1, infantMortality:25, poverty:14.6, Healthcare:26, Education:28, Infrastructure:28, Agriculture:18 },
  { district:'Solapur',    population:4317756, gdp:62000,  hdi:0.58, literacy:68.9, infantMortality:44, poverty:28.7, Healthcare:20, Education:25, Infrastructure:27, Agriculture:28 },
  { district:'Amravati',   population:2887826, gdp:71000,  hdi:0.63, literacy:76.5, infantMortality:33, poverty:21.4, Healthcare:23, Education:27, Infrastructure:25, Agriculture:25 },
  { district:'Kolhapur',   population:3876001, gdp:142000, hdi:0.71, literacy:82.4, infantMortality:22, poverty:12.1, Healthcare:26, Education:30, Infrastructure:26, Agriculture:18 },
  { district:'Latur',      population:2454196, gdp:48000,  hdi:0.55, literacy:64.3, infantMortality:52, poverty:33.8, Healthcare:20, Education:24, Infrastructure:26, Agriculture:30 },
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
// DATASET UPLOAD PAGE  (UI unchanged — only button callbacks updated)
// ─────────────────────────────────────────────────────────────────────────────
function DatasetUploadPage({ onDatasetLoaded }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);
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
    // Case-insensitive column check
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
    setPreviewRows(null); setDetectedCols([]); setMissingCols([]);
    setParseError(null); setIsValid(false); setParsedRows(null);
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv')               parseCSV(file);
    else if (ext === 'xlsx' || ext === 'xls') parseExcel(file);
    else if (ext === 'json')         parseJSON(file);
    else setParseError('Unsupported file type. Use .xlsx, .xls, .csv, or .json');
  }

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const onInputChange = (e) => handleFile(e.target.files[0]);

  const s = {
    page:        { minHeight:'100vh', background:'#0A0E1A', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans', sans-serif", padding:'2rem 1rem' },
    container:   { width:'100%', maxWidth:'780px' },
    brand:       { display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem', marginBottom:'0.5rem' },
    logo:        { width:44, height:44, borderRadius:'12px', background:'linear-gradient(135deg,#00D4B4 0%,#3B82F6 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' },
    brandName:   { fontSize:'2rem', fontWeight:'800', background:'linear-gradient(90deg,#00D4B4,#3B82F6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
    subtitle:    { textAlign:'center', color:'#64748B', fontSize:'0.9rem', marginBottom:'2.5rem', letterSpacing:'0.03em' },
    card:        { background:'#111827', border:'1px solid #1F2D45', borderRadius:'20px', padding:'2rem', marginBottom:'1.25rem' },
    sectionTitle:{ fontSize:'0.8rem', fontWeight:'600', letterSpacing:'0.1em', textTransform:'uppercase', color:'#64748B', marginBottom:'1rem' },
    dropZone: (a) => ({ border:`2px dashed ${a?'#00D4B4':'#1F2D45'}`, borderRadius:'14px', background: a?'rgba(0,212,180,0.06)':'rgba(31,45,69,0.18)', padding:'2.5rem 1.5rem', textAlign:'center', cursor:'pointer', transition:'all 0.2s ease', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem' }),
    dropIcon:    { fontSize:'2.5rem', lineHeight:1 },
    dropText:    { color:'#E2E8F0', fontWeight:'600', fontSize:'1rem' },
    dropSub:     { color:'#64748B', fontSize:'0.82rem' },
    browseBtn:   { marginTop:'0.25rem', background:'linear-gradient(135deg,#00D4B4,#3B82F6)', border:'none', borderRadius:'8px', color:'#0A0E1A', fontWeight:'700', fontSize:'0.82rem', padding:'0.45rem 1.25rem', cursor:'pointer', letterSpacing:'0.02em' },
    fileChip:    { display:'flex', alignItems:'center', gap:'0.6rem', background:'rgba(0,212,180,0.1)', border:'1px solid rgba(0,212,180,0.3)', borderRadius:'8px', padding:'0.5rem 1rem', marginTop:'1rem', color:'#00D4B4', fontSize:'0.85rem', fontWeight:'600' },
    error:       { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.35)', borderRadius:'10px', padding:'0.85rem 1rem', color:'#f87171', fontSize:'0.84rem', marginTop:'1rem' },
    missingList: { marginTop:'0.5rem', display:'flex', flexWrap:'wrap', gap:'0.35rem' },
    missingTag:  { background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'5px', padding:'0.2rem 0.5rem', fontSize:'0.75rem', color:'#fca5a5', fontFamily:'monospace' },
    tableWrap:   { overflowX:'auto', marginTop:'0.5rem', borderRadius:'10px', border:'1px solid #1F2D45' },
    table:       { width:'100%', borderCollapse:'collapse', fontSize:'0.78rem', color:'#E2E8F0' },
    th:          { background:'#0A0E1A', color:'#00D4B4', padding:'0.55rem 0.75rem', textAlign:'left', fontWeight:'700', fontFamily:'monospace', fontSize:'0.72rem', whiteSpace:'nowrap', borderBottom:'1px solid #1F2D45' },
    td:          { padding:'0.45rem 0.75rem', borderBottom:'1px solid #1a2438', color:'#94a3b8', whiteSpace:'nowrap', maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis' },
    trEven:      { background:'rgba(31,45,69,0.25)' },
    confirmBtn: (a) => ({ width:'100%', padding:'0.9rem', borderRadius:'12px', border:'none', fontFamily:"'DM Sans', sans-serif", fontWeight:'700', fontSize:'0.95rem', cursor: a?'pointer':'not-allowed', background: a?'linear-gradient(135deg,#00D4B4,#3B82F6)':'#1F2D45', color: a?'#0A0E1A':'#64748B', transition:'all 0.2s ease', marginBottom:'0.75rem', letterSpacing:'0.02em' }),
    sampleBtn:   { width:'100%', padding:'0.85rem', borderRadius:'12px', border:'1px solid #1F2D45', fontFamily:"'DM Sans', sans-serif", fontWeight:'600', fontSize:'0.9rem', cursor:'pointer', background:'transparent', color:'#E2E8F0', transition:'all 0.2s ease' },
    templateRow: { textAlign:'center', marginTop:'1.5rem' },
    templateLink:{ color:'#3B82F6', fontSize:'0.83rem', cursor:'pointer', textDecoration:'underline', background:'none', border:'none', fontFamily:"'DM Sans', sans-serif" },
    successBadge:{ display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(0,212,180,0.1)', border:'1px solid rgba(0,212,180,0.3)', borderRadius:'8px', padding:'0.6rem 1rem', color:'#00D4B4', fontSize:'0.84rem', fontWeight:'600', marginTop:'1rem' },
    colsRow:     { display:'flex', flexWrap:'wrap', gap:'0.3rem', marginTop:'0.5rem' },
    colTag:      { background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:'5px', padding:'0.18rem 0.5rem', fontSize:'0.72rem', color:'#93c5fd', fontFamily:'monospace' },
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Branding */}
        <div style={s.brand}>
          <div style={s.logo}>💰</div>
          <span style={s.brandName}>BudgetOS</span>
        </div>
        <p style={s.subtitle}>AI-Powered District Budget Intelligence Platform</p>

        {/* Upload card */}
        <div style={s.card}>
          <p style={s.sectionTitle}>📂 Load Your Dataset</p>
          <div
            style={s.dropZone(dragOver)}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.json"
              style={{ display:'none' }} onChange={onInputChange} />
            <span style={s.dropIcon}>📊</span>
            <span style={s.dropText}>{dragOver ? 'Drop it here!' : 'Drag & drop your dataset file'}</span>
            <span style={s.dropSub}>Supports .xlsx, .xls, .csv, .json</span>
            <button style={s.browseBtn} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
              Browse Files
            </button>
          </div>

          {fileName && <div style={s.fileChip}><span>📄</span><span>{fileName}</span></div>}
          {parseError && <div style={s.error}>⚠️ {parseError}</div>}
          {missingCols.length > 0 && !parseError && (
            <div style={s.error}>
              <strong>Missing required columns:</strong>
              <div style={s.missingList}>{missingCols.map(c => <span key={c} style={s.missingTag}>{c}</span>)}</div>
            </div>
          )}
          {isValid && (
            <div>
              <div style={s.successBadge}><span>✅</span><span>All required columns detected — {detectedCols.length} columns found</span></div>
              <div style={s.colsRow}>{detectedCols.map(c => <span key={c} style={s.colTag}>{c}</span>)}</div>
            </div>
          )}
        </div>

        {/* Preview table */}
        {previewRows && previewRows.length > 0 && (
          <div style={s.card}>
            <p style={s.sectionTitle}>🔍 Data Preview — First 5 Rows</p>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead><tr>{detectedCols.map(c => <th key={c} style={s.th}>{c}</th>)}</tr></thead>
                <tbody>{previewRows.map((row, ri) => (
                  <tr key={ri} style={ri % 2 === 1 ? s.trEven : {}}>
                    {detectedCols.map(c => <td key={c} style={s.td} title={String(row[c]??'')}>{String(row[c]??'')}</td>)}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={s.card}>
          <button
            style={s.confirmBtn(isValid)}
            disabled={!isValid}
            onClick={() => {
              if (isValid && parsedRows) {
                onDatasetLoaded(normalizeDataset(parsedRows));
              }
            }}
          >
            ✅ Confirm &amp; Load Dataset
          </button>
          <button
            style={s.sampleBtn}
            onMouseEnter={(e) => { e.currentTarget.style.background='rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor='#3B82F6'; e.currentTarget.style.color='#93c5fd'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#1F2D45'; e.currentTarget.style.color='#E2E8F0'; }}
            onClick={() => onDatasetLoaded(normalizeDataset(SAMPLE_FLAT_DATA))}
          >
            🗂️ Use Sample Data (Maharashtra Districts)
          </button>
        </div>

        {/* Template download */}
        <div style={s.templateRow}>
          <button style={s.templateLink} onClick={downloadSampleTemplate}>
            ⬇️ Download sample dataset template (.csv)
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentPage, setCurrentPage]           = useState('dashboard');
  const [leakageTrigger, setLeakageTrigger]     = useState(null);

  // ── Dataset state (null = show upload page) ─────────────────────────────
  const [dataset, setDataset]                   = useState(null);       // flat normalized rows
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
