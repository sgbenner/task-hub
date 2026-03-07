import { useState, type KeyboardEvent } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import type { AiTaskCreatorState, AiTaskCreatorCallbacks } from '../../types/task-lists'

type AiTaskCreatorInputProps = AiTaskCreatorState & AiTaskCreatorCallbacks

export function AiTaskCreatorInput({
  status,
  createdTasks,
  errorMessage,
  createTasksFromPrompt,
  reset,
}: AiTaskCreatorInputProps) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = () => {
    if (!prompt.trim() || status === 'loading') return
    createTasksFromPrompt(prompt.trim())
    setPrompt('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 group/ai-input pb-3 border-b border-stone-100 dark:border-stone-800 focus-within:border-indigo-200 dark:focus-within:border-indigo-900 transition-colors">
        <Sparkles
          size={18}
          className="text-indigo-400 dark:text-indigo-500 shrink-0"
        />
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={status === 'loading'}
          placeholder="Describe tasks to create with AI\u2026"
          className="flex-1 bg-transparent text-sm text-stone-700 dark:text-stone-300 placeholder:text-stone-400 dark:placeholder:text-stone-600 outline-none disabled:opacity-50"
        />
        {status === 'loading' ? (
          <Loader2 size={16} className="text-indigo-500 animate-spin shrink-0" />
        ) : (
          prompt.trim() && (
            <button
              onClick={handleSubmit}
              className="text-xs font-medium text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950 whitespace-nowrap"
            >
              Create with AI
            </button>
          )
        )}
      </div>

      {/* Status messages */}
      {status === 'loading' && (
        <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
          AI is creating your tasks...
        </p>
      )}

      {status === 'done' && createdTasks.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Created {createdTasks.length} task{createdTasks.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={reset}
            className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-500 dark:hover:text-stone-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {status === 'done' && createdTasks.length === 0 && (
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            No tasks could be extracted from that prompt.
          </p>
          <button
            onClick={reset}
            className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-500 dark:hover:text-stone-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xs text-red-500 dark:text-red-400">
            {errorMessage ?? 'Something went wrong'}
          </p>
          <button
            onClick={reset}
            className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-500 dark:hover:text-stone-300 transition-colors"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
