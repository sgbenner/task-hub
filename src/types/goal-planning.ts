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
  onCreateGoal?: (horizonId: HorizonId, title: string, description?: string) => void
  onEditGoalTitle?: (horizonId: HorizonId, goalId: string, title: string) => void
  onEditGoalDescription?: (horizonId: HorizonId, goalId: string, description: string) => void
  onDeleteGoal?: (horizonId: HorizonId, goalId: string) => void
}
