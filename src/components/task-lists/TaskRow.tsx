import { useState, useRef, type KeyboardEvent } from 'react'
import { GripVertical, X, ChevronRight, ChevronDown, Plus, Calendar } from 'lucide-react'
import type { Task } from '../../types/task-lists'

function getLocalDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDueDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dueDate: string, completed: boolean): boolean {
  if (completed) return false
  return dueDate < getLocalDateString()
}

interface TaskRowProps {
  task: Task
  completed?: boolean
  isSubtask?: boolean
  showDragHandle?: boolean
  extraActions?: React.ReactNode
  onComplete?: () => void
  onUncomplete?: () => void
  onEdit?: (title: string) => void
  onDelete?: () => void
  onCreateSubtask?: (title: string) => void
  onCompleteSubtask?: (subtaskId: string) => void
  onUncompleteSubtask?: (subtaskId: string) => void
  onEditSubtask?: (subtaskId: string, title: string) => void
  onDeleteSubtask?: (subtaskId: string) => void
  onUpdateDueDate?: (date: string | null) => void
}

export function TaskRow({
  task,
  completed = false,
  isSubtask = false,
  showDragHandle = true,
  extraActions,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
  onCreateSubtask,
  onCompleteSubtask,
  onUncompleteSubtask,
  onEditSubtask,
  onDeleteSubtask,
  onUpdateDueDate,
}: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const [expanded, setExpanded] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const overdue = !isSubtask && !!task.dueDate && isOverdue(task.dueDate, completed)
  const hasSubtasks = task.subtasks.length > 0
  const completedSubtaskCount = task.subtasks.filter((s) => s.completed).length
  const totalSubtaskCount = task.subtasks.length

  const handleDoubleClick = () => {
    if (completed && isSubtask) return
    if (completed && !isSubtask) return
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

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return
    onCreateSubtask?.(newSubtaskTitle.trim())
    setNewSubtaskTitle('')
  }

  const handleSubtaskKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddSubtask()
    if (e.key === 'Escape') setNewSubtaskTitle('')
  }

  return (
    <div>
      <div className={[
        'flex items-center gap-2.5 px-1 py-1.5 rounded-lg group transition-colors',
        overdue
          ? 'bg-red-50/60 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/30'
          : 'hover:bg-stone-50 dark:hover:bg-stone-800/40',
      ].join(' ')}>
        {/* Expand/collapse chevron — only for non-subtask rows */}
        {!isSubtask ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className={[
              'shrink-0 -ml-1 p-0.5 rounded transition-all',
              hasSubtasks
                ? 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
                : 'text-stone-300 dark:text-stone-700 opacity-0 group-hover:opacity-100',
            ].join(' ')}
            aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          // Spacer for subtask alignment
          <div className="w-[14px] shrink-0 -ml-1" />
        )}

        {/* Drag handle — only for non-subtask rows when enabled */}
        {!isSubtask && showDragHandle && (
          <GripVertical
            size={14}
            className="text-stone-300 dark:text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0"
          />
        )}

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

        {/* Due date indicator */}
        {!isSubtask && task.dueDate && (
          <span
            className={[
              'text-xs tabular-nums shrink-0 flex items-center gap-1',
              isOverdue(task.dueDate, completed)
                ? 'text-red-500 dark:text-red-400 font-medium'
                : 'text-stone-400 dark:text-stone-500',
            ].join(' ')}
          >
            <Calendar size={11} />
            {formatDueDate(task.dueDate)}
          </span>
        )}

        {/* Due date picker */}
        {!isSubtask && onUpdateDueDate && (
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setTimeout(() => dateInputRef.current?.showPicker(), 0)
              }}
              className={[
                'transition-opacity p-1 rounded shrink-0',
                task.dueDate
                  ? 'opacity-0 group-hover:opacity-100 text-stone-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950'
                  : 'opacity-0 group-hover:opacity-100 text-stone-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950',
              ].join(' ')}
              aria-label="Set due date"
            >
              <Calendar size={12} />
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={task.dueDate ?? ''}
              onChange={(e) => {
                const val = e.target.value
                onUpdateDueDate(val || null)
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              tabIndex={-1}
            />
          </div>
        )}

        {/* Subtask progress badge */}
        {!isSubtask && hasSubtasks && !expanded && (
          <span className="text-xs tabular-nums text-stone-400 dark:text-stone-500 shrink-0">
            {completedSubtaskCount}/{totalSubtaskCount}
          </span>
        )}

        {/* Add subtask button — only for non-subtask, non-completed rows */}
        {!isSubtask && !completed && (
          <button
            onClick={() => setExpanded(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-stone-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 shrink-0"
            aria-label="Add subtask"
          >
            <Plus size={12} />
          </button>
        )}

        {/* Extra actions (e.g. unschedule) */}
        {extraActions}

        {/* Delete */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
            aria-label="Delete task"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Subtask list (expanded) */}
      {!isSubtask && expanded && (
        <div className="pl-8 space-y-0.5">
          {task.subtasks.map((subtask) => (
            <TaskRow
              key={subtask.id}
              task={subtask}
              completed={subtask.completed}
              isSubtask
              onComplete={() => onCompleteSubtask?.(subtask.id)}
              onUncomplete={() => onUncompleteSubtask?.(subtask.id)}
              onEdit={(title) => onEditSubtask?.(subtask.id, title)}
              onDelete={() => onDeleteSubtask?.(subtask.id)}
            />
          ))}

          {/* Add subtask input */}
          {!completed && (
            <div className="flex items-center gap-2.5 px-1 py-1 ml-[14px]">
              <div className="w-[14px] shrink-0" />
              <input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleSubtaskKeyDown}
                placeholder="Add subtask…"
                className="flex-1 bg-transparent text-xs text-stone-500 dark:text-stone-400 placeholder:text-stone-300 dark:placeholder:text-stone-600 outline-none py-0.5"
              />
              {newSubtaskTitle.trim() && (
                <button
                  onClick={handleAddSubtask}
                  className="text-xs font-medium text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-1.5 py-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950"
                >
                  Add
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
