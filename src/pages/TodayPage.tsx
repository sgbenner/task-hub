import { useMemo, useCallback } from 'react'
import { useTodayTasks } from '../hooks/useTodayTasks'
import { useAiPlanner } from '../hooks/useAiPlanner'
import { TodayView } from '../components/today'
import type { AiPlannerProps } from '../types/task-lists'

export function TodayPage() {
  const {
    groups,
    completedTasks,
    searchResults,
    searchQuery,
    setSearchQuery,
    scheduleTask,
    unscheduleTask,
    completeTask,
    uncompleteTask,
    completeSubtask,
    uncompleteSubtask,
    editTask,
    deleteTask,
    editSubtask,
    deleteSubtask,
    updateDueDate,
    undoneTasks,
    loading,
    error,
  } = useTodayTasks()

  const planner = useAiPlanner(undoneTasks)

  const taskMap = useMemo(() => {
    const map = new Map<string, (typeof undoneTasks)[number]>()
    for (const t of undoneTasks) map.set(t.id, t)
    return map
  }, [undoneTasks])

  const handleAccept = useCallback(
    (taskId: string) => {
      const suggestion = planner.suggestions.find((s) => s.taskId === taskId)
      if (suggestion) {
        planner.acceptSuggestion(taskId)
        scheduleTask(taskId, suggestion.suggestedDate)
      }
    },
    [planner, scheduleTask]
  )

  const plannerProps: AiPlannerProps = {
    status: planner.status,
    suggestions: planner.suggestions,
    pendingSuggestions: planner.pendingSuggestions,
    decidedCount: planner.decidedCount,
    errorMessage: planner.errorMessage,
    requestPlan: planner.requestPlan,
    acceptSuggestion: handleAccept,
    rejectSuggestion: planner.rejectSuggestion,
    reset: planner.reset,
    taskMap,
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-stone-400">
        Loading today's tasks…
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
    <TodayView
      groups={groups}
      completedTasks={completedTasks}
      searchResults={searchResults}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onScheduleTask={scheduleTask}
      onUnscheduleTask={unscheduleTask}
      onCompleteTask={completeTask}
      onUncompleteTask={uncompleteTask}
      onCompleteSubtask={completeSubtask}
      onUncompleteSubtask={uncompleteSubtask}
      onEditTask={editTask}
      onDeleteTask={deleteTask}
      onEditSubtask={editSubtask}
      onDeleteSubtask={deleteSubtask}
      onUpdateDueDate={updateDueDate}
      plannerProps={plannerProps}
    />
  )
}
