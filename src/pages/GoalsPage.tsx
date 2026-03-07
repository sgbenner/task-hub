import { useGoals } from '../hooks/useGoals'
import { GoalPlanningView } from '../components/goal-planning'

export function GoalsPage() {
  const {
    horizons,
    loading,
    error,
    createGoal,
    editGoalTitle,
    editGoalDescription,
    deleteGoal,
  } = useGoals()

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-stone-400">
        Loading goals…
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-20 text-center text-sm text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <GoalPlanningView
      horizons={horizons}
      onCreateGoal={createGoal}
      onEditGoalTitle={editGoalTitle}
      onEditGoalDescription={editGoalDescription}
      onDeleteGoal={deleteGoal}
    />
  )
}
