import React, { useState, useEffect } from 'react';
import { CheckCircle, ChevronDown, Shield } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const SECTORS = ['Healthcare', 'Education', 'Infrastructure', 'Agriculture'];
const SECTOR_COLORS = {
  Healthcare: '#38bdf8',
  Education: '#a78bfa',
  Infrastructure: '#fbbf24',
  Agriculture: '#34d399',
};
const QUARTERS = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
const LEAK_TYPES = [
  { value: 'delay',     label: 'Processing Delay' },
  { value: 'tied',      label: 'Tied Grant' },
  { value: 'capacity',  label: 'Capacity Gap' },
  { value: 'diversion', label: 'Fund Diversion' },
  { value: 'other',     label: 'Other' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STYLES
// ─────────────────────────────────────────────────────────────────────────────
const INPUT_STYLE = {
  background: '#1a2535',
  border: '1px solid #1F2D45',
  borderRadius: '8px',
  padding: '8px 10px',
  color: '#E2E8F0',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};
const READONLY_STYLE = { ...INPUT_STYLE, opacity: 0.55, cursor: 'default' };
const LABEL_STYLE = {
  fontSize: '11px', color: '#64748B', textTransform: 'uppercase',
  letterSpacing: '0.08em', fontWeight: 600, display: 'block', marginBottom: '5px',
};
const CARD = {
  background: '#111827', border: '1px solid #1F2D45',
  borderRadius: '12px', padding: '24px', marginBottom: '16px',
};
const QUARTER_BTN = (active) => ({
  padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
  border: active ? '1px solid #00D4B4' : '1px solid #1F2D45',
  background: active ? 'rgba(0,212,180,0.12)' : '#1a2535',
  color: active ? '#00D4B4' : '#94a3b8', cursor: 'pointer', transition: 'all 0.15s',
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derive a canonical storage key from (user.district) — always lowercase,
 * matching how the app hydrates district IDs.
 * This is the ONLY place we compute distKey across the whole portal.
 */
function toDistKey(districtName) {
  return districtName.toLowerCase();
}

function FocusInput({ value, onChange, placeholder, style }) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      type="number"
      min="0"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...INPUT_STYLE, borderColor: focus ? '#00D4B4' : '#1F2D45', ...style }}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
  );
}

function StatusBadge({ pct }) {
  if (pct === null || pct === undefined || isNaN(pct)) return null;
  const cfg = pct >= 95
    ? { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)', text: '#34d399', label: 'Full Release' }
    : pct >= 80
    ? { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)',  text: '#fbbf24', label: 'Partial' }
    : { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',   text: '#f87171', label: 'Withheld' };
  return (
    <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  );
}

function SelectLeak({ value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: '28px', cursor: 'pointer' }}
      >
        <option value="">Select leak type…</option>
        {LEAK_TYPES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
      </select>
      <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
    </div>
  );
}

function SuccessToast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
      background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.5)',
      borderRadius: '12px', padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <CheckCircle size={18} style={{ color: '#34d399' }} />
      <span style={{ color: '#34d399', fontWeight: 600, fontSize: '14px' }}>{message}</span>
    </div>
  );
}

/** Sticky identity banner at top of each view showing who is logged in */
function IdentityBadge({ user }) {
  const roleColors = { district: '#00D4B4', block: '#60a5fa', gp: '#a78bfa' };
  const color = roleColors[user.role] || '#E2E8F0';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: `${color}10`, border: `1px solid ${color}30`,
      borderRadius: '10px', padding: '10px 16px', marginBottom: '20px',
    }}>
      <Shield size={16} style={{ color }} />
      <span style={{ fontSize: '13px', fontWeight: 600, color }}>
        {user.displayName}
      </span>
      <span style={{ fontSize: '13px', color: '#64748B' }}>·</span>
      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{user.level}</span>
      <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748B' }}>
        Scoped to: <strong style={{ color }}>{user.district} District</strong>
      </span>
    </div>
  );
}

