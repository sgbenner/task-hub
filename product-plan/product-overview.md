# TaskHub — Product Overview

## Summary

TaskHub is a personal task management app that lets you organize everything you need to do across multiple lists, track your progress, and plan long-term goals — all in one place.

## Planned Sections

1. **Task Lists** — Tabbed task list management with task creation, completion tracking, and filtering by status (completed vs. outstanding).
2. **Goal Planning** — Dedicated views for defining and managing 1-year, 5-year, and 10-year goals, with the ability to connect goals to actionable tasks.

## Product Entities

- **User** — A person who uses TaskHub to manage their tasks and goals.
- **TaskList** — A named collection of tasks. Users organize their work by creating multiple lists (e.g., "Work", "Personal", "Shopping").
- **Task** — A single actionable item within a task list. Can be marked as completed or outstanding.
- **Goal** — A long-term objective with a time horizon (1-year, 5-year, or 10-year).

## Design System

**Colors:**
- Primary: `indigo` — buttons, links, active states, key accents
- Secondary: `amber` — tags, highlights, completed count badges
- Neutral: `stone` — backgrounds, text, borders

**Typography:**
- Heading: Inter
- Body: Inter
- Mono: JetBrains Mono

## Implementation Sequence

Build this product in milestones:

1. **Shell** — Set up design tokens and application shell with top navigation
2. **Task Lists** — Tabbed task lists with inline task CRUD, completion tracking, and completed task toggle
3. **Goal Planning** — Three-horizon goal management with inline create/edit

Each milestone has a dedicated instruction document in `product-plan/instructions/incremental/`.
