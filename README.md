# BudgetOS 🏛️

**AI-powered district budget intelligence platform for Maharashtra**

BudgetOS is a full-stack React web application that gives district administrators real-time budget diagnostics, fund-flow leakage investigation, and AI-generated reallocation scenarios — all powered by [Claude AI](https://www.anthropic.com/).

---

## Screenshots

| Dashboard | Pipeline Tracker |
|---|---|
| 5 sector health cards, bar chart, KPI indicators | Fund flow nodes — red = leakage detected |

| AI Agents | Scenario Planner |
|---|---|
| 3 autonomous Claude agents | Natural language → 3 budget scenarios |

---

## Features

### 📊 Dashboard
- 5 sector health cards (Healthcare, Education, Agriculture, Infrastructure, Social Welfare) with allocation %, health scores, and trend arrows
- Bar chart comparing current vs AI-recommended allocation
- District KPI panel: HDI, literacy rate, infant mortality, poverty %, GDP per capita, population (color-coded by threshold)
- 6-year historical allocation line chart (2019–2024)

### 🔗 Pipeline Fund Flow Tracker
- 4-level fund flow visualization: District HQ → Block → Gram Panchayat → End Beneficiary
- Per-sector pipeline showing ₹ amounts and % received at each level
- Red glowing nodes = leakage detected (< 80% received)
- **Click any red node** → auto-navigates to Leakage Investigation Agent with context pre-loaded

### 🤖 AI Agents (3 agents, multi-turn Claude reasoning)

**Agent 1 — Budget Diagnosis**
- 3-step analysis: indicator scan → pipeline trace → history + interventions
- Output: health score ring, critical sector risk bars, leakage table, ranked interventions, 2-sentence summary

**Agent 2 — Scenario Planning**
- Input: any natural language goal (e.g. "Reduce infant mortality by 40%")
- 3-step: goal decomposition → 3 scenario generation → optimal selection
- Output: 3 scenario cards with feasibility scores, recommended scenario with green border, new allocation donut chart, tradeoff table

**Agent 3 — Leakage Investigation**
- Triggered by clicking a red pipeline node
- 3-step: leakage localisation → peer district comparison → fix prescription
- Output: urgency badge, ₹ amount stuck, 2 peer district comparison cards, actor + action + timeline fix

### 📋 Scenario Planner
- Example goal chips (auto-populated with selected district)
- Free-text goal input → runs Scenario Planning Agent

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 (dark theme) |
| Charts | Recharts (bar, line, pie/donut) |
| Icons | Lucide React |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| State | React `useState` / `useReducer` |
| Data | Hardcoded seed data — 8 Maharashtra districts |

---

## Districts Covered

Aurangabad · Nashik · Pune · Nagpur · Solapur · Amravati · Kolhapur · Latur

Each district has: HDI, literacy, infant mortality, poverty rate, GDP per capita, population, sector allocations, fund-flow pipeline data (4 levels × 5 sectors), leakage reason tags, and 6-year historical allocations.

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/passionate-coder26/BudgetOS.git
cd BudgetOS
npm install
```

### 2. Add your Anthropic API key

```bash
cp .env.example .env
# Then edit .env and paste your key:
# VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com)

### 3. Run

```bash
npm run dev
# → http://localhost:5173
```

---

## Agent Architecture

All agents use a **multi-turn messages array** pattern with 3 sequential Claude API calls:

```js
const messages = [];

// Step 1
messages.push({ role: 'user', content: step1Prompt });
const reply1 = await callClaude(messages);           // Claude API call
messages.push({ role: 'assistant', content: reply1 }); // append to history

// Step 2 builds on Step 1 context
messages.push({ role: 'user', content: step2Prompt });
const reply2 = await callClaude(messages);
// ...
```

**Error handling**: Each step is wrapped in `try/catch`. If Step N fails, partial results from Steps 1…N-1 are still shown — the app never crashes silently.

**JSON parsing**: Claude responses are stripped of ` ```json ` fences using regex before `JSON.parse()`.

---

## Project Structure

```
src/
├── data/seedData.js                  ← 8 districts, all seed data
├── utils/claudeApi.js                ← Claude fetch wrapper + JSON parser
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx               ← District selector, nav (mobile-responsive)
│   │   └── TopBar.jsx                ← District name + health score badge
│   ├── dashboard/
│   │   ├── SectorCard.jsx
│   │   ├── AllocationChart.jsx
│   │   └── IndicatorsPanel.jsx
│   └── agents/
│       ├── DiagnosisAgent.jsx        ← Agent 1 (3-step Claude)
│       ├── ScenarioAgent.jsx         ← Agent 2 (3-step Claude)
│       └── LeakageAgent.jsx          ← Agent 3 (3-step Claude)
├── pages/
│   ├── Dashboard.jsx
│   ├── PipelineTrackerPage.jsx
│   ├── AgentsPage.jsx                ← All 3 agent cards
│   └── ScenarioPlannerPage.jsx
└── App.jsx                           ← Routing + cross-page leakage trigger flow
```

---

## Design System

- **Background**: `#0f172a` (dark navy)
- **Cards**: `#1e293b`
- **Primary**: `#1e40af` (deep blue)
- **Danger/Leak**: `#dc2626` (red)
- **Success**: `#16a34a` (green)
- **Warning**: `#d97706` (amber)
- **Text**: `#f1f5f9`

Sector colors are consistent across all charts, pipeline nodes, and cards.

---

## License

MIT
