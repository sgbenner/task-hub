import { useState, useRef, useEffect } from 'react'
import { Search, CalendarMinus, ChevronDown, ChevronRight, CalendarCheck, Sparkles } from 'lucide-react'
import type { TodayViewProps } from '../../types/task-lists'
import { TaskRow } from '../task-lists/TaskRow'
import { AiPlannerPanel } from './AiPlannerPanel'

export function TodayView({
  groups,
  completedTasks,
  searchResults,
  searchQuery,
  onSearchChange,
  onScheduleTask,
  onUnscheduleTask,
  onCompleteTask,
  onUncompleteTask,
  onCompleteSubtask,
  onUncompleteSubtask,
  plannerProps,
}: TodayViewProps) {
  const [showCompleted, setShowCompleted] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPlanner, setShowPlanner] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const isEmpty = groups.length === 0 && completedTasks.length === 0

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="font-['Inter',sans-serif] min-h-[calc(100vh-3.5rem)]">
      <div className="py-8 max-w-2xl">
        {/* Search bar */}
        <div ref={searchRef} className="relative mb-8">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100 dark:border-stone-800 focus-within:border-indigo-200 dark:focus-within:border-indigo-900 transition-colors">
            <Search size={16} className="text-stone-400 dark:text-stone-500 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => { if (searchQuery.trim()) setShowDropdown(true) }}
              placeholder="Schedule a task for today…"
              className="flex-1 bg-transparent text-sm text-stone-700 dark:text-stone-300 placeholder:text-stone-400 dark:placeholder:text-stone-600 outline-none"
            />
          </div>

          {/* Dropdown results */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
              {searchResults.map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    onScheduleTask(task.id)
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors"
                >
                  <CalendarCheck size={14} className="text-indigo-400 shrink-0" />
                  <span className="flex-1 text-sm text-stone-700 dark:text-stone-300 truncate">
                    {task.title}
                  </span>
                  <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
                    {task.listName}
                  </span>
                </button>
              ))}
            </div>
          )}

          {showDropdown && searchQuery.trim() && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 px-3 py-4 text-center">
              <p className="text-sm text-stone-400 dark:text-stone-500">No matching tasks</p>
            </div>
          )}
        </div>

        {/* AI Planner */}
        {plannerProps && (
          <div className="mb-4">
            {!showPlanner ? (
              <button
                onClick={() => setShowPlanner(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                <Sparkles size={13} />
                Plan with AI
              </button>
            ) : (
              <AiPlannerPanel {...plannerProps} />
            )}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center">
              <CalendarCheck size={18} className="text-stone-300 dark:text-stone-700" />
            </div>
            <p className="text-sm text-stone-400 dark:text-stone-600">
              No tasks scheduled for today
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-600">
              Search above to schedule existing tasks
            </p>
          </div>
        )}

        {/* Task groups */}
        {groups.map((group) => (
          <div key={group.listId} className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
              {group.listName}
            </h3>
            <div className="space-y-0.5">
              {group.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  showDragHandle={false}
                  onComplete={() => onCompleteTask(task.id)}
                  onCompleteSubtask={(subtaskId) => onCompleteSubtask(task.id, subtaskId)}
                  onUncompleteSubtask={(subtaskId) => onUncompleteSubtask(task.id, subtaskId)}
                  extraActions={
                    <button
                      onClick={() => onUnscheduleTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-stone-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 shrink-0"
                      aria-label="Unschedule task"
                    >
                      <CalendarMinus size={12} />
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        ))}

        {/* Completed section */}
        {completedTasks.length > 0 && (
          <div className="mt-8 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => setShowCompleted((v) => !v)}
              className="flex items-center gap-2 text-xs font-medium text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
            >
              {showCompleted ? (
                <ChevronDown size={13} />
              ) : (
                <ChevronRight size={13} />
              )}
              <span>{completedTasks.length} completed</span>
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-500 text-xs font-normal tabular-nums">
                {completedTasks.length}
              </span>
            </button>

            {showCompleted && (
              <div className="mt-3 space-y-0.5 opacity-60">
                {completedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    completed
                    showDragHandle={false}
                    onUncomplete={() => onUncompleteTask(task.id)}
                    onCompleteSubtask={(subtaskId) => onCompleteSubtask(task.id, subtaskId)}
                    onUncompleteSubtask={(subtaskId) => onUncompleteSubtask(task.id, subtaskId)}
                    extraActions={
                      <button
                        onClick={() => onUnscheduleTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-stone-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 shrink-0"
                        aria-label="Unschedule task"
                      >
                        <CalendarMinus size={12} />
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
