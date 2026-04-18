// BudgetOS Seed Data — 8 Maharashtra Districts
// All allocations in % (sum to 100 per district)
// Pipeline levels: % of allocated funds actually received at each level

export const SECTORS = ['Healthcare', 'Education', 'Agriculture', 'Infrastructure', 'Social Welfare'];

export const SECTOR_COLORS = {
  Healthcare: '#38bdf8',
  Education: '#a78bfa',
  Agriculture: '#34d399',
  Infrastructure: '#fbbf24',
  'Social Welfare': '#f87171',
};

export const LEAKAGE_REASONS = {
  tied_grant: { label: 'Tied Grant', color: '#fbbf24' },
  delay: { label: 'Processing Delay', color: '#f87171' },
  capacity: { label: 'Capacity Gap', color: '#a78bfa' },
  diversion: { label: 'Fund Diversion', color: '#dc2626' },
};

export const DISTRICTS = [
  {
    id: 'aurangabad',
    name: 'Aurangabad',
    indicators: {
      HDI: 0.61,
      literacyRate: 72.4,
      infantMortality: 38,
      povertyPercent: 24.3,
      gdpPerCapita: 78500,
      population: 3695928,
    },
    healthScore: 54,
    allocation: {
      Healthcare: 18,
      Education: 22,
      Agriculture: 20,
      Infrastructure: 25,
      'Social Welfare': 15,
    },
    recommendedAllocation: {
      Healthcare: 26,
      Education: 25,
      Agriculture: 18,
      Infrastructure: 18,
      'Social Welfare': 13,
    },
    sectorHealth: {
      Healthcare: { score: 42, trend: 'down' },
      Education: { score: 61, trend: 'up' },
      Agriculture: { score: 55, trend: 'stable' },
      Infrastructure: { score: 72, trend: 'up' },
      'Social Welfare': { score: 38, trend: 'down' },
    },
    pipeline: {
      Healthcare: {
        district: { received: 100, amount: 180 },
        block: { received: 76, amount: 137, leakReason: 'delay' },
        gramPanchayat: { received: 61, amount: 110, leakReason: 'capacity' },
        beneficiary: { received: 49, amount: 88, leakReason: 'capacity' },
      },
      Education: {
        district: { received: 100, amount: 220 },
        block: { received: 88, amount: 194, leakReason: null },
        gramPanchayat: { received: 79, amount: 174, leakReason: 'tied_grant' },
        beneficiary: { received: 69, amount: 152, leakReason: 'tied_grant' },
      },
      Agriculture: {
        district: { received: 100, amount: 200 },
        block: { received: 82, amount: 164, leakReason: null },
        gramPanchayat: { received: 71, amount: 142, leakReason: 'capacity' },
        beneficiary: { received: 60, amount: 120, leakReason: 'capacity' },
      },
      Infrastructure: {
        district: { received: 100, amount: 250 },
        block: { received: 91, amount: 228, leakReason: null },
        gramPanchayat: { received: 85, amount: 213, leakReason: null },
        beneficiary: { received: 80, amount: 200, leakReason: null },
      },
      'Social Welfare': {
        district: { received: 100, amount: 150 },
        block: { received: 69, amount: 104, leakReason: 'diversion' },
        gramPanchayat: { received: 53, amount: 80, leakReason: 'diversion' },
        beneficiary: { received: 41, amount: 62, leakReason: 'diversion' },
      },
    },
    history: {
      2019: { Healthcare: 16, Education: 20, Agriculture: 22, Infrastructure: 26, 'Social Welfare': 16 },
      2020: { Healthcare: 17, Education: 21, Agriculture: 21, Infrastructure: 25, 'Social Welfare': 16 },
      2021: { Healthcare: 17, Education: 22, Agriculture: 20, Infrastructure: 26, 'Social Welfare': 15 },
      2022: { Healthcare: 18, Education: 22, Agriculture: 20, Infrastructure: 25, 'Social Welfare': 15 },
      2023: { Healthcare: 18, Education: 22, Agriculture: 20, Infrastructure: 25, 'Social Welfare': 15 },
      2024: { Healthcare: 18, Education: 22, Agriculture: 20, Infrastructure: 25, 'Social Welfare': 15 },
    },
  },
  {
    id: 'nashik',
    name: 'Nashik',
    indicators: {
      HDI: 0.68,
      literacyRate: 80.1,
      infantMortality: 28,
      povertyPercent: 16.2,
      gdpPerCapita: 112000,
      population: 6107187,
    },
    healthScore: 67,
    allocation: {
      Healthcare: 22,
      Education: 26,
      Agriculture: 18,
      Infrastructure: 22,
      'Social Welfare': 12,
    },
    recommendedAllocation: {
      Healthcare: 24,
      Education: 26,
      Agriculture: 16,
      Infrastructure: 22,
      'Social Welfare': 12,
    },
    sectorHealth: {
      Healthcare: { score: 71, trend: 'up' },
      Education: { score: 78, trend: 'up' },
      Agriculture: { score: 64, trend: 'stable' },
      Infrastructure: { score: 74, trend: 'up' },
      'Social Welfare': { score: 60, trend: 'stable' },
    },
    pipeline: {
      Healthcare: {
        district: { received: 100, amount: 220 },
        block: { received: 89, amount: 196, leakReason: null },
        gramPanchayat: { received: 81, amount: 178, leakReason: null },
        beneficiary: { received: 74, amount: 163, leakReason: 'tied_grant' },
      },
      Education: {
        district: { received: 100, amount: 260 },
        block: { received: 92, amount: 239, leakReason: null },
        gramPanchayat: { received: 85, amount: 221, leakReason: null },
        beneficiary: { received: 79, amount: 205, leakReason: 'tied_grant' },
      },
      Agriculture: {
        district: { received: 100, amount: 180 },
        block: { received: 78, amount: 140, leakReason: 'delay' },
        gramPanchayat: { received: 67, amount: 121, leakReason: 'capacity' },
        beneficiary: { received: 58, amount: 104, leakReason: 'capacity' },
      },
      Infrastructure: {
        district: { received: 100, amount: 220 },
        block: { received: 93, amount: 205, leakReason: null },
        gramPanchayat: { received: 86, amount: 189, leakReason: null },
        beneficiary: { received: 80, amount: 176, leakReason: null },
      },
      'Social Welfare': {
        district: { received: 100, amount: 120 },
        block: { received: 84, amount: 101, leakReason: null },
        gramPanchayat: { received: 74, amount: 89, leakReason: 'tied_grant' },
        beneficiary: { received: 66, amount: 79, leakReason: 'capacity' },
      },
    },
    history: {
      2019: { Healthcare: 20, Education: 24, Agriculture: 20, Infrastructure: 22, 'Social Welfare': 14 },
      2020: { Healthcare: 21, Education: 25, Agriculture: 19, Infrastructure: 22, 'Social Welfare': 13 },
      2021: { Healthcare: 21, Education: 25, Agriculture: 19, Infrastructure: 22, 'Social Welfare': 13 },
      2022: { Healthcare: 22, Education: 26, Agriculture: 18, Infrastructure: 22, 'Social Welfare': 12 },
      2023: { Healthcare: 22, Education: 26, Agriculture: 18, Infrastructure: 22, 'Social Welfare': 12 },
      2024: { Healthcare: 22, Education: 26, Agriculture: 18, Infrastructure: 22, 'Social Welfare': 12 },
    },
  },
  {
    id: 'pune',
    name: 'Pune',
    indicators: {
      HDI: 0.76,
      literacyRate: 86.2,
      infantMortality: 19,
      povertyPercent: 9.8,
      gdpPerCapita: 198000,
      population: 9429408,
    },
    healthScore: 79,
    allocation: {
      Healthcare: 24,
      Education: 28,
      Agriculture: 12,
      Infrastructure: 26,
      'Social Welfare': 10,
    },
    recommendedAllocation: {
      Healthcare: 22,
      Education: 28,
      Agriculture: 12,
      Infrastructure: 28,
      'Social Welfare': 10,
    },
    sectorHealth: {
      Healthcare: { score: 84, trend: 'up' },
      Education: { score: 88, trend: 'up' },
      Agriculture: { score: 71, trend: 'stable' },
      Infrastructure: { score: 82, trend: 'up' },
      'Social Welfare': { score: 72, trend: 'stable' },
    },
    pipeline: {
      Healthcare: {
        district: { received: 100, amount: 240 },
        block: { received: 94, amount: 226, leakReason: null },
        gramPanchayat: { received: 88, amount: 211, leakReason: null },
        beneficiary: { received: 83, amount: 199, leakReason: null },
      },
      Education: {
        district: { received: 100, amount: 280 },
        block: { received: 95, amount: 266, leakReason: null },
        gramPanchayat: { received: 90, amount: 252, leakReason: null },
        beneficiary: { received: 86, amount: 241, leakReason: null },
      },
      Agriculture: {
        district: { received: 100, amount: 120 },
        block: { received: 88, amount: 106, leakReason: null },
        gramPanchayat: { received: 80, amount: 96, leakReason: null },
        beneficiary: { received: 75, amount: 90, leakReason: 'tied_grant' },
      },
      Infrastructure: {
        district: { received: 100, amount: 260 },
        block: { received: 96, amount: 250, leakReason: null },
        gramPanchayat: { received: 91, amount: 237, leakReason: null },
        beneficiary: { received: 87, amount: 226, leakReason: null },
      },
      'Social Welfare': {
        district: { received: 100, amount: 100 },
        block: { received: 89, amount: 89, leakReason: null },
        gramPanchayat: { received: 82, amount: 82, leakReason: null },
        beneficiary: { received: 76, amount: 76, leakReason: 'tied_grant' },
      },
    },
    history: {
      2019: { Healthcare: 22, Education: 25, Agriculture: 14, Infrastructure: 28, 'Social Welfare': 11 },
      2020: { Healthcare: 23, Education: 26, Agriculture: 13, Infrastructure: 27, 'Social Welfare': 11 },
      2021: { Healthcare: 23, Education: 27, Agriculture: 13, Infrastructure: 26, 'Social Welfare': 11 },
      2022: { Healthcare: 24, Education: 28, Agriculture: 12, Infrastructure: 26, 'Social Welfare': 10 },
      2023: { Healthcare: 24, Education: 28, Agriculture: 12, Infrastructure: 26, 'Social Welfare': 10 },
      2024: { Healthcare: 24, Education: 28, Agriculture: 12, Infrastructure: 26, 'Social Welfare': 10 },
    },
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    indicators: {
      HDI: 0.69,
      literacyRate: 83.1,
      infantMortality: 25,
      povertyPercent: 14.6,
      gdpPerCapita: 125000,
      population: 4653570,
    },
    healthScore: 71,
    allocation: {
      Healthcare: 23,
      Education: 25,
      Agriculture: 16,
      Infrastructure: 24,
      'Social Welfare': 12,
    },
    recommendedAllocation: {
      Healthcare: 25,
      Education: 26,
      Agriculture: 15,
      Infrastructure: 22,
      'Social Welfare': 12,
    },
    sectorHealth: {
      Healthcare: { score: 75, trend: 'up' },
      Education: { score: 79, trend: 'stable' },
      Agriculture: { score: 66, trend: 'down' },
      Infrastructure: { score: 77, trend: 'up' },
      'Social Welfare': { score: 61, trend: 'stable' },
    },
    pipeline: {
      Healthcare: {
        district: { received: 100, amount: 230 },
        block: { received: 90, amount: 207, leakReason: null },
        gramPanchayat: { received: 83, amount: 191, leakReason: null },
        beneficiary: { received: 76, amount: 175, leakReason: 'tied_grant' },
      },
      Education: {
        district: { received: 100, amount: 250 },
        block: { received: 91, amount: 228, leakReason: null },
        gramPanchayat: { received: 84, amount: 210, leakReason: null },
        beneficiary: { received: 78, amount: 195, leakReason: 'tied_grant' },
      },
      Agriculture: {
        district: { received: 100, amount: 160 },
        block: { received: 74, amount: 118, leakReason: 'delay' },
        gramPanchayat: { received: 62, amount: 99, leakReason: 'capacity' },
        beneficiary: { received: 51, amount: 82, leakReason: 'diversion' },
      },
      Infrastructure: {
        district: { received: 100, amount: 240 },
        block: { received: 93, amount: 223, leakReason: null },
        gramPanchayat: { received: 88, amount: 211, leakReason: null },
        beneficiary: { received: 82, amount: 197, leakReason: null },
      },
      'Social Welfare': {
        district: { received: 100, amount: 120 },
        block: { received: 85, amount: 102, leakReason: null },
        gramPanchayat: { received: 76, amount: 91, leakReason: 'tied_grant' },
        beneficiary: { received: 68, amount: 82, leakReason: 'capacity' },
      },
    },
    history: {
      2019: { Healthcare: 21, Education: 23, Agriculture: 18, Infrastructure: 26, 'Social Welfare': 12 },
      2020: { Healthcare: 22, Education: 24, Agriculture: 17, Infrastructure: 25, 'Social Welfare': 12 },
      2021: { Healthcare: 22, Education: 24, Agriculture: 17, Infrastructure: 25, 'Social Welfare': 12 },
      2022: { Healthcare: 23, Education: 25, Agriculture: 16, Infrastructure: 24, 'Social Welfare': 12 },
      2023: { Healthcare: 23, Education: 25, Agriculture: 16, Infrastructure: 24, 'Social Welfare': 12 },
      2024: { Healthcare: 23, Education: 25, Agriculture: 16, Infrastructure: 24, 'Social Welfare': 12 },
    },
  },
  {
    id: 'solapur',
    name: 'Solapur',
    indicators: {
      HDI: 0.58,
      literacyRate: 68.9,
      infantMortality: 44,
      povertyPercent: 28.7,
      gdpPerCapita: 62000,
      population: 4317756,
    },
    healthScore: 44,
    allocation: {
      Healthcare: 16,
      Education: 20,
      Agriculture: 24,
      Infrastructure: 22,
      'Social Welfare': 18,
    },
    recommendedAllocation: {
      Healthcare: 28,
      Education: 24,
      Agriculture: 20,
      Infrastructure: 16,
      'Social Welfare': 12,
    },
    sectorHealth: {
      Healthcare: { score: 32, trend: 'down' },
      Education: { score: 48, trend: 'down' },
      Agriculture: { score: 51, trend: 'stable' },
      Infrastructure: { score: 58, trend: 'stable' },
      'Social Welfare': { score: 39, trend: 'down' },
    },
    pipeline: {
      Healthcare: {
        district: { received: 100, amount: 160 },
        block: { received: 68, amount: 109, leakReason: 'delay' },
        gramPanchayat: { received: 52, amount: 83, leakReason: 'capacity' },
        beneficiary: { received: 39, amount: 62, leakReason: 'diversion' },
      },
      Education: {
        district: { received: 100, amount: 200 },
        block: { received: 77, amount: 154, leakReason: 'delay' },
        gramPanchayat: { received: 63, amount: 126, leakReason: 'capacity' },
        beneficiary: { received: 52, amount: 104, leakReason: 'capacity' },
      },
      Agriculture: {
        district: { received: 100, amount: 240 },
        block: { received: 85, amount: 204, leakReason: null },
        gramPanchayat: { received: 77, amount: 185, leakReason: 'tied_grant' },
        beneficiary: { received: 67, amount: 161, leakReason: 'tied_grant' },
      },
      Infrastructure: {
        district: { received: 100, amount: 220 },
        block: { received: 87, amount: 191, leakReason: null },
        gramPanchayat: { received: 79, amount: 174, leakReason: 'tied_grant' },
        beneficiary: { received: 71, amount: 156, leakReason: 'capacity' },
      },
      'Social Welfare': {
        district: { received: 100, amount: 180 },
        block: { received: 63, amount: 113, leakReason: 'diversion' },
        gramPanchayat: { received: 48, amount: 86, leakReason: 'diversion' },
        beneficiary: { received: 34, amount: 61, leakReason: 'diversion' },
      },
    },
    history: {
      2019: { Healthcare: 17, Education: 22, Agriculture: 23, Infrastructure: 22, 'Social Welfare': 16 },
      2020: { Healthcare: 16, Education: 21, Agriculture: 23, Infrastructure: 22, 'Social Welfare': 18 },
      2021: { Healthcare: 16, Education: 20, Agriculture: 24, Infrastructure: 22, 'Social Welfare': 18 },
      2022: { Healthcare: 16, Education: 20, Agriculture: 24, Infrastructure: 22, 'Social Welfare': 18 },
      2023: { Healthcare: 16, Education: 20, Agriculture: 24, Infrastructure: 22, 'Social Welfare': 18 },
      2024: { Healthcare: 16, Education: 20, Agriculture: 24, Infrastructure: 22, 'Social Welfare': 18 },
    },
  },
  {
    id: 'amravati',
    name: 'Amravati',
    indicators: {
      HDI: 0.63,
      literacyRate: 76.5,
      infantMortality: 33,
      povertyPercent: 21.4,
      gdpPerCapita: 71000,
      population: 2887826,
    },
    healthScore: 58,
    allocation: {
      Healthcare: 20,
      Education: 23,
      Agriculture: 22,
      Infrastructure: 21,
      'Social Welfare': 14,
    },
    recommendedAllocation: {
      Healthcare: 24,
      Education: 25,
      Agriculture: 20,
      Infrastructure: 19,
      'Social Welfare': 12,
    },
    sectorHealth: {
      Healthcare: { score: 55, trend: 'stable' },
      Education: { score: 63, trend: 'up' },
      Agriculture: { score: 61, trend: 'stable' },
      Infrastructure: { score: 64, trend: 'up' },
      'Social Welfare': { score: 47, trend: 'down' },
    },
    pipeline: {
      Healthcare: {
        district: { received: 100, amount: 200 },
        block: { received: 81, amount: 162, leakReason: null },
        gramPanchayat: { received: 70, amount: 140, leakReason: 'capacity' },
        beneficiary: { received: 60, amount: 120, leakReason: 'capacity' },
      },
      Education: {
        district: { received: 100, amount: 230 },
        block: { received: 86, amount: 198, leakReason: null },
        gramPanchayat: { received: 78, amount: 179, leakReason: 'tied_grant' },
        beneficiary: { received: 70, amount: 161, leakReason: 'tied_grant' },
      },
      Agriculture: {
        district: { received: 100, amount: 220 },
        block: { received: 84, amount: 185, leakReason: null },
        gramPanchayat: { received: 74, amount: 163, leakReason: 'capacity' },
        beneficiary: { received: 64, amount: 141, leakReason: 'capacity' },
      },
      Infrastructure: {
        district: { received: 100, amount: 210 },
        block: { received: 90, amount: 189, leakReason: null },
        gramPanchayat: { received: 83, amount: 174, leakReason: null },
        beneficiary: { received: 77, amount: 162, leakReason: 'tied_grant' },
      },
      'Social Welfare': {
        district: { received: 100, amount: 140 },
        block: { received: 72, amount: 101, leakReason: 'delay' },
        gramPanchayat: { received: 59, amount: 83, leakReason: 'diversion' },
        beneficiary: { received: 46, amount: 64, leakReason: 'diversion' },
      },
    },
    history: {
      2019: { Healthcare: 19, Education: 22, Agriculture: 24, Infrastructure: 21, 'Social Welfare': 14 },
      2020: { Healthcare: 20, Education: 22, Agriculture: 22, Infrastructure: 21, 'Social Welfare': 15 },
      2021: { Healthcare: 20, Education: 23, Agriculture: 22, Infrastructure: 21, 'Social Welfare': 14 },
      2022: { Healthcare: 20, Education: 23, Agriculture: 22, Infrastructure: 21, 'Social Welfare': 14 },
      2023: { Healthcare: 20, Education: 23, Agriculture: 22, Infrastructure: 21, 'Social Welfare': 14 },
      2024: { Healthcare: 20, Education: 23, Agriculture: 22, Infrastructure: 21, 'Social Welfare': 14 },
    },
  },
  {
    id: 'kolhapur',
    name: 'Kolhapur',
    indicators: {
      HDI: 0.71,
      literacyRate: 82.4,
      infantMortality: 22,
      povertyPercent: 12.1,
      gdpPerCapita: 142000,
      population: 3876001,
    },
    healthScore: 73,
    allocation: {
      Healthcare: 23,
      Education: 26,
      Agriculture: 17,
      Infrastructure: 22,
      'Social Welfare': 12,
    },
    recommendedAllocation: {
      Healthcare: 24,
      Education: 26,
      Agriculture: 16,
      Infrastructure: 23,
      'Social Welfare': 11,
    },
    sectorHealth: {
      Healthcare: { score: 78, trend: 'up' },
      Education: { score: 82, trend: 'up' },
      Agriculture: { score: 68, trend: 'stable' },
      Infrastructure: { score: 75, trend: 'stable' },
      'Social Welfare': { score: 64, trend: 'up' },
    },
    pipeline: {
      Healthcare: {
        district: { received: 100, amount: 230 },
        block: { received: 91, amount: 209, leakReason: null },
        gramPanchayat: { received: 84, amount: 193, leakReason: null },
        beneficiary: { received: 78, amount: 179, leakReason: 'tied_grant' },
      },
      Education: {
        district: { received: 100, amount: 260 },
        block: { received: 93, amount: 242, leakReason: null },
        gramPanchayat: { received: 87, amount: 226, leakReason: null },
        beneficiary: { received: 81, amount: 211, leakReason: null },
      },
      Agriculture: {
        district: { received: 100, amount: 170 },
        block: { received: 82, amount: 139, leakReason: null },
        gramPanchayat: { received: 74, amount: 126, leakReason: 'tied_grant' },
        beneficiary: { received: 67, amount: 114, leakReason: 'tied_grant' },
      },
      Infrastructure: {
        district: { received: 100, amount: 220 },
        block: { received: 92, amount: 202, leakReason: null },
        gramPanchayat: { received: 85, amount: 187, leakReason: null },
        beneficiary: { received: 80, amount: 176, leakReason: null },
      },
      'Social Welfare': {
        district: { received: 100, amount: 120 },
        block: { received: 86, amount: 103, leakReason: null },
        gramPanchayat: { received: 78, amount: 94, leakReason: 'tied_grant' },
        beneficiary: { received: 71, amount: 85, leakReason: 'capacity' },
      },
    },
    history: {
      2019: { Healthcare: 21, Education: 24, Agriculture: 19, Infrastructure: 23, 'Social Welfare': 13 },
      2020: { Healthcare: 22, Education: 25, Agriculture: 18, Infrastructure: 22, 'Social Welfare': 13 },
      2021: { Healthcare: 22, Education: 25, Agriculture: 18, Infrastructure: 22, 'Social Welfare': 13 },
      2022: { Healthcare: 23, Education: 26, Agriculture: 17, Infrastructure: 22, 'Social Welfare': 12 },
      2023: { Healthcare: 23, Education: 26, Agriculture: 17, Infrastructure: 22, 'Social Welfare': 12 },
      2024: { Healthcare: 23, Education: 26, Agriculture: 17, Infrastructure: 22, 'Social Welfare': 12 },
    },
  },
  {
    id: 'latur',
    name: 'Latur',
    indicators: {
      HDI: 0.55,
      literacyRate: 64.3,
      infantMortality: 52,
      povertyPercent: 33.8,
      gdpPerCapita: 48000,
      population: 2454196,
    },
    healthScore: 36,
    allocation: {
      Healthcare: 15,
      Education: 19,
      Agriculture: 26,
      Infrastructure: 22,
      'Social Welfare': 18,
    },
    recommendedAllocation: {
      Healthcare: 30,
      Education: 26,
      Agriculture: 20,
      Infrastructure: 14,
      'Social Welfare': 10,
    },
    sectorHealth: {
      Healthcare: { score: 24, trend: 'down' },
      Education: { score: 38, trend: 'down' },
      Agriculture: { score: 47, trend: 'stable' },
      Infrastructure: { score: 52, trend: 'stable' },
      'Social Welfare': { score: 30, trend: 'down' },
    },
    pipeline: {
      Healthcare: {
        district: { received: 100, amount: 150 },
        block: { received: 62, amount: 93, leakReason: 'delay' },
        gramPanchayat: { received: 45, amount: 68, leakReason: 'capacity' },
        beneficiary: { received: 31, amount: 47, leakReason: 'diversion' },
      },
      Education: {
        district: { received: 100, amount: 190 },
        block: { received: 70, amount: 133, leakReason: 'delay' },
        gramPanchayat: { received: 55, amount: 105, leakReason: 'capacity' },
        beneficiary: { received: 43, amount: 82, leakReason: 'capacity' },
      },
      Agriculture: {
        district: { received: 100, amount: 260 },
        block: { received: 83, amount: 216, leakReason: null },
        gramPanchayat: { received: 72, amount: 187, leakReason: 'tied_grant' },
        beneficiary: { received: 61, amount: 159, leakReason: 'tied_grant' },
      },
      Infrastructure: {
        district: { received: 100, amount: 220 },
        block: { received: 85, amount: 187, leakReason: null },
        gramPanchayat: { received: 76, amount: 167, leakReason: 'tied_grant' },
        beneficiary: { received: 67, amount: 147, leakReason: 'capacity' },
      },
      'Social Welfare': {
        district: { received: 100, amount: 180 },
        block: { received: 58, amount: 104, leakReason: 'diversion' },
        gramPanchayat: { received: 42, amount: 76, leakReason: 'diversion' },
        beneficiary: { received: 28, amount: 50, leakReason: 'diversion' },
      },
    },
    history: {
      2019: { Healthcare: 16, Education: 20, Agriculture: 25, Infrastructure: 22, 'Social Welfare': 17 },
      2020: { Healthcare: 15, Education: 19, Agriculture: 26, Infrastructure: 22, 'Social Welfare': 18 },
      2021: { Healthcare: 15, Education: 19, Agriculture: 26, Infrastructure: 22, 'Social Welfare': 18 },
      2022: { Healthcare: 15, Education: 19, Agriculture: 26, Infrastructure: 22, 'Social Welfare': 18 },
      2023: { Healthcare: 15, Education: 19, Agriculture: 26, Infrastructure: 22, 'Social Welfare': 18 },
      2024: { Healthcare: 15, Education: 19, Agriculture: 26, Infrastructure: 22, 'Social Welfare': 18 },
    },
  },
];

export function getDistrict(id) {
  return DISTRICTS.find(d => d.id === id) || DISTRICTS[0];
}

export function getScoreColor(score) {
  if (score >= 75) return '#16a34a';
  if (score >= 55) return '#d97706';
  return '#dc2626';
}

export function getScoreLabel(score) {
  if (score >= 75) return 'Healthy';
  if (score >= 55) return 'At Risk';
  return 'Critical';
}

export function isLeaking(received) {
  return received < 80;
}
