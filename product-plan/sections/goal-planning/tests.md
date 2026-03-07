# Test Specs: Goal Planning

These test specs are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

Goal Planning lets users manage long-term goals across three fixed time horizons. Key behaviors to test: horizon switching, inline goal creation, inline title/description editing, and goal deletion.

---

## User Flow Tests

### Flow 1: Create a New Goal

**Scenario:** User adds a new goal to the active horizon.

#### Success Path

**Setup:**
- The "1 Year" tab is active with at least one existing goal

**Steps:**
1. User sees the "Add goal" button below the goal list
2. User clicks "Add goal"
3. An inline creation row appears with a focused title input
4. User types "Run a 5K race"
5. User clicks "Save goal" (or presses Enter to move to description, then Enter again to save)

**Expected Results:**
- [ ] `onCreateGoal` is called with the active horizon ID (`"1-year"`) and title `"Run a 5K race"`
- [ ] The inline creation row disappears

#### With Description

**Steps:**
1. User clicks "Add goal" and types a title
2. User presses Enter — description textarea appears
3. User types a description
4. User presses Enter (without Shift) to save

**Expected Results:**
- [ ] `onCreateGoal` is called with horizon ID, title, and description text

#### Cancel Creation

**Steps:**
1. User clicks "Add goal" — inline row appears
2. User presses Escape

**Expected Results:**
- [ ] Inline creation row disappears
- [ ] `onCreateGoal` is NOT called

#### Empty Title Save Attempt

**Steps:**
1. Inline creation row is visible with empty title input
2. User clicks "Save goal" with no title typed

**Expected Results:**
- [ ] "Save goal" button is visually disabled (opacity reduced, not clickable)
- [ ] `onCreateGoal` is NOT called

---

### Flow 2: Edit a Goal Title

**Scenario:** User updates an existing goal's title inline.

**Setup:**
- An existing goal with title "Finish writing the book proposal"

**Steps:**
1. User clicks (or double-clicks) the goal's title text
2. An inline text input replaces the title with the current text
3. User changes the text to "Finish writing the book proposal and pitch it"
4. User presses Enter (or clicks away)

**Expected Results:**
- [ ] `onEditGoalTitle` is called with the horizon ID, goal ID, and updated title
- [ ] The input closes and the updated title is displayed

#### Cancel Title Edit

**Steps:**
1. User clicks a goal title to open inline edit
2. User presses Escape

**Expected Results:**
- [ ] Input closes without saving
- [ ] Original title is restored
- [ ] `onEditGoalTitle` is NOT called

---

### Flow 3: Edit a Goal Description

**Scenario:** User adds or updates a goal's description inline.

**Setup:**
- An existing goal with no description (shows italic "Add a description…" placeholder)

**Steps:**
1. User clicks the description placeholder text
2. A textarea appears with the current description (empty)
3. User types "Train 3x per week for 6 months"
4. User presses Enter (without Shift) or clicks away

**Expected Results:**
- [ ] `onEditGoalDescription` is called with the horizon ID, goal ID, and new description text
- [ ] The textarea closes and the new description is displayed in muted text

---

### Flow 4: Delete a Goal

**Scenario:** User deletes an existing goal (no confirmation required).

**Steps:**
1. User hovers over a goal row
2. A × icon appears at the right end of the row
3. User clicks the × icon

**Expected Results:**
- [ ] `onDeleteGoal` is called with the horizon ID and goal ID
- [ ] The goal is removed from the list

---

### Flow 5: Switch Horizon

**Scenario:** User switches between time horizons.

**Setup:**
- Multiple horizons with different goal counts

**Steps:**
1. User is on the "1 Year" tab
2. User clicks the "5 Years" tab

**Expected Results:**
- [ ] The "5 Years" tab becomes active (indigo underline)
- [ ] The "1 Year" tab loses its active styling
- [ ] The goal list updates to show 5-year goals
- [ ] The context prompt updates to "Where do you want to be in 5 years?"
- [ ] If a new goal creation was in progress, it is cancelled

---

## Empty State Tests

### Horizon With No Goals

**Setup:**
- One horizon has `goals: []`

**Expected Results:**
- [ ] Shows a dashed-circle icon (Target icon)
- [ ] Shows message: "No goals yet for this horizon"
- [ ] Shows link: "Add your first goal →"
- [ ] Clicking "Add your first goal →" opens the inline creation row

### Horizon Tab With Zero Goals

**Setup:**
- A horizon has `goals: []`

**Expected Results:**
- [ ] The tab for that horizon shows NO count badge (badge only appears when goals > 0)

---

## Component Interaction Tests

### GoalRow

**Renders correctly:**
- [ ] Displays goal title as clickable/editable text
- [ ] Displays description if present in muted, smaller text
- [ ] Shows italic "Add a description…" placeholder when no description
- [ ] Shows an indigo bullet dot to the left of the title

**Hover interactions:**
- [ ] Delete × icon appears on hover
- [ ] Row background changes on hover

**Inline editing:**
- [ ] Clicking the title opens inline title editor
- [ ] Clicking the description opens inline description textarea
- [ ] Pressing Escape in either field cancels and restores original value
- [ ] Pressing Enter saves changes and closes the input

### Horizon Tabs

**Renders correctly:**
- [ ] Three tabs: "1 Year", "5 Years", "10 Years"
- [ ] Active tab has indigo underline and indigo text
- [ ] Goal count badge appears only on tabs with goals
- [ ] Active tab badge is indigo; inactive tab badge is stone

**Context prompt:**
- [ ] "1 Year" active: shows "What do you want to accomplish in the next 12 months?"
- [ ] "5 Years" active: shows "Where do you want to be in 5 years?"
- [ ] "10 Years" active: shows "What does your life look like a decade from now?"

---

## Edge Cases

- [ ] Handles very long goal titles — title wraps, layout doesn't break
- [ ] Handles a goal with a multi-paragraph description — textarea expands properly
- [ ] Handles a goal with special characters in title or description
- [ ] "Add goal" button does not appear when the inline creation row is already open
- [ ] Switching horizons while inline creation is open discards the draft and closes the row

---

## Accessibility Checks

- [ ] Delete buttons have `aria-label` ("Delete goal")
- [ ] "Save goal" button has `disabled` attribute when title is empty
- [ ] Horizon tabs are keyboard focusable and activatable with Enter/Space
- [ ] Inline title and description inputs receive focus automatically when opened

---

## Sample Test Data

```typescript
const mockGoalWithDescription = {
  id: "g-1",
  title: "Ship the MVP and get 100 paying users",
  description: "Build, launch, and iterate until we hit the first revenue milestone.",
}

const mockGoalWithoutDescription = {
  id: "g-2",
  title: "Read 24 books",
  description: "",
}

const mockHorizonWithGoals = {
  id: "1-year" as const,
  label: "1 Year",
  goals: [mockGoalWithDescription, mockGoalWithoutDescription],
}

const mockHorizonEmpty = {
  id: "5-year" as const,
  label: "5 Years",
  goals: [],
}
```
