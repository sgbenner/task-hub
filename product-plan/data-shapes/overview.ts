// =============================================================================
// UI Data Shapes — Combined Reference
//
// These types define the data that UI components expect to receive as props.
// They are a frontend contract, not a database schema. How you model, store,
// and fetch this data is an implementation decision.
// =============================================================================

// -----------------------------------------------------------------------------
// From: sections/task-lists
// -----------------------------------------------------------------------------

export interface Task {
  id: string
  title: string
  completed: boolean
  completedAt?: string
  order: number
}

export interface TaskList {
  id: string
  name: string
  order: number
  tasks: Task[]
  completedTasks: Task[]
}

// -----------------------------------------------------------------------------
// From: sections/goal-planning
// -----------------------------------------------------------------------------

export type HorizonId = '1-year' | '5-year' | '10-year'

export interface Goal {
  id: string
  title: string
  description?: string
}

export interface Horizon {
  id: HorizonId
  label: string
  goals: Goal[]
}
