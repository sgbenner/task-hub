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
  parent_id: string | null
  scheduled_date: string | null
  due_date: string | null
}

function buildLists(dbLists: DbTaskList[], dbTasks: DbTask[]): TaskList[] {
  const parentTasks = dbTasks.filter((t) => t.parent_id === null)
  const childTasks = dbTasks.filter((t) => t.parent_id !== null)

  const childrenByParent = new Map<string, DbTask[]>()
  for (const child of childTasks) {
    const existing = childrenByParent.get(child.parent_id!) ?? []
    existing.push(child)
    childrenByParent.set(child.parent_id!, existing)
  }

  function toTask(t: DbTask): Task {
    const subtasks = (childrenByParent.get(t.id) ?? [])
      .sort((a, b) => a.order - b.order)
      .map((st) => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
        completedAt: st.completed_at ?? undefined,
        dueDate: st.due_date ?? undefined,
        order: st.order,
        subtasks: [],
      }))

    return {
      id: t.id,
      title: t.title,
      completed: t.completed,
      completedAt: t.completed_at ?? undefined,
      scheduledDate: t.scheduled_date ?? undefined,
      dueDate: t.due_date ?? undefined,
      order: t.order,
      subtasks,
    }
  }

  return dbLists
    .sort((a, b) => a.order - b.order)
    .map((list) => {
      const listTasks = parentTasks.filter((t) => t.list_id === list.id)
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
      subtasks: [],
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

  const createSubtask = useCallback(async (listId: string, parentId: string, title: string) => {
    const list = lists.find((l) => l.id === listId)
    const parent = list?.tasks.find((t) => t.id === parentId)
      ?? list?.completedTasks.find((t) => t.id === parentId)
    const maxOrder = parent
      ? Math.max(...parent.subtasks.map((s) => s.order), -1)
      : -1

    const tempId = crypto.randomUUID()
    const newSubtask: Task = {
      id: tempId,
      title,
      completed: false,
      order: maxOrder + 1,
      subtasks: [],
    }

    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l
        const addSubtask = (t: Task) =>
          t.id === parentId ? { ...t, subtasks: [...t.subtasks, newSubtask] } : t
        return {
          ...l,
          tasks: l.tasks.map(addSubtask),
          completedTasks: l.completedTasks.map(addSubtask),
        }
      })
    )

    const { error } = await supabase
      .from('tasks')
      .insert({ list_id: listId, title, order: maxOrder + 1, parent_id: parentId })

    if (error) {
      setError(error.message)
    }

    await fetchAll()
  }, [lists, fetchAll])

  const editSubtask = useCallback(async (_listId: string, _parentId: string, subtaskId: string, title: string) => {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        tasks: l.tasks.map((t) => ({
          ...t,
          subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, title } : s)),
        })),
        completedTasks: l.completedTasks.map((t) => ({
          ...t,
          subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, title } : s)),
        })),
      }))
    )

    const { error } = await supabase
      .from('tasks')
      .update({ title })
      .eq('id', subtaskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const completeSubtask = useCallback(async (_listId: string, _parentId: string, subtaskId: string) => {
    const now = new Date().toISOString()
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        tasks: l.tasks.map((t) => ({
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: true, completedAt: now } : s
          ),
        })),
        completedTasks: l.completedTasks.map((t) => ({
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: true, completedAt: now } : s
          ),
        })),
      }))
    )

    const { error } = await supabase
      .from('tasks')
      .update({ completed: true, completed_at: now })
      .eq('id', subtaskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const uncompleteSubtask = useCallback(async (_listId: string, _parentId: string, subtaskId: string) => {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        tasks: l.tasks.map((t) => ({
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: false, completedAt: undefined } : s
          ),
        })),
        completedTasks: l.completedTasks.map((t) => ({
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: false, completedAt: undefined } : s
          ),
        })),
      }))
    )

    const { error } = await supabase
      .from('tasks')
      .update({ completed: false, completed_at: null })
      .eq('id', subtaskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const updateDueDate = useCallback(async (taskId: string, date: string | null) => {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        tasks: l.tasks.map((t) =>
          t.id === taskId ? { ...t, dueDate: date ?? undefined } : t
        ),
        completedTasks: l.completedTasks.map((t) =>
          t.id === taskId ? { ...t, dueDate: date ?? undefined } : t
        ),
      }))
    )

    const { error } = await supabase
      .from('tasks')
      .update({ due_date: date })
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const deleteSubtask = useCallback(async (_listId: string, _parentId: string, subtaskId: string) => {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        tasks: l.tasks.map((t) => ({
          ...t,
          subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
        })),
        completedTasks: l.completedTasks.map((t) => ({
          ...t,
          subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
        })),
      }))
    )

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', subtaskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

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
    createSubtask,
    editSubtask,
    completeSubtask,
    uncompleteSubtask,
    deleteSubtask,
    updateDueDate,
  }
}
