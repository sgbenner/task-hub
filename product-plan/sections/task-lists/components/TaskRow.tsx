import { useState, useRef, type KeyboardEvent } from 'react'
import { GripVertical, X } from 'lucide-react'
import type { Task } from '../types'

interface TaskRowProps {
  task: Task
  completed?: boolean
  onComplete?: () => void
  onUncomplete?: () => void
  onEdit?: (title: string) => void
  onDelete?: () => void
}

export function TaskRow({
  task,
  completed = false,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
}: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDoubleClick = () => {
    if (completed) return
    setIsEditing(true)
    setEditValue(task.title)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleEditSubmit = () => {
    if (editValue.trim() && editValue.trim() !== task.title) {
      onEdit?.(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleEditSubmit()
    if (e.key === 'Escape') {
      setEditValue(task.title)
      setIsEditing(false)
    }
  }

  const handleCheck = () => {
    if (completed) {
      onUncomplete?.()
    } else {
      onComplete?.()
    }
  }

  return (
    <div className="flex items-center gap-2.5 px-1 py-1.5 rounded-lg group hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
      {/* Drag handle */}
      <GripVertical
        size={14}
        className="text-stone-300 dark:text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0 -ml-1"
      />

      {/* Checkbox */}
      <button
        onClick={handleCheck}
        className={[
          'w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150',
          completed
            ? 'border-indigo-400 bg-indigo-500 dark:border-indigo-500 dark:bg-indigo-600'
            : 'border-stone-300 dark:border-stone-600 hover:border-indigo-400 dark:hover:border-indigo-500',
        ].join(' ')}
        aria-label={completed ? 'Mark active' : 'Complete task'}
      >
        {completed && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" className="text-white">
            <path
              d="M1 3.5L3 5.5L8 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Task title */}
      {isEditing ? (
        <input
          ref={inputRef}
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditSubmit}
          onKeyDown={handleEditKeyDown}
          className="flex-1 bg-transparent text-sm text-stone-800 dark:text-stone-200 outline-none border-b border-indigo-400 pb-px"
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className={[
            'flex-1 text-sm leading-snug cursor-default select-none',
            completed
              ? 'line-through text-stone-400 dark:text-stone-600'
              : 'text-stone-700 dark:text-stone-300',
          ].join(' ')}
        >
          {task.title}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
        aria-label="Delete task"
      >
        <X size={12} />
      </button>
    </div>
  )
}
