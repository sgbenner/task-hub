# Test Specs: Task Lists

These test specs are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

Task Lists is the primary workspace. Users manage tasks across user-created, reorderable lists displayed as tabs. Key behaviors to test: task creation/completion/deletion, list management, the completed tasks toggle, and the delete-list confirmation modal.

---

## User Flow Tests

### Flow 1: Create a Task

**Scenario:** User adds a new task to an active list.

#### Success Path

**Setup:**
- At least one task list exists and is active
- Task input is empty

**Steps:**
1. User sees the "Add a task…" input at the top of the list
2. User types "Pick up groceries" in the input
3. User presses Enter (or clicks "Add ↵")

**Expected Results:**
- [ ] Task "Pick up groceries" appears in the active task list
- [ ] The task input is cleared and ready for the next entry
- [ ] `onCreateTask` is called with the active list ID and "Pick up groceries"

#### Edge Case: Whitespace-only input

**Steps:**
1. User types "   " (spaces only) in the task input
2. User presses Enter

**Expected Results:**
- [ ] No task is created
- [ ] `onCreateTask` is NOT called
- [ ] Input clears or remains empty

---

### Flow 2: Complete a Task

**Scenario:** User checks off a task, removing it from the active view.

**Setup:**
- An active task list with at least one task

**Steps:**
1. User sees a task row with an unchecked circular checkbox
2. User clicks the checkbox next to "Review Q1 performance metrics..."

**Expected Results:**
- [ ] The task is removed from the active task list immediately
- [ ] `onCompleteTask` is called with the list ID and task ID
- [ ] If no tasks remain, the empty state is shown

---

### Flow 3: View and Uncomplete a Completed Task

**Scenario:** User reveals completed tasks and moves one back to active.

**Setup:**
- An active list with at least one completed task

**Steps:**
1. User sees the "X completed" toggle below the active task list
2. User clicks the toggle to reveal completed tasks
3. User sees completed tasks with strikethrough styling
4. User clicks the filled checkbox on a completed task

**Expected Results:**
- [ ] Completed tasks section expands and shows completed tasks with strikethrough text
- [ ] Clicking a completed task's checkbox calls `onUncompleteTask`
- [ ] The task moves back to the active list (or the component re-renders without it in completed)

---

### Flow 4: Create a New List

**Scenario:** User creates a new task list.

**Steps:**
1. User sees the list tabs with an "Add list" button at the end
2. User clicks "Add list"
3. An inline input appears in the tab bar
4. User types "Shopping" and presses Enter

**Expected Results:**
- [ ] `onCreateList` is called with "Shopping"
- [ ] The new tab appears in the tab bar

#### Cancel Creating a List

**Steps:**
1. User clicks "Add list" and sees the inline input
2. User presses Escape

**Expected Results:**
- [ ] The inline input disappears
- [ ] No list is created
- [ ] `onCreateList` is NOT called

---

### Flow 5: Rename a List

**Scenario:** User renames an existing tab.

**Steps:**
1. User double-clicks a tab label (e.g., "Work")
2. An inline input replaces the tab label with the current name selected
3. User clears the text and types "Work Tasks"
4. User presses Enter

**Expected Results:**
- [ ] `onRenameList` is called with the list ID and "Work Tasks"
- [ ] The tab label updates (or re-renders) with the new name

---

### Flow 6: Delete a List With Tasks

**Scenario:** User tries to delete a list that contains tasks.

**Setup:**
- A non-active list with at least one task

**Steps:**
1. User hovers over a non-active tab
2. A small × button appears on the tab
3. User clicks the × button

**Expected Results:**
- [ ] A confirmation modal appears with the text: `Delete "[list name]"?`
- [ ] Modal shows a warning about permanent deletion
- [ ] Modal has "Cancel" and "Delete" buttons

#### Confirm Deletion

**Steps (continued from above):**
4. User clicks "Delete"

