# Task Lists

## Overview

The Task Lists section is the primary workspace of TaskHub. Users manage tasks across multiple user-created lists displayed as reorderable tabs. Tasks are minimal (title only) and completing one removes it from the active view — with a toggle to reveal completed tasks at the bottom when needed.

## User Flows

- **Create a list** — User clicks "Add list" next to the tabs; a new tab appears and becomes active
- **Rename a list** — User double-clicks a tab label to rename it inline
- **Delete a list** — User deletes via tab × button; confirms if the list has tasks
- **Reorder lists** — User drags tabs left or right (drag affordance provided)
- **Create a task** — User types in the input at the top of the active list and presses Enter
- **Edit a task** — User double-clicks a task title to edit inline; Enter or blur saves
- **Complete a task** — User clicks the checkbox; task is immediately removed from active view
- **Delete a task** — User clicks the × icon (visible on hover) to permanently remove a task
- **Reorder tasks** — User drags tasks up or down (drag handle visible on hover)
- **View completed tasks** — Toggle button below the active list reveals completed tasks
- **Uncomplete a task** — User unchecks a completed task to move it back to active

## Design Decisions

- Tabs scroll horizontally on mobile rather than wrapping
- Completed tasks are hidden by default to keep the active list clean and focused
- Task count badges appear on each tab; active tab shows indigo badge, inactive shows stone
- Amber badge on the completed toggle for warm visual contrast
- Delete list requires confirmation modal when the list contains tasks
- Drag handles and delete icons are hidden until hover to reduce visual noise

## Data Shapes

**Entities:** `Task`, `TaskList`

**Key relationships:**
- Each `TaskList` holds two separate arrays: `tasks` (active) and `completedTasks`
- Tasks have an `order` field for manual reordering

## Visual Reference

See `screenshot.png` for the target UI design (if available).

## Components Provided

- `TaskListView` — Main section component; manages all list and task interactions
- `TaskRow` — Individual task row; handles inline editing, completion, and deletion

## Callback Props

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
