import { useState } from 'react'
import { Sparkles, Loader2, Check, X, RotateCcw } from 'lucide-react'
import type { AiPlannerProps } from '../../types/task-lists'

function formatSuggestedDate(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Parse as local date (YYYY-MM-DD)
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)

  if (date.getTime() === today.getTime()) return 'Today'
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow'

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function SuggestionCard({
  title,
  listName,
  suggestedDate,
  reason,
  onAccept,
  onDismiss,
}: {
  title: string
  listName: string
  suggestedDate: string
  reason: string
  onAccept: () => void
  onDismiss: () => void
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">
            {title}
          </span>
          <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
            {listName}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium">
            {formatSuggestedDate(suggestedDate)}
          </span>
          <span className="text-xs text-stone-400 dark:text-stone-500 italic">
            {reason}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onAccept}
          className="p-1.5 rounded-md text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
          aria-label="Accept suggestion"
        >
          <Check size={14} />
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Dismiss suggestion"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

export function AiPlannerPanel({
  status,
  suggestions,
  pendingSuggestions,
  decidedCount,
  errorMessage,
  requestPlan,
  acceptSuggestion,
  rejectSuggestion,
  reset,
  taskMap,
}: AiPlannerProps) {
  const [input, setInput] = useState('')

  if (status === 'idle') {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) requestPlan(input)
            }}
            placeholder="I have 2 hours for household chores…"
            className="flex-1 text-sm bg-transparent border-b border-stone-200 dark:border-stone-700 focus:border-indigo-300 dark:focus:border-indigo-800 outline-none py-1.5 text-stone-700 dark:text-stone-300 placeholder:text-stone-400 dark:placeholder:text-stone-600 transition-colors"
          />
          <button
            onClick={() => { if (input.trim()) requestPlan(input) }}
            disabled={!input.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles size={14} />
            Plan my day
          </button>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="mb-6 flex items-center gap-2 py-4">
        <Loader2 size={16} className="animate-spin text-indigo-500" />
        <span className="text-sm text-stone-500 dark:text-stone-400">Thinking…</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">{errorMessage}</p>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
        >
          <RotateCcw size={12} />
          Try again
        </button>
      </div>
    )
  }

  // status === 'done'
  const total = suggestions.length

  if (total === 0) {
    return (
      <div className="mb-6 p-3 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <p className="text-sm text-stone-500 dark:text-stone-400">No suggestions for that context.</p>
        <button
          onClick={reset}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 dark:hover:text-stone-400 dark:hover:text-stone-300 transition-colors"
        >
          <RotateCcw size={12} />
          Try again
        </button>
      </div>
    )
  }

  if (pendingSuggestions.length === 0) {
    return (
      <div className="mb-6 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          All done! Reviewed {total} suggestion{total !== 1 ? 's' : ''}.
        </p>
        <button
          onClick={reset}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          <Sparkles size={12} />
          Plan again
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${(decidedCount / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-stone-400 dark:text-stone-500 tabular-nums shrink-0">
          {decidedCount}/{total}
        </span>
        <button
          onClick={reset}
          className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
          aria-label="Close planner"
        >
          <X size={14} />
        </button>
      </div>

      {/* Suggestion cards */}
      {pendingSuggestions.map((s) => {
        const task = taskMap.get(s.taskId)
        return (
          <SuggestionCard
            key={s.taskId}
            title={task?.title ?? s.taskId}
            listName={task?.listName ?? ''}
            suggestedDate={s.suggestedDate}
            reason={s.reason}
            onAccept={() => acceptSuggestion(s.taskId)}
            onDismiss={() => rejectSuggestion(s.taskId)}
          />
        )
      })}
    </div>
  )
}
