# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)

## Application: AI Money Mentor

India-first personal finance copilot with 3 core modules:

### Module 1: Money Health Score
- 5-step onboarding form
- Calculates a score out of 100 across 6 dimensions: Emergency Preparedness, Insurance Adequacy, Debt Health, Tax Efficiency, Investment Diversification, Retirement Readiness
- Returns grade (A+/A/B+/B/C/D), alerts, and actionable recommendations
- API: `POST /api/money-health/score`

### Module 2: FIRE Path Planner
- Planning form with goals (home, education, retirement, etc.)
- Calculates FIRE number, retirement corpus, monthly SIP, asset allocation
- Month-by-month retirement corpus projections
- Tax optimization tips, insurance gap analysis, action checklist
- API: `POST /api/fire-planner/plan`

### Module 3: Mutual Fund Portfolio X-Ray
- PDF file upload (CAMS/KFintech) or sample data demo
- Holdings analysis, XIRR, category allocation, fund overlap detection
- Expense ratio drag, benchmark comparison, rebalancing suggestions
- API: `POST /api/portfolio/analyze` (multipart form)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (routes: moneyHealth, firePlanner, portfolio)
│   └── ai-money-mentor/    # React + Vite frontend (serves at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## API Routes

All routes prefixed with `/api`:
- `GET /api/healthz` — health check
- `POST /api/money-health/score` — calculate Money Health Score
- `POST /api/fire-planner/plan` — generate FIRE Path Plan
- `POST /api/portfolio/analyze` — analyze mutual fund portfolio (multipart, optional file)

## Key Dependencies

### Frontend (ai-money-mentor)
- React + Vite, TypeScript
- Tailwind CSS (dark fintech theme)
- Recharts (charts/graphs)
- react-hook-form + zod (form validation)
- framer-motion (animations)
- @workspace/api-client-react (generated React Query hooks)

### Backend (api-server)
- Express 5
- multer (file upload handling)
- zod (input validation)
- pino (structured logging)
