# CreativeOps Hub

A creative operations system for managing ad production from idea to live campaign.

---

## Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Query, Zustand, Recharts |
| Backend  | Supabase (PostgreSQL 15, PostgREST, Realtime) |
| Hosting  | Vercel (frontend) + Supabase Cloud (backend) |

---

## Quickstart

### 1. Clone and install

```bash
git clone https://github.com/your-org/creativeops-hub.git
cd creativeops-hub
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:
- `VITE_SUPABASE_URL` — from Supabase Dashboard → Settings → API → Project URL
- `VITE_SUPABASE_ANON_KEY` — from Supabase Dashboard → Settings → API → anon public key

> **Without these set**, the app runs in demo mode using local seed data. No database required for development.

### 3. Run locally

```bash
npm run dev
```

App runs at http://localhost:5173

---

## Database Setup (Supabase)

### Prerequisites
```bash
npm install -g supabase
supabase login
```

### Link to your project
```bash
supabase init
supabase link --project-ref YOUR_PROJECT_REF
```

### Apply all migrations
```bash
supabase db push
```

### Local development (no cloud needed)
```bash
supabase start        # starts local Postgres + API
supabase db reset     # reapply all migrations + seed data
supabase stop         # shut down local stack
```

---

## Project Structure

```
creativeops-hub/
├── src/
│   ├── main.jsx                    # Entry point — providers
│   ├── App.jsx                     # Router
│   ├── index.css                   # Tailwind + global styles
│   │
│   ├── lib/
│   │   ├── supabase.js             # Supabase client (singleton)
│   │   ├── queryClient.js          # React Query config
│   │   ├── transitions.js          # Stage rules + canMove()
│   │   ├── constants.js            # Team, colours, enums
│   │   └── seedData.js             # Demo data (no DB mode)
│   │
│   ├── store/
│   │   └── useAppStore.js          # Zustand: activeUser, notifications, modals
│   │
│   ├── hooks/
│   │   ├── useAds.js               # All ad CRUD + realtime
│   │   ├── useIdeas.js             # Ideas library CRUD
│   │   ├── useLearnings.js         # Learnings log CRUD
│   │   └── useMetrics.js           # All 8 KPI calculations
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx        # Root layout with outlet
│   │   │   ├── NavBar.jsx          # Top navigation + user selector
│   │   │   ├── MetricsBar.jsx      # 8 live KPI tiles
│   │   │   └── Notifications.jsx   # Toast stack
│   │   │
│   │   ├── pipeline/
│   │   │   ├── AdCard.jsx          # Individual ad card (used everywhere)
│   │   │   └── StageColumn.jsx     # Single kanban column
│   │   │
│   │   └── shared/
│   │       ├── AdModal.jsx         # Ad detail + time log + move actions
│   │       ├── NewAdModal.jsx      # Create new ad form
│   │       ├── Badge.jsx           # Coloured label pill
│   │       └── EmptyState.jsx      # Empty list placeholder
│   │
│   └── pages/
│       ├── PipelinePage.jsx        # Kanban board
│       ├── DashboardPage.jsx       # Role-based personal queue
│       ├── TeamPage.jsx            # Manager team overview
│       ├── ReportsPage.jsx         # 5 live charts
│       ├── IdeasPage.jsx           # Ideas library
│       └── LearningsPage.jsx       # Learnings log
│
└── supabase/
    ├── config.toml
    └── migrations/
        ├── 20260318000001_create_ads.sql
        ├── 20260318000002_create_activity_log.sql
        ├── 20260318000003_create_ideas_learnings.sql
        ├── 20260318000004_move_ad_stage.sql
        ├── 20260318000005_functions_and_triggers.sql
        ├── 20260318000006_rls_policies.sql
        └── 20260318000007_realtime_and_seed.sql
```

---

## Key Architectural Decisions

### Single source of truth
Every component calls `useAds()`. There is no local ad state outside of React Query's cache. When any ad changes, all components update automatically via the realtime subscription.

### Rules enforced in two places
Stage transition rules live in both `src/lib/transitions.js` (frontend UX) and `supabase/migrations/20260318000004_move_ad_stage.sql` (backend authority). The frontend blocks invalid moves for instant feedback. The database function is the authoritative check — even direct API calls cannot bypass it.

### Demo mode
When `VITE_SUPABASE_URL` is not set, the app runs on local seed data with all mutations applied in-memory via `queryClient.setQueryData()`. This lets you develop the UI without a Supabase project.

### Zustand vs React Query
- **React Query** owns all server data (ads, ideas, learnings)
- **Zustand** owns UI-only state (activeUser, selectedAdId, notifications, modal visibility)
- Never store fetched data in Zustand

---

## Deployment

### Frontend → Vercel
1. Push repo to GitHub
2. Import project in vercel.com
3. Add env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-detects Vite

Every push to `main` auto-deploys. PRs get preview URLs.

### Backend → Supabase Cloud
```bash
supabase link --project-ref YOUR_REF
supabase db push
```

---

## Env Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `.env` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` | Public anon key (safe in browser) |

> The `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS. **Never put it in the frontend.**

---

## Pipeline Stages & Transitions

```
Idea
 └─► Brief Writing
      └─► Brief Review
           ├─► Brief Writing  (send back)
           └─► Ad Creation
                └─► Ad Review
                     ├─► Ad Revision  (max 2 rounds, then locked)
                     │    └─► Ad Review
                     └─► Pending Upload
                          └─► Testing  (locked for 10 days)
                               ├─► Winner
                               └─► Loser
```

---

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # ESLint
```
