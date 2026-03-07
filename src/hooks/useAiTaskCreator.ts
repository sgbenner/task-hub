import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { TaskList, AiCreatedTask } from '../types/task-lists'

export function useAiTaskCreator(
  lists: TaskList[],
  refetchLists: () => Promise<void>
) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [createdTasks, setCreatedTasks] = useState<AiCreatedTask[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const createTasksFromPrompt = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || lists.length === 0) return

      setStatus('loading')
      setErrorMessage(null)
      setCreatedTasks([])

      try {
        const taskLists = lists.map((l) => ({ id: l.id, name: l.name }))

        const { data, error } = await supabase.functions.invoke('ai-create-tasks', {
          body: { prompt, taskLists },
        })

        if (error) throw error
        if (!data?.tasks || !Array.isArray(data.tasks)) throw new Error('Invalid response from AI')

        const aiTasks: AiCreatedTask[] = data.tasks

        if (aiTasks.length === 0) {
          setCreatedTasks([])
          setStatus('done')
          return
        }

        // Bulk insert tasks into Supabase
        for (const aiTask of aiTasks) {
          const list = lists.find((l) => l.id === aiTask.listId)
          const maxOrder = list
            ? Math.max(
                ...list.tasks.map((t) => t.order),
                ...list.completedTasks.map((t) => t.order),
                -1
              )
            : -1

          const { data: insertedTask, error: insertError } = await supabase
            .from('tasks')
            .insert({
              list_id: aiTask.listId,
              title: aiTask.title,
              order: maxOrder + 1,
              due_date: aiTask.dueDate ?? null,
            })
            .select('id')
            .single()

          if (insertError) throw insertError

          // Insert subtasks if present
          if (aiTask.subtasks && aiTask.subtasks.length > 0 && insertedTask) {
            const subtaskInserts = aiTask.subtasks.map((st, i) => ({
              list_id: aiTask.listId,
              title: st.title,
              order: i,
              parent_id: insertedTask.id,
            }))

            const { error: subtaskError } = await supabase
              .from('tasks')
              .insert(subtaskInserts)

            if (subtaskError) throw subtaskError
          }
        }

        setCreatedTasks(aiTasks)
        setStatus('done')
        await refetchLists()
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
        await refetchLists()
      }
    },
    [lists, refetchLists]
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setCreatedTasks([])
    setErrorMessage(null)
  }, [])

  return {
    status,
    createdTasks,
    errorMessage,
    createTasksFromPrompt,
    reset,
  }
}