**Expected Results:**
- [ ] `onDeleteList` is called with the list ID
- [ ] Modal closes
- [ ] If the deleted list was active, another list becomes active

#### Cancel Deletion

**Steps (continued from modal):**
4. User clicks "Cancel"

**Expected Results:**
- [ ] Modal closes
- [ ] List is NOT deleted
- [ ] `onDeleteList` is NOT called

---

### Flow 7: Delete a Task

**Scenario:** User deletes an active task.

**Steps:**
1. User hovers over a task row
2. A × icon appears at the right end of the row
3. User clicks the × icon

**Expected Results:**
- [ ] `onDeleteTask` is called with the list ID and task ID
- [ ] The task is removed from the displayed list

---

## Empty State Tests

### No Lists Exist

**Setup:**
- `lists` prop is an empty array (`[]`)

**Expected Results:**
- [ ] Shows prompt: "Create a list to get started"
- [ ] No tab bar items shown (except "Add list" button)
- [ ] No task input shown

### Active List Has No Tasks

**Setup:**
- One active list with `tasks: []` and `completedTasks: []`

**Expected Results:**
- [ ] Shows dashed-circle empty state icon
- [ ] Shows message: "No tasks in [List Name]"
- [ ] Task input is still visible and functional

### Active List Has No Completed Tasks

**Setup:**
- An active list with tasks but `completedTasks: []`

**Expected Results:**
- [ ] Completed tasks toggle is NOT shown
- [ ] No "X completed" section visible

---

## Component Interaction Tests

### TaskRow

**Renders correctly:**
- [ ] Displays task title text
- [ ] Shows an unchecked circular checkbox for active tasks
- [ ] Shows a checked, filled circular checkbox for completed tasks
- [ ] Completed task title has strikethrough styling

**Hover interactions:**
- [ ] Drag handle icon appears on hover
- [ ] Delete × icon appears on hover
- [ ] Row background changes on hover

**Inline editing:**
- [ ] Double-clicking an active task title makes it editable
- [ ] Pressing Enter while editing calls `onEditTask` with the new title
- [ ] Pressing Escape while editing restores the original title without calling `onEditTask`
- [ ] Clicking away (blur) saves the edit

### List Tabs

**Renders correctly:**
- [ ] Each list name appears as a tab
- [ ] Active tab has indigo underline and indigo text
- [ ] Inactive tabs have stone text
- [ ] Task count badge appears on tabs with tasks

**Interactions:**
- [ ] Clicking a tab makes it active and updates the displayed task list
- [ ] Active tab does not show the × delete button on hover

---

## Edge Cases

- [ ] Handles very long task titles — text wraps or truncates without breaking layout
- [ ] Handles a list with 50+ tasks — list scrolls without performance issues
- [ ] Handles a task title with special characters (e.g., "Buy milk & eggs <today>")
- [ ] Switching tabs resets the "show completed" toggle to hidden
- [ ] After completing the last task, the empty state appears
- [ ] After deleting the active list, the first remaining list becomes active

---

## Accessibility Checks

- [ ] Checkbox buttons have `aria-label` ("Complete task" / "Mark active")
- [ ] Delete buttons have `aria-label` ("Delete task")
- [ ] Tab bar buttons are keyboard focusable
- [ ] "Add list" inline input receives focus automatically when triggered
- [ ] Task input receives focus when clicking into it

---

## Sample Test Data

```typescript
const mockTask = {
  id: "t-1",
  title: "Review Q1 metrics",
  completed: false,
  order: 0,
}

const mockCompletedTask = {
  id: "t-2",
  title: "Send invoice to Acme Corp",
  completed: true,
  completedAt: "2026-02-27T09:10:00Z",
  order: 0,
}

const mockList = {
  id: "list-1",
  name: "Work",
  order: 0,
  tasks: [mockTask],
  completedTasks: [mockCompletedTask],
}

const mockEmptyList = {
  id: "list-2",
  name: "Personal",
  order: 1,
  tasks: [],
  completedTasks: [],
}
```
