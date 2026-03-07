# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Lint:** `npm run lint`
- **Run all tests:** `npx vitest run`
- **Run single test:** `npx vitest run src/components/task-lists/__tests__/TaskListView.test.tsx`
- **Run tests in watch mode:** `npx vitest`

## Architecture

React 19 + TypeScript SPA using Vite, Tailwind CSS 4, and Supabase (PostgreSQL backend). Deployed on Vercel.

### Routing & Pages

Three top-level routes defined in `src/App.tsx` via React Router:
- `/` — **Today**: tasks scheduled for today, AI planner panel
- `/tasks` — **Tasks**: all tasks organized into named lists with subtask support
- `/goals` — **Goals**: goals across 1-year, 5-year, 10-year horizons

### Data Flow

Pages are thin wrappers that connect hooks to view components:
- `src/pages/` — page containers that wire hooks to components
- `src/hooks/` — custom hooks encapsulating all state management and Supabase queries (`useTaskLists`, `useTodayTasks`, `useGoals`, `useAiPlanner`)
- `src/components/` — UI components organized by feature domain (`shell/`, `task-lists/`, `today/`, `goal-planning/`)
- `src/types/` — shared TypeScript interfaces (`task-lists.ts`, `goal-planning.ts`)

### Database

Supabase with schema `taskhub`. Migrations in `supabase/migrations/` (numbered sequentially). Tables: `task_lists`, `tasks` (with parent/subtask hierarchy via `parent_id`), `goals` (with `horizon_id`). Database uses snake_case; app code maps to camelCase in hooks.

### External Services

- **Supabase** — database and auth (`src/lib/supabase.ts`)
- **OpenAI** — GPT-4o-mini for AI task planning suggestions (`src/lib/openai.ts`, `src/hooks/useAiPlanner.ts`)
- Environment variables prefixed with `VITE_` (see `.env`)

## Conventions

- Tailwind utility classes for all styling; dark mode via `dark:` variants
- Color palette: stone (neutral), indigo (primary), amber (secondary), emerald (success), red (danger)
- Tests colocated in `__tests__/` directories next to components, using Vitest + React Testing Library
- Functional components with typed props interfaces
- Optimistic UI updates with error recovery in hooks