function QuarterSelector({ quarter, setQuarter }) {
  return (
    <div style={{ ...CARD, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>Quarter</label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {QUARTERS.map(q => (
          <button key={q} onClick={() => setQuarter(q)} style={QUARTER_BTN(quarter === q)}>{q}</button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 1 — DISTRICT OFFICER
// Reads/writes data keyed by user.district — never the sidebar district.
// ─────────────────────────────────────────────────────────────────────────────
function DistrictView({ user, allDistricts, officialEntries, onSubmitEntry }) {
  const [quarter, setQuarter] = useState('Q1 2025');
  const [released, setReleased] = useState({});
  const [remarks, setRemarks] = useState('');
  const [toast, setToast] = useState(null);

  // ── Critical: scope to user's own district ──────────────────────────────
  const myDistrict = user.district;                   // e.g. "Aurangabad"
  const distKey    = toDistKey(myDistrict);           // e.g. "aurangabad"
  const qKey       = quarter.replace(' ', '_');       // e.g. "Q1_2025"

  // Find the hydrated district object that matches the OFFICER's district
  const myDistrictObj = allDistricts.find(
    d => d.name.toLowerCase() === distKey
  ) || null;

  // Read existing submission for this officer's district+quarter
  const existing = officialEntries?.[distKey]?.[qKey]?.district;

  useEffect(() => {
    if (existing) {
      const r = {};
      SECTORS.forEach(s => { r[s] = existing.sectors[s]?.released ?? ''; });
      setReleased(r);
      setRemarks(existing.remarks || '');
    } else {
      setReleased({});
      setRemarks('');
    }
  }, [quarter, distKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit() {
    const sectors = {};
    SECTORS.forEach(s => {
      const alloc = myDistrictObj ? (myDistrictObj.allocation[s] || 0) * 100 : 0;
      sectors[s] = {
        allocated: alloc,
        released: parseFloat(released[s]) || 0,
        remarks,
      };
    });
    // Write to officer's own district key — sidebar selection is irrelevant
    onSubmitEntry({ distKey, qKey, role: 'district', data: { submittedBy: user.username, submittedAt: Date.now(), remarks, sectors } });
    setToast(`Entry saved for ${quarter}`);
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {toast && <SuccessToast message={toast} onDone={() => setToast(null)} />}

      <div>
        <h2 className="text-xl font-bold text-text">Fund Release Entry — District HQ</h2>
        <p className="text-text-subtle text-sm mt-0.5">Enter funds released to Block offices this quarter</p>
      </div>

      <IdentityBadge user={user} />
      <QuarterSelector quarter={quarter} setQuarter={setQuarter} />

      {!myDistrictObj && (
        <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#fbbf24', fontSize: '13px' }}>
          ⚠ Your district ({myDistrict}) is not in the current dataset. Allocated amounts will show as 0.
          Load a dataset that includes {myDistrict} to see allocation figures.
        </div>
      )}

      <div style={CARD}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1F2D45' }}>
                {['Sector', 'Allocated (₹L)', 'Released to Block (₹L)', 'Release %', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', color: '#64748B', fontWeight: 600, padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTORS.map((s, i) => {
                const alloc = myDistrictObj ? (myDistrictObj.allocation[s] || 0) * 100 : 0;
                const rel   = parseFloat(released[s]) || 0;
                const pct   = alloc > 0 ? (rel / alloc) * 100 : null;
                return (
                  <tr key={s} style={{ borderBottom: i < SECTORS.length - 1 ? '1px solid #1F2D4530' : 'none' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: SECTOR_COLORS[s] }} />
                        <span style={{ color: '#E2E8F0', fontWeight: 500 }}>{s}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <input type="number" value={alloc.toFixed(2)} readOnly style={{ ...READONLY_STYLE, width: '110px' }} />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <FocusInput
                        value={released[s] ?? ''}
                        onChange={e => setReleased(r => ({ ...r, [s]: e.target.value }))}
                        placeholder="0.00"
                        style={{ width: '110px' }}
                      />
                    </td>
                    <td style={{ padding: '12px', color: pct !== null ? (pct >= 95 ? '#34d399' : pct >= 80 ? '#fbbf24' : '#f87171') : '#64748B', fontWeight: 600 }}>
                      {pct !== null ? `${pct.toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <StatusBadge pct={pct} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label style={LABEL_STYLE}>Remarks (optional)</label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            placeholder="Add any notes about this release…"
            style={{ ...INPUT_STYLE, resize: 'vertical' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-5 flex items-center gap-2 h-[44px] px-6 rounded-[10px] bg-[#00D4B4] text-[#0A0E1A] font-[600] text-[14px] hover:bg-[#00ebd0] transition-colors"
        >
          <CheckCircle size={16} />
          Submit Entry
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 2 — BLOCK OFFICER
// Reads from user's own district's district-officer entry (same district, same
// quarter). Never reads from a different district's entry.
// ─────────────────────────────────────────────────────────────────────────────
function BlockView({ user, officialEntries, onSubmitEntry }) {
  const [quarter, setQuarter] = useState('Q1 2025');
  const [received, setReceived] = useState({});
  const [leakType, setLeakType] = useState({});
  const [releasedToGP, setReleasedToGP] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // ── Critical: scope to user's own district ──────────────────────────────
  const myDistrict = user.district;                 // e.g. "Pune"
  const distKey    = toDistKey(myDistrict);         // e.g. "pune"
  const qKey       = quarter.replace(' ', '_');

  // District officer entry — MUST be same district AND same quarter
  const districtEntry = officialEntries?.[distKey]?.[qKey]?.district;
  // Block officer existing entry for restore
  const blockExisting = officialEntries?.[distKey]?.[qKey]?.block;

  useEffect(() => {
    if (blockExisting) {
      const r = {}, lt = {}, gp = {};
      SECTORS.forEach(s => {
        r[s]  = blockExisting.sectors[s]?.received      ?? '';
        lt[s] = blockExisting.sectors[s]?.leakType      ?? '';
        gp[s] = blockExisting.sectors[s]?.releasedToGP  ?? '';
      });
      setReceived(r); setLeakType(lt); setReleasedToGP(gp);
    } else {
      setReceived({}); setLeakType({}); setReleasedToGP({});
    }
    setErrors({});
  }, [quarter, distKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function validate() {
    const e = {};
    SECTORS.forEach(s => {
      const rec = parseFloat(received[s]) || 0;
      const gp  = parseFloat(releasedToGP[s]) || 0;
      if (gp > rec) e[s] = `Cannot exceed received amount (₹${rec}L)`;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const sectors = {};
    SECTORS.forEach(s => {
      sectors[s] = {
        received:     parseFloat(received[s]) || 0,
        leakType:     leakType[s] || null,
        releasedToGP: parseFloat(releasedToGP[s]) || 0,
      };
    });
    // Write to officer's own district key
    onSubmitEntry({ distKey, qKey, role: 'block', data: { submittedBy: user.username, submittedAt: Date.now(), sectors } });
    setToast(`Block entry saved for ${quarter}`);
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {toast && <SuccessToast message={toast} onDone={() => setToast(null)} />}

      <div>
        <h2 className="text-xl font-bold text-text">Fund Receipt Confirmation — Block Level</h2>
        <p className="text-text-subtle text-sm mt-0.5">Confirm funds received from District HQ and enter releases to Gram Panchayats</p>
      </div>

      <IdentityBadge user={user} />
      <QuarterSelector quarter={quarter} setQuarter={setQuarter} />

      {/* No district-officer entry for this district+quarter → show notice */}
      {!districtEntry && (
        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '8px', padding: '10px 16px', color: '#fbbf24', fontSize: '12px' }}>
          ⏳ District Officer ({myDistrict}) has not yet submitted a release entry for <strong>{quarter}</strong>.
          The "District Released" column will show as pending until they submit.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT — Received from District */}
        <div style={CARD}>
          <h3 style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
            Received from District
          </h3>
          {SECTORS.map(s => {
            // Only pull from same-district, same-quarter district entry
            const distReleased = districtEntry?.sectors?.[s]?.released;
            const rec = parseFloat(received[s]) || 0;
            const ref = parseFloat(distReleased) || 0;
            const pct = ref > 0 ? (rec / ref * 100) : null;
            const showLeak = pct !== null && pct < 100;
            return (
              <div key={s} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #1F2D4540' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: SECTOR_COLORS[s] }} />
                  <span style={{ color: '#E2E8F0', fontWeight: 500, fontSize: '13px' }}>{s}</span>
                  {pct !== null && (
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: pct >= 100 ? '#34d399' : '#f87171', fontWeight: 600 }}>
                      {pct.toFixed(1)}%
                    </span>
                  )}
                </div>

                <label style={LABEL_STYLE}>District Released (₹L)</label>
                {distReleased !== undefined ? (
                  <input type="number" readOnly value={distReleased} style={{ ...READONLY_STYLE, marginBottom: '8px' }} />
                ) : (
                  <>
                    <input type="number" readOnly value="" placeholder="Pending district entry" style={{ ...READONLY_STYLE, marginBottom: '4px' }} />
                    <p style={{ fontSize: '11px', color: '#fbbf24', marginBottom: '8px' }}>⏳ Pending District Entry for {myDistrict}</p>
                  </>
                )}

                <label style={LABEL_STYLE}>Actually Received (₹L)</label>
                <FocusInput
                  value={received[s] ?? ''}
                  onChange={e => setReceived(r => ({ ...r, [s]: e.target.value }))}
                  placeholder="0.00"
                />
                {showLeak && (
                  <div style={{ marginTop: '8px' }}>
                    <label style={LABEL_STYLE}>Leakage Type</label>
                    <SelectLeak value={leakType[s]} onChange={v => setLeakType(lt => ({ ...lt, [s]: v }))} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT — Released to GP */}
        <div style={CARD}>
          <h3 style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
            Released to GP
          </h3>
          {SECTORS.map(s => {
            const rec = parseFloat(received[s]) || 0;
            const gp  = parseFloat(releasedToGP[s]) || 0;
            const pct = rec > 0 ? (gp / rec * 100) : null;
            return (
              <div key={s} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #1F2D4540' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: SECTOR_COLORS[s] }} />
                  <span style={{ color: '#E2E8F0', fontWeight: 500, fontSize: '13px' }}>{s}</span>
                  {pct !== null && (
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#00D4B4', fontWeight: 600 }}>{pct.toFixed(1)}%</span>
                  )}
                </div>
                <label style={LABEL_STYLE}>Releasing to GP (₹L)</label>
                <FocusInput
                  value={releasedToGP[s] ?? ''}
                  onChange={e => setReleasedToGP(r => ({ ...r, [s]: e.target.value }))}
                  placeholder="0.00"
                  style={errors[s] ? { borderColor: '#EF4444' } : {}}
                />
                {errors[s] && (
                  <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>⚠ {errors[s]}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={handleSubmit} className="flex items-center gap-2 h-[44px] px-6 rounded-[10px] bg-[#00D4B4] text-[#0A0E1A] font-[600] text-[14px] hover:bg-[#00ebd0] transition-colors">
        <CheckCircle size={16} />
        Submit Block Entry
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 3 — GP OFFICER
// Reads block entry from user's own district. Never from another district.
// ─────────────────────────────────────────────────────────────────────────────
function GPView({ user, officialEntries, onSubmitEntry }) {
  const [quarter, setQuarter] = useState('Q1 2025');
  const [received, setReceived] = useState({});
  const [leakType, setLeakType] = useState({});
  const [utilised, setUtilised] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // ── Critical: scope to user's own district ──────────────────────────────
  const myDistrict = user.district;
  const distKey    = toDistKey(myDistrict);
  const qKey       = quarter.replace(' ', '_');

  // Block entry from same district + same quarter only
  const blockEntry = officialEntries?.[distKey]?.[qKey]?.block;
  const gpExisting = officialEntries?.[distKey]?.[qKey]?.gp;

  useEffect(() => {
    if (gpExisting) {
      const r = {}, lt = {}, u = {};
      SECTORS.forEach(s => {
        r[s]  = gpExisting.sectors[s]?.received ?? '';
        lt[s] = gpExisting.sectors[s]?.leakType ?? '';
        u[s]  = gpExisting.sectors[s]?.utilised ?? '';
      });
      setReceived(r); setLeakType(lt); setUtilised(u);
    } else {
      setReceived({}); setLeakType({}); setUtilised({});
    }
    setErrors({});
  }, [quarter, distKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function validate() {
    const e = {};
    SECTORS.forEach(s => {
      const rec  = parseFloat(received[s]) || 0;
      const util = parseFloat(utilised[s]) || 0;
      if (util > rec) e[s] = `Cannot exceed received amount (₹${rec}L)`;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const sectors = {};
    SECTORS.forEach(s => {
      sectors[s] = {
        received: parseFloat(received[s]) || 0,
        leakType: leakType[s] || null,
        utilised: parseFloat(utilised[s]) || 0,
      };
    });
    // Write to officer's own district key
    onSubmitEntry({ distKey, qKey, role: 'gp', data: { submittedBy: user.username, submittedAt: Date.now(), sectors } });
    setToast(`GP entry saved for ${quarter}`);
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {toast && <SuccessToast message={toast} onDone={() => setToast(null)} />}

      <div>
        <h2 className="text-xl font-bold text-text">Fund Receipt Confirmation — Gram Panchayat</h2>
        <p className="text-text-subtle text-sm mt-0.5">Confirm funds received from Block office</p>
      </div>

      <IdentityBadge user={user} />
      <QuarterSelector quarter={quarter} setQuarter={setQuarter} />

      {!blockEntry && (
        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '8px', padding: '10px 16px', color: '#fbbf24', fontSize: '12px' }}>
          ⏳ Block Officer ({myDistrict}) has not yet submitted a release entry for <strong>{quarter}</strong>.
          The "Block Released to GP" column will show as pending until they submit.
        </div>
      )}

      <div style={CARD}>
        {SECTORS.map((s, i) => {
          // Only pull from same-district block entry
          const blockReleased = blockEntry?.sectors?.[s]?.releasedToGP;
          const rec    = parseFloat(received[s]) || 0;
          const util   = parseFloat(utilised[s]) || 0;
          const recRef = parseFloat(blockReleased) || 0;
          const recPct  = recRef > 0 ? (rec / recRef * 100) : null;
          const utilPct = rec > 0 ? (util / rec * 100) : null;
          const showLeak = recPct !== null && recPct < 100;

          return (
            <div key={s} style={{ marginBottom: i < SECTORS.length - 1 ? '24px' : 0, paddingBottom: i < SECTORS.length - 1 ? '24px' : 0, borderBottom: i < SECTORS.length - 1 ? '1px solid #1F2D4540' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: SECTOR_COLORS[s] }} />
                <span style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '14px' }}>{s}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label style={LABEL_STYLE}>Block Released to GP (₹L)</label>
                  {blockReleased !== undefined ? (
                    <input type="number" readOnly value={blockReleased} style={READONLY_STYLE} />
                  ) : (
                    <>
                      <input type="number" readOnly value="" placeholder="Pending block entry" style={READONLY_STYLE} />
                      <p style={{ fontSize: '11px', color: '#fbbf24', marginTop: '4px' }}>⏳ Pending Block Entry for {myDistrict}</p>
                    </>
                  )}
                </div>

                <div>
                  <label style={LABEL_STYLE}>Actually Received (₹L)</label>
                  <FocusInput
                    value={received[s] ?? ''}
                    onChange={e => setReceived(r => ({ ...r, [s]: e.target.value }))}
                    placeholder="0.00"
                  />
                  {recPct !== null && (
                    <span style={{ fontSize: '11px', color: recPct >= 100 ? '#34d399' : '#f87171', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                      Receipt: {recPct.toFixed(1)}%
                    </span>
                  )}
                  {showLeak && (
                    <div style={{ marginTop: '8px' }}>
                      <label style={LABEL_STYLE}>Leakage Type</label>
                      <SelectLeak value={leakType[s]} onChange={v => setLeakType(lt => ({ ...lt, [s]: v }))} />
                    </div>
                  )}
                </div>

                <div>
                  <label style={LABEL_STYLE}>Utilised for Beneficiaries (₹L)</label>
                  <FocusInput
                    value={utilised[s] ?? ''}
                    onChange={e => setUtilised(u => ({ ...u, [s]: e.target.value }))}
                    placeholder="0.00"
                    style={errors[s] ? { borderColor: '#EF4444' } : {}}
                  />
                  {utilPct !== null && (
                    <span style={{ fontSize: '11px', color: '#00D4B4', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                      Utilisation: {utilPct.toFixed(1)}%
                    </span>
                  )}
                  {errors[s] && (
                    <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>⚠ {errors[s]}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={handleSubmit} className="mt-6 flex items-center gap-2 h-[44px] px-6 rounded-[10px] bg-[#00D4B4] text-[#0A0E1A] font-[600] text-[14px] hover:bg-[#00ebd0] transition-colors">
          <CheckCircle size={16} />
          Submit GP Entry
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// district prop is NOT passed to the role views — only user.district is used.
// allDistricts is the full hydrated list, used only by DistrictView to find
// the allocation amounts for user.district.
// ─────────────────────────────────────────────────────────────────────────────
export default function DataEntryPortalPage({ user, allDistricts, officialEntries, onSubmitEntry }) {
  if (!user) return null;

  return (
    <div>
      {user.role === 'district' && (
        <DistrictView
          user={user}
          allDistricts={allDistricts}
          officialEntries={officialEntries}
          onSubmitEntry={onSubmitEntry}
        />
      )}
      {user.role === 'block' && (
        <BlockView
          user={user}
          officialEntries={officialEntries}
          onSubmitEntry={onSubmitEntry}
        />
      )}
      {user.role === 'gp' && (
        <GPView
          user={user}
          officialEntries={officialEntries}
          onSubmitEntry={onSubmitEntry}
        />
      )}
    </div>
  );
}
