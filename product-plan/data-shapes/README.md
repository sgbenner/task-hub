# UI Data Shapes

These types define the shape of data that the UI components expect to receive as props. They represent the **frontend contract** — what the components need to render correctly.

How you model, store, and fetch this data on the backend is an implementation decision. You may combine, split, or extend these types to fit your architecture.

## Entities

- **Task** — A single actionable item with a title and completion state. (used in: task-lists)
- **TaskList** — A named, ordered collection of tasks with separate active and completed arrays. (used in: task-lists)
- **Goal** — A long-term objective with a title and optional description. (used in: goal-planning)
- **Horizon** — A fixed time grouping (1-year, 5-year, 10-year) that contains goals. (used in: goal-planning)

## Per-Section Types

Each section includes its own `types.ts` with the full interface definitions:

- `sections/task-lists/types.ts`
- `sections/goal-planning/types.ts`

## Combined Reference

See `overview.ts` for all entity types aggregated in one file.
