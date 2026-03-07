import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import type { Goal } from '../../types/goal-planning'

interface GoalRowProps {
  goal: Goal
  onEditTitle?: (title: string) => void
  onEditDescription?: (description: string) => void
  onDelete?: () => void
}

export function GoalRow({ goal, onEditTitle, onEditDescription, onDelete }: GoalRowProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [titleValue, setTitleValue] = useState(goal.title)
  const [descValue, setDescValue] = useState(goal.description ?? '')

  const handleTitleSubmit = () => {
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== goal.title) {
      onEditTitle?.(trimmed)
    } else {
      setTitleValue(goal.title)
    }
    setEditingTitle(false)
  }

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleTitleSubmit()
    if (e.key === 'Escape') {
      setTitleValue(goal.title)
      setEditingTitle(false)
    }
  }

  const handleDescSubmit = () => {
    const trimmed = descValue.trim()
    if (trimmed !== (goal.description ?? '')) {
      onEditDescription?.(trimmed)
    }
    setEditingDesc(false)
  }

  const handleDescKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleDescSubmit()
    }
    if (e.key === 'Escape') {
      setDescValue(goal.description ?? '')
      setEditingDesc(false)
    }
  }

  return (
    <div className="group flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
      {/* Bullet */}
      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        {editingTitle ? (
          <input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            className="w-full bg-transparent text-sm font-medium text-stone-800 dark:text-stone-200 outline-none border-b border-indigo-400 pb-px"
          />
        ) : (
          <p
            onDoubleClick={() => setEditingTitle(true)}
            onClick={() => setEditingTitle(true)}
            className="text-sm font-medium text-stone-800 dark:text-stone-200 cursor-text leading-snug"
          >
            {goal.title}
          </p>
        )}

        {/* Description */}
        <div className="mt-0.5">
          {editingDesc ? (
            <textarea
              autoFocus
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={handleDescSubmit}
              onKeyDown={handleDescKeyDown}
              rows={2}
              placeholder="Add a description…"
              className="w-full bg-transparent text-xs text-stone-500 dark:text-stone-400 outline-none border-b border-indigo-300 dark:border-indigo-700 resize-none placeholder:text-stone-400 dark:placeholder:text-stone-600 pb-px"
            />
          ) : (
            <p
              onClick={() => setEditingDesc(true)}
              className={[
                'text-xs leading-relaxed cursor-text',
                goal.description
                  ? 'text-stone-500 dark:text-stone-500'
                  : 'text-stone-300 dark:text-stone-700 italic',
              ].join(' ')}
            >
              {goal.description || 'Add a description…'}
            </p>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 p-1 rounded text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
        aria-label="Delete goal"
      >
        <X size={13} />
      </button>
    </div>
  )
}
