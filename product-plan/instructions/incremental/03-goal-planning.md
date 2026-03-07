# Milestone 3: Goal Planning

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell) complete

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Implement the Goal Planning feature — a dedicated space for users to define and manage long-term ambitions across three time horizons.

## Overview

Goal Planning helps users think beyond daily tasks and articulate where they want to be in 1, 5, and 10 years. Goals are organized into three fixed horizon tabs and displayed as compact, editable rows. All interactions happen inline — no modals or separate pages.

**Key Functionality:**
- Three fixed time horizons: 1 Year, 5 Years, 10 Years
- Goals have a required title and optional description
- Inline goal creation: click "Add goal", type, press Enter or "Save goal"
- Inline title and description editing by clicking directly on the text
- Delete a goal with a single click on the × icon (no confirmation)
- Each tab shows a goal count badge

## Components Provided

Copy from `product-plan/sections/goal-planning/components/`:

- `GoalPlanningView.tsx` — Main section component with horizon tabs and inline goal management
- `GoalRow.tsx` — Individual goal row with inline editing and delete
- `index.ts` — Exports

## Props Reference

See `types.ts` for full definitions.

**Data props:**

```typescript
type HorizonId = '1-year' | '5-year' | '10-year'

interface Horizon {
  id: HorizonId
  label: string     // "1 Year", "5 Years", "10 Years"
  goals: Goal[]
}

interface Goal {
  id: string
  title: string
  description?: string
}
```

**Callback props:**

| Callback | Triggered When |
|----------|---------------|
| `onCreateGoal` | User saves a new goal (fires with horizon ID, title, and optional description) |
| `onEditGoalTitle` | User edits a goal's title inline |
| `onEditGoalDescription` | User edits a goal's description inline |
| `onDeleteGoal` | User clicks the × delete icon on a goal |

## Expected User Flows

### Flow 1: Create a Goal

1. User clicks "Add goal" below the list (or "Add your first goal →" in empty state)
2. An inline row appears with a focused title input
3. User types a title and presses Enter — description textarea appears
4. User optionally types a description and presses Enter to save
5. **Outcome:** `onCreateGoal` is called with the horizon ID, title, and description

### Flow 2: Edit a Goal

1. User clicks on a goal's title text
2. An inline text input appears with the current title
3. User edits the text and presses Enter or clicks away
4. **Outcome:** `onEditGoalTitle` is called with the new title

### Flow 3: Add a Description to a Goal

1. User clicks the italic "Add a description…" placeholder text on a goal
2. A textarea appears
3. User types a description and presses Enter (without Shift)
4. **Outcome:** `onEditGoalDescription` is called with the new description

### Flow 4: Delete a Goal

1. User hovers over a goal row — × icon appears on the right
2. User clicks ×
3. **Outcome:** `onDeleteGoal` is called; goal is removed (no confirmation)

## Empty States

- **Horizon with no goals:** Show dashed target icon + "No goals yet for this horizon" + "Add your first goal →" link
- **Horizon tab with zero goals:** Tab shows NO count badge (badge only appears when goals > 0)

## Testing

See `product-plan/sections/goal-planning/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/goal-planning/README.md` — Feature overview
- `product-plan/sections/goal-planning/tests.md` — UI behavior test specs
- `product-plan/sections/goal-planning/components/` — React components
- `product-plan/sections/goal-planning/types.ts` — TypeScript interfaces
- `product-plan/sections/goal-planning/sample-data.json` — Test data

## Done When

- [ ] Components render with real data from the backend
- [ ] All three horizon tabs display goals correctly
- [ ] Empty state appears for horizons with no goals
- [ ] Users can create goals with title and optional description
- [ ] Users can edit goal titles and descriptions inline
- [ ] Users can delete goals
- [ ] Switching tabs cancels any in-progress goal creation
- [ ] Goal count badges update correctly
- [ ] Responsive on mobile
- [ ] Matches the visual design (see screenshot if available)
