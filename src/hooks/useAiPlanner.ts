import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { SearchableTask, AiTaskSuggestion } from '../types/task-lists'

export function useAiPlanner(undoneTasks: SearchableTask[]) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [suggestions, setSuggestions] = useState<AiTaskSuggestion[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const decidedRef = useRef<Set<string>>(new Set())
  const [decidedCount, setDecidedCount] = useState(0)

  const requestPlan = useCallback(
    async (context: string) => {
      if (!context.trim() || undoneTasks.length === 0) return

      setStatus('loading')
      setErrorMessage(null)
      setSuggestions([])
      decidedRef.current = new Set()
      setDecidedCount(0)

      try {
        const { data, error } = await supabase.functions.invoke('ai-plan', {
          body: { context, tasks: undoneTasks },
        })

        if (error) throw error
        if (!data?.suggestions) throw new Error('Invalid response from AI')

        setSuggestions(data.suggestions)
        setStatus('done')
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
      }
    },
    [undoneTasks]
  )

  const acceptSuggestion = useCallback((taskId: string) => {
    decidedRef.current.add(taskId)
    setDecidedCount(decidedRef.current.size)
  }, [])

  const rejectSuggestion = useCallback((taskId: string) => {
    decidedRef.current.add(taskId)
    setDecidedCount(decidedRef.current.size)
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setSuggestions([])
    setErrorMessage(null)
    decidedRef.current = new Set()
    setDecidedCount(0)
  }, [])

  const pendingSuggestions = suggestions.filter(
    (s) => !decidedRef.current.has(s.taskId)
  )

  return {
    status,
    suggestions,
    pendingSuggestions,
    decidedCount,
    errorMessage,
    requestPlan,
    acceptSuggestion,
    rejectSuggestion,
    reset,
  }
}
