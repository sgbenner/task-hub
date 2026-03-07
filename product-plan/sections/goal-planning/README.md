# Goal Planning

## Overview

The Goal Planning section lets users define and manage long-term goals across three fixed time horizons: 1-year, 5-year, and 10-year. Goals are organized into tabs and displayed as compact rows with a title and optional description. All creating and editing happens inline — no modals.

## User Flows

- **Switch horizon** — User clicks a tab (1 Year, 5 Years, 10 Years) to view goals for that time frame
- **Create a goal** — User clicks "Add goal"; an inline row appears at the bottom with a focused title field
- **Save a new goal** — User types a title (required), optionally adds a description, then presses Enter or clicks "Save goal"
- **Cancel creating a goal** — User presses Escape to discard the new row
- **Edit a goal title** — User clicks the goal title to edit inline; Enter or blur saves
- **Edit a goal description** — User clicks the description area to edit; Enter (without Shift) or blur saves
- **Delete a goal** — User clicks the × icon (visible on hover); no confirmation required

## Design Decisions

- Tabs match Task Lists style for visual consistency (indigo underline, goal count badges)
- Each horizon shows a contextual prompt ("What do you want to accomplish in the next 12 months?") above the list
- New goal creation reveals the description field progressively after the title is started
- Indigo bullet dots on each goal row for subtle visual structure
- Empty state includes a direct "Add your first goal →" inline link

## Data Shapes

**Entities:** `Goal`, `Horizon`

**Key structure:**
- Three fixed horizons: `1-year`, `5-year`, `10-year`
- Each horizon contains an array of goals
- Goals have a required `title` and optional `description`

## Visual Reference

See `screenshot.png` for the target UI design (if available).

## Components Provided

- `GoalPlanningView` — Main section component with horizon tabs and inline goal management
- `GoalRow` — Individual goal row with inline title and description editing

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onCreateGoal` | User saves a new goal (with title and optional description) |
| `onEditGoalTitle` | User edits a goal's title inline |
| `onEditGoalDescription` | User edits a goal's description inline |
| `onDeleteGoal` | User clicks the delete icon on a goal |
