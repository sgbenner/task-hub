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

export interface GoalPlanningProps {
  horizons: Horizon[]

  /** Called when the user creates a new goal in a horizon. */
  onCreateGoal?: (horizonId: HorizonId, title: string, description?: string) => void
  /** Called when the user edits a goal's title. */
  onEditGoalTitle?: (horizonId: HorizonId, goalId: string, title: string) => void
  /** Called when the user edits a goal's description. */
  onEditGoalDescription?: (horizonId: HorizonId, goalId: string, description: string) => void
  /** Called when the user deletes a goal. */
  onDeleteGoal?: (horizonId: HorizonId, goalId: string) => void
}
