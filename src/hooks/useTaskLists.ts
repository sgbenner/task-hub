import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { TaskList, Task } from '../types/task-lists'

interface DbTaskList {
  id: string
  name: string
  order: number
}

interface DbTask {
  id: string
  list_id: string
  title: string
  completed: boolean
  completed_at: string | null
  order: number
}

function buildLists(dbLists: DbTaskList[], dbTasks: DbTask[]): TaskList[] {
  return dbLists
    .sort((a, b) => a.order - b.order)
    .map((list) => {
      const listTasks = dbTasks.filter((t) => t.list_id === list.id)
      return {
        id: list.id,
        name: list.name,
        order: list.order,
        tasks: listTasks
          .filter((t) => !t.completed)
          .sort((a, b) => a.order - b.order)
          .map(toTask),
        completedTasks: listTasks
          .filter((t) => t.completed)
          .sort((a, b) => a.order - b.order)
          .map(toTask),
      }
    })
}

function toTask(t: DbTask): Task {
  return {
    id: t.id,
    title: t.title,
    completed: t.completed,
    completedAt: t.completed_at ?? undefined,
    order: t.order,
  }
}

export function useTaskLists() {
  const [lists, setLists] = useState<TaskList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    const [listsRes, tasksRes] = await Promise.all([
      supabase.from('task_lists').select('*').order('order'),
      supabase.from('tasks').select('*').order('order'),
    ])

    if (listsRes.error) {
      setError(listsRes.error.message)
      return
    }
    if (tasksRes.error) {
      setError(tasksRes.error.message)
      return
    }

    setLists(buildLists(listsRes.data ?? [], tasksRes.data ?? []))
    setError(null)
  }, [])

  useEffect(() => {
    fetchAll().finally(() => setLoading(false))
  }, [fetchAll])

  const createList = useCallback(async (name: string) => {
    const maxOrder = lists.reduce((max, l) => Math.max(max, l.order), -1)
    const tempId = crypto.randomUUID()
    const newList: TaskList = {
      id: tempId,
      name,
      order: maxOrder + 1,
      tasks: [],
      completedTasks: [],
    }

    setLists((prev) => [...prev, newList])

    const { error } = await supabase
      .from('task_lists')
      .insert({ name, order: maxOrder + 1 })

    if (error) {
      setLists((prev) => prev.filter((l) => l.id !== tempId))
      setError(error.message)
      return
    }

    await fetchAll()
  }, [lists, fetchAll])

  const renameList = useCallback(async (listId: string, name: string) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, name } : l))
    )

    const { error } = await supabase
      .from('task_lists')
      .update({ name })
      .eq('id', listId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const deleteList = useCallback(async (listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId))

    const { error } = await supabase
      .from('task_lists')
      .delete()
      .eq('id', listId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const createTask = useCallback(async (listId: string, title: string) => {
    const list = lists.find((l) => l.id === listId)
    const maxOrder = list
      ? Math.max(
          ...list.tasks.map((t) => t.order),
          ...list.completedTasks.map((t) => t.order),
          -1
        )
      : -1
    const tempId = crypto.randomUUID()
    const newTask: Task = {
      id: tempId,
      title,
      completed: false,
      order: maxOrder + 1,
    }

    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, tasks: [...l.tasks, newTask] } : l
      )
    )

    const { error } = await supabase
      .from('tasks')
      .insert({ list_id: listId, title, order: maxOrder + 1 })

    if (error) {
      setError(error.message)
    }

    await fetchAll()
  }, [lists, fetchAll])

  const editTask = useCallback(async (listId: string, taskId: string, title: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              tasks: l.tasks.map((t) =>
                t.id === taskId ? { ...t, title } : t
              ),
            }
          : l
      )
    )

    const { error } = await supabase
      .from('tasks')
      .update({ title })
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const completeTask = useCallback(async (listId: string, taskId: string) => {
    const now = new Date().toISOString()
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l
        const task = l.tasks.find((t) => t.id === taskId)
        if (!task) return l
        return {
          ...l,
          tasks: l.tasks.filter((t) => t.id !== taskId),
          completedTasks: [
            ...l.completedTasks,
            { ...task, completed: true, completedAt: now },
          ],
        }
      })
    )

    const { error } = await supabase
      .from('tasks')
      .update({ completed: true, completed_at: now })
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const uncompleteTask = useCallback(async (listId: string, taskId: string) => {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l
        const task = l.completedTasks.find((t) => t.id === taskId)
        if (!task) return l
        return {
          ...l,
          completedTasks: l.completedTasks.filter((t) => t.id !== taskId),
          tasks: [
            ...l.tasks,
            { ...task, completed: false, completedAt: undefined },
          ],
        }
      })
    )

    const { error } = await supabase
      .from('tasks')
      .update({ completed: false, completed_at: null })
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const deleteTask = useCallback(async (_listId: string, taskId: string) => {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        tasks: l.tasks.filter((t) => t.id !== taskId),
        completedTasks: l.completedTasks.filter((t) => t.id !== taskId),
      }))
    )

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const reorderTasks = useCallback(async (listId: string, orderedIds: string[]) => {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l
        const reordered = orderedIds
          .map((id, i) => {
            const task = l.tasks.find((t) => t.id === id)
            return task ? { ...task, order: i } : null
          })
          .filter(Boolean) as Task[]
        return { ...l, tasks: reordered }
      })
    )

    const updates = orderedIds.map((id, i) =>
      supabase.from('tasks').update({ order: i }).eq('id', id)
    )
    await Promise.all(updates)
  }, [])

  const reorderLists = useCallback(async (orderedIds: string[]) => {
    setLists((prev) => {
      const reordered = orderedIds
        .map((id, i) => {
          const list = prev.find((l) => l.id === id)
          return list ? { ...list, order: i } : null
        })
        .filter(Boolean) as TaskList[]
      return reordered
    })

    const updates = orderedIds.map((id, i) =>
      supabase.from('task_lists').update({ order: i }).eq('id', id)
    )
    await Promise.all(updates)
  }, [])

  return {
    lists,
    loading,
    error,
    createList,
    renameList,
    deleteList,
    createTask,
    editTask,
    completeTask,
    uncompleteTask,
    deleteTask,
    reorderTasks,
    reorderLists,
  }
}
