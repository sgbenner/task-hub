# TaskHub — Complete Implementation Instructions

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

## Testing

Each section includes a `tests.md` file with UI behavior test specs. These are **framework-agnostic** — adapt them to your testing setup.

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

---

# TaskHub — Product Overview

TaskHub is a personal task management app that lets you organize everything you need to do across multiple lists, track your progress, and plan long-term goals — all in one place.

**Sections:**
1. **Task Lists** — Tabbed task list management with task creation, completion tracking, and filtering by status
2. **Goal Planning** — Dedicated views for defining and managing 1-year, 5-year, and 10-year goals

**Design System:** Primary `indigo`, secondary `amber`, neutral `stone`. Fonts: Inter (heading + body), JetBrains Mono (mono).

---

# Milestone 1: Shell

> **Prerequisites:** None

## Goal

Set up the design tokens and application shell — the persistent chrome that wraps all sections.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind color usage examples
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Summary:**
- Primary: `indigo` — buttons, links, active states
- Secondary: `amber` — tags, highlights, badges
- Neutral: `stone` — backgrounds, text, borders
- Fonts: Inter (heading + body), JetBrains Mono (code)

### 2. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper (fixed top nav + content area)
- `MainNav.tsx` — Desktop nav links + mobile hamburger
- `UserMenu.tsx` — Avatar dropdown with sign out

**Wire Up Navigation:**

```tsx
<AppShell
  navigationItems={[
    { label: 'Tasks', href: '/tasks', isActive: pathname === '/tasks' },
    { label: 'Goals', href: '/goals', isActive: pathname === '/goals' },
  ]}
  user={{ name: currentUser.name, avatarUrl: currentUser.avatarUrl }}
  onNavigate={(href) => router.push(href)}
  onLogout={() => signOut()}
>
  {children}
</AppShell>
```

**User Menu:** expects `user.name`, optional `user.avatarUrl`, and `onLogout` callback.

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens configured (colors + fonts)
- [ ] Shell renders with top navigation bar
- [ ] "Tasks" and "Goals" nav links navigate to correct routes
- [ ] Active nav item shows indigo highlight
- [ ] User menu shows user name and avatar (or initials fallback)
- [ ] "Sign out" triggers logout
- [ ] Hamburger menu works on mobile

---

# Milestone 2: Task Lists

> **Prerequisites:** Milestone 1 (Shell) complete

## Goal

Implement the Task Lists feature — the primary workspace where users manage tasks across multiple user-created lists.

## Overview

Task Lists is the core of TaskHub. Users create multiple named lists displayed as tabs, and manage tasks within each. Completing a task removes it from the active view; a toggle reveals completed tasks when needed.

**Key Functionality:**
- Multiple user-created task lists as reorderable tabs
- Add, edit, complete, delete, and reorder tasks
- Completing a task removes it from the active view immediately
- Toggle to show/hide completed tasks at the bottom
- Uncheck a completed task to move it back to active
- Delete a list with confirmation if it has tasks

## Components Provided

Copy from `product-plan/sections/task-lists/components/`:
- `TaskListView.tsx` — Main section component
- `TaskRow.tsx` — Individual task row
- `index.ts`

**Data shape:**

```typescript
interface TaskList {
  id: string; name: string; order: number
  tasks: Task[]           // Active tasks
  completedTasks: Task[]  // Completed tasks
}
interface Task { id: string; title: string; completed: boolean; completedAt?: string; order: number }
```

**Callbacks:** `onCreateList`, `onRenameList`, `onDeleteList`, `onReorderLists`, `onCreateTask`, `onEditTask`, `onCompleteTask`, `onUncompleteTask`, `onDeleteTask`, `onReorderTasks`

## Expected User Flows

1. **Add a task** — Type in input → Enter → task appears, input clears
2. **Complete a task** — Click checkbox → task disappears from active list
3. **View completed** — Click toggle → completed tasks appear with strikethrough
4. **Create a list** — Click "Add list" → type name → Enter → new tab appears
5. **Delete a list** — Hover tab → click × → confirm → list deleted

## Empty States

- No lists: "Create a list to get started"
- Empty active list: dashed circle + "No tasks in [List Name]"
- No completed tasks: don't show the toggle

## Testing

See `product-plan/sections/task-lists/tests.md`

## Done When

- [ ] Renders with real data
- [ ] All empty states display correctly
- [ ] Create, edit, complete, delete tasks works
- [ ] Create, rename, delete lists works
- [ ] Delete confirmation modal appears when list has tasks
- [ ] Completed tasks toggle shows/hides
- [ ] Uncompleting a task works
- [ ] Responsive on mobile

---

# Milestone 3: Goal Planning

> **Prerequisites:** Milestone 1 (Shell) complete

## Goal

Implement the Goal Planning feature — a dedicated space for users to define long-term ambitions across three time horizons.

## Overview

Goal Planning helps users articulate where they want to be in 1, 5, and 10 years. Goals are organized into three fixed horizon tabs and displayed as compact, inline-editable rows.

**Key Functionality:**
- Three fixed time horizons: 1 Year, 5 Years, 10 Years
- Goals have a required title and optional description
- Inline goal creation, inline editing of title and description
- Delete a goal with one click (no confirmation)

## Components Provided

Copy from `product-plan/sections/goal-planning/components/`:
- `GoalPlanningView.tsx` — Main section component
- `GoalRow.tsx` — Individual goal row
- `index.ts`

**Data shape:**

```typescript
type HorizonId = '1-year' | '5-year' | '10-year'
interface Horizon { id: HorizonId; label: string; goals: Goal[] }
interface Goal { id: string; title: string; description?: string }
```

**Callbacks:** `onCreateGoal`, `onEditGoalTitle`, `onEditGoalDescription`, `onDeleteGoal`

## Expected User Flows

1. **Create a goal** — Click "Add goal" → type title → Enter → (optional) type description → Enter to save
2. **Edit a goal** — Click title → edit inline → Enter saves
3. **Add a description** — Click "Add a description…" placeholder → type → Enter saves
4. **Delete a goal** — Hover row → click × → goal removed (no confirmation)

## Empty States

- Horizon with no goals: dashed target icon + "No goals yet for this horizon" + "Add your first goal →"
- Tab with zero goals: no count badge shown

## Testing

See `product-plan/sections/goal-planning/tests.md`

## Done When

- [ ] Renders with real data
- [ ] All three horizon tabs display goals correctly
- [ ] Empty state appears for horizons with no goals
- [ ] Create, edit, delete goals works
- [ ] Switching tabs cancels in-progress goal creation
- [ ] Goal count badges update correctly
- [ ] Responsive on mobile
