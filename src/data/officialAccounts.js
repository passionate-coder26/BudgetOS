// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL ACCOUNTS — Hardcoded demo credentials (no backend)
// ─────────────────────────────────────────────────────────────────────────────

export const OFFICIAL_ACCOUNTS = [
  // ── District Officers ───────────────────────────────────────────────────
  { username: 'district_aurangabad', password: 'dist123', role: 'district', district: 'Aurangabad', level: 'District Officer', displayName: 'D.O. Aurangabad' },
  { username: 'district_pune',       password: 'dist123', role: 'district', district: 'Pune',       level: 'District Officer', displayName: 'D.O. Pune' },
  { username: 'district_nashik',     password: 'dist123', role: 'district', district: 'Nashik',     level: 'District Officer', displayName: 'D.O. Nashik' },
  { username: 'district_nagpur',     password: 'dist123', role: 'district', district: 'Nagpur',     level: 'District Officer', displayName: 'D.O. Nagpur' },
  { username: 'district_latur',      password: 'dist123', role: 'district', district: 'Latur',      level: 'District Officer', displayName: 'D.O. Latur' },

  // ── Block Officers ──────────────────────────────────────────────────────
  { username: 'block_aurangabad_1',  password: 'block123', role: 'block', district: 'Aurangabad', level: 'Block Officer', displayName: 'Block Officer Aurangabad-1' },
  { username: 'block_pune_1',        password: 'block123', role: 'block', district: 'Pune',       level: 'Block Officer', displayName: 'Block Officer Pune-1' },
  { username: 'block_nashik_1',      password: 'block123', role: 'block', district: 'Nashik',     level: 'Block Officer', displayName: 'Block Officer Nashik-1' },

  // ── GP Officers ─────────────────────────────────────────────────────────
  { username: 'gp_aurangabad_1',     password: 'gp123', role: 'gp', district: 'Aurangabad', level: 'GP Officer', displayName: 'GP Officer Aurangabad-1' },
  { username: 'gp_pune_1',           password: 'gp123', role: 'gp', district: 'Pune',       level: 'GP Officer', displayName: 'GP Officer Pune-1' },
  { username: 'gp_nashik_1',         password: 'gp123', role: 'gp', district: 'Nashik',     level: 'GP Officer', displayName: 'GP Officer Nashik-1' },
];

export function authenticate(username, password) {
  return OFFICIAL_ACCOUNTS.find(
    (a) => a.username === username && a.password === password
  ) || null;
}

export function detectRoleFromUsername(username) {
  if (username.startsWith('district_')) return 'District Officer';
  if (username.startsWith('block_'))    return 'Block Officer';
  if (username.startsWith('gp_'))       return 'GP Officer';
  return null;
}
