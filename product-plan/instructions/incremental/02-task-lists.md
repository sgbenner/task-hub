# Milestone 2: Task Lists

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

Implement the Task Lists feature — the primary workspace where users manage tasks across multiple user-created lists.

## Overview

Task Lists is the core of TaskHub. Users create multiple named lists (e.g., "Work", "Personal") displayed as tabs, and manage tasks within each list. Tasks are minimal — just a title — and completing one removes it from the active view. A toggle reveals completed tasks when needed.

**Key Functionality:**
- Multiple user-created task lists displayed as reorderable tabs
- Add, edit, complete, and delete tasks within each list
- Completing a task removes it from the active view immediately
- Toggle to show/hide completed tasks at the bottom of the list
- Uncheck a completed task to move it back to active
- Reorder tasks within a list via drag handles
- Delete a list with confirmation if it has tasks

## Components Provided

Copy from `product-plan/sections/task-lists/components/`:

- `TaskListView.tsx` — Main section component; handles all tab and task UI
- `TaskRow.tsx` — Individual task row with checkbox, inline editing, and delete
- `index.ts` — Exports

## Props Reference

See `types.ts` for full definitions.

**Data props:**

```typescript
interface TaskList {
  id: string
  name: string
  order: number
  tasks: Task[]          // Active (incomplete) tasks
  completedTasks: Task[] // Completed tasks (shown in toggle section)
}

interface Task {
  id: string
  title: string
  completed: boolean
  completedAt?: string
  order: number
}
```

**Callback props:**

| Callback | Triggered When |
|----------|---------------|
| `onCreateList` | User saves a new list name |
| `onRenameList` | User edits a list tab name |
| `onDeleteList` | User confirms list deletion |
| `onReorderLists` | User drags a tab to a new position |
| `onCreateTask` | User presses Enter in the task input |
| `onEditTask` | User edits a task title inline |
| `onCompleteTask` | User checks the task checkbox |
| `onUncompleteTask` | User unchecks a completed task |
| `onDeleteTask` | User clicks the delete icon on a task |
| `onReorderTasks` | User drags a task to a new position |

## Expected User Flows

### Flow 1: Add a Task

1. User sees the "Add a task…" input at the top of the active list
2. User types a task title and presses Enter
3. **Outcome:** Task appears in the list; input clears

### Flow 2: Complete a Task

1. User clicks the circular checkbox next to a task
2. **Outcome:** Task disappears from the active list immediately

### Flow 3: View and Restore a Completed Task

1. User clicks "X completed" toggle below the list
2. Completed tasks appear with strikethrough styling
3. User clicks the filled checkbox on a completed task
4. **Outcome:** Task moves back to the active list

### Flow 4: Create a New List

1. User clicks "Add list" at the end of the tab bar
2. User types a name and presses Enter
3. **Outcome:** New tab appears and becomes active

### Flow 5: Delete a List With Tasks

1. User hovers over a non-active tab — × button appears
2. User clicks ×
3. Confirmation modal appears
4. User clicks "Delete"
5. **Outcome:** List and all its tasks are deleted

## Empty States

- **No lists:** Show "Create a list to get started" centered in the content area
- **Active list has no tasks:** Show dashed circle + "No tasks in [List Name]"
- **No completed tasks:** Don't show the completed toggle at all

## Testing

See `product-plan/sections/task-lists/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/task-lists/README.md` — Feature overview
- `product-plan/sections/task-lists/tests.md` — UI behavior test specs
- `product-plan/sections/task-lists/components/` — React components
- `product-plan/sections/task-lists/types.ts` — TypeScript interfaces
- `product-plan/sections/task-lists/sample-data.json` — Test data

## Done When

- [ ] Components render with real data from the backend
- [ ] All empty states display correctly
- [ ] Users can create, edit, complete, and delete tasks
- [ ] Users can create, rename, and delete lists
- [ ] Delete list shows confirmation modal when list has tasks
- [ ] Completed tasks toggle shows/hides correctly
- [ ] Uncompleting a task moves it back to active
- [ ] Responsive on mobile (tabs scroll horizontally)
- [ ] Matches the visual design (see screenshot if available)
