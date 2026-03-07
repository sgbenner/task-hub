import { useState, type KeyboardEvent } from 'react'
import { Plus, Target } from 'lucide-react'
import type { GoalPlanningProps, HorizonId } from '../../types/goal-planning'
import { GoalRow } from './GoalRow'

const HORIZON_CONTEXT: Record<string, string> = {
  '1-year': 'What do you want to accomplish in the next 12 months?',
  '5-year': 'Where do you want to be in 5 years?',
  '10-year': 'What does your life look like a decade from now?',
}

function getLabel(id: string, label?: string): string {
  if (label) return label
  if (id === '1-year') return '1 Year'
  if (id === '5-year') return '5 Years'
  if (id === '10-year') return '10 Years'
  return id
}

interface NewGoalState {
  title: string
  description: string
  showDesc: boolean
}

export function GoalPlanningView({
  horizons,
  onCreateGoal,
  onEditGoalTitle,
  onEditGoalDescription,
  onDeleteGoal,
}: GoalPlanningProps) {
  const [activeHorizonId, setActiveHorizonId] = useState<HorizonId>(
    (horizons[0]?.id as HorizonId) ?? '1-year'
  )
  const [isAdding, setIsAdding] = useState(false)
  const [newGoal, setNewGoal] = useState<NewGoalState>({
    title: '',
    description: '',
    showDesc: false,
  })

  const activeHorizon = horizons.find((h) => h.id === activeHorizonId)

  const handleStartAdd = () => {
    setIsAdding(true)
    setNewGoal({ title: '', description: '', showDesc: false })
  }

  const handleSaveNew = () => {
    const title = newGoal.title.trim()
    if (!title) {
      setIsAdding(false)
      return
    }
    onCreateGoal?.(activeHorizonId, title, newGoal.description.trim() || undefined)
    setIsAdding(false)
    setNewGoal({ title: '', description: '', showDesc: false })
  }

  const handleNewTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (newGoal.title.trim()) {
        setNewGoal((g) => ({ ...g, showDesc: true }))
      }
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      if (newGoal.title.trim()) {
        setNewGoal((g) => ({ ...g, showDesc: true }))
      }
    }
  }

  const handleNewDescKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveNew()
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
    }
  }

  return (
    <div className="font-['Inter',sans-serif] min-h-[calc(100vh-3.5rem)]">
      {/* Horizon tabs */}
      <div className="border-b border-stone-200 dark:border-stone-800 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex items-end gap-0.5">
          {horizons.map((horizon) => {
            const label = getLabel(horizon.id, horizon.label)
            const isActive = horizon.id === activeHorizonId
            return (
              <button
                key={horizon.id}
                onClick={() => {
                  setActiveHorizonId(horizon.id as HorizonId)
                  setIsAdding(false)
                }}
                className={[
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                  isActive
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:border-stone-300 dark:hover:border-stone-600',
                ].join(' ')}
              >
                {label}
                {horizon.goals.length > 0 && (
                  <span
                    className={[
                      'text-xs tabular-nums px-1.5 py-0.5 rounded-full font-normal',
                      isActive
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                        : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-500',
                    ].join(' ')}
                  >
                    {horizon.goals.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="py-8 max-w-2xl">
        <p className="text-xs font-medium text-stone-400 dark:text-stone-600 uppercase tracking-wide mb-6">
          {HORIZON_CONTEXT[activeHorizonId]}
        </p>

        {activeHorizon ? (
          <>
            {activeHorizon.goals.length === 0 && !isAdding ? (
              <div className="py-16 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center">
                  <Target size={18} className="text-stone-300 dark:text-stone-700" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-stone-400 dark:text-stone-600">
                    No goals yet for this horizon
                  </p>
                  <button
                    onClick={handleStartAdd}
                    className="mt-2 text-sm text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
                  >
                    Add your first goal →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                {activeHorizon.goals.map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    onEditTitle={(title) =>
                      onEditGoalTitle?.(activeHorizonId, goal.id, title)
                    }
                    onEditDescription={(desc) =>
                      onEditGoalDescription?.(activeHorizonId, goal.id, desc)
                    }
                    onDelete={() => onDeleteGoal?.(activeHorizonId, goal.id)}
                  />
                ))}
              </div>
            )}

            {isAdding && (
              <div className="flex items-start gap-3 px-3 py-3 mt-0.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <input
                    autoFocus
                    value={newGoal.title}
                    onChange={(e) =>
                      setNewGoal((g) => ({ ...g, title: e.target.value }))
                    }
                    onKeyDown={handleNewTitleKeyDown}
                    onBlur={() => {
                      if (!newGoal.title.trim() && !newGoal.showDesc) {
                        setIsAdding(false)
                      }
                    }}
                    placeholder="Goal title…"
                    className="w-full bg-transparent text-sm font-medium text-stone-800 dark:text-stone-200 outline-none placeholder:text-stone-400 dark:placeholder:text-stone-600"
                  />
                  {(newGoal.showDesc || newGoal.title.length > 3) && (
                    <textarea
                      autoFocus={newGoal.showDesc}
                      value={newGoal.description}
                      onChange={(e) =>
                        setNewGoal((g) => ({ ...g, description: e.target.value }))
                      }
                      onKeyDown={handleNewDescKeyDown}
                      rows={2}
                      placeholder="Description (optional)…"
                      className="w-full bg-transparent text-xs text-stone-500 dark:text-stone-400 outline-none resize-none placeholder:text-stone-400 dark:placeholder:text-stone-600"
                    />
                  )}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleSaveNew}
                      disabled={!newGoal.title.trim()}
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Save goal
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isAdding && activeHorizon.goals.length > 0 && (
              <button
                onClick={handleStartAdd}
                className="mt-4 flex items-center gap-1.5 text-sm text-stone-400 dark:text-stone-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              >
                <Plus size={14} />
                Add goal
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-stone-400 dark:text-stone-600">
            Select a horizon to view goals.
          </p>
        )}
      </div>
    </div>
  )
}
