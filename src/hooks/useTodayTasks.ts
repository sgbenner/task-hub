import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TodayTask, TodayTaskGroup, SearchableTask } from '../types/task-lists'

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

function getLocalDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function useTodayTasks() {
  const [dbLists, setDbLists] = useState<DbTaskList[]>([])
  const [dbTasks, setDbTasks] = useState<DbTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const today = getLocalDateString()

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

    setDbLists(listsRes.data ?? [])
    setDbTasks(tasksRes.data ?? [])
    setError(null)
  }, [])

  useEffect(() => {
    fetchAll().finally(() => setLoading(false))
  }, [fetchAll])

  const listMap = useMemo(() => {
    const map = new Map<string, DbTaskList>()
    for (const list of dbLists) {
      map.set(list.id, list)
    }
    return map
  }, [dbLists])

  const parentTasks = useMemo(() => dbTasks.filter((t) => t.parent_id === null), [dbTasks])
  const childTasks = useMemo(() => dbTasks.filter((t) => t.parent_id !== null), [dbTasks])

  const childrenByParent = useMemo(() => {
    const map = new Map<string, DbTask[]>()
    for (const child of childTasks) {
      const existing = map.get(child.parent_id!) ?? []
      existing.push(child)
      map.set(child.parent_id!, existing)
    }
    return map
  }, [childTasks])

  function toTask(t: DbTask): Task {
    const subtasks = (childrenByParent.get(t.id) ?? [])
      .sort((a, b) => a.order - b.order)
      .map((st) => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
        completedAt: st.completed_at ?? undefined,
        scheduledDate: st.scheduled_date ?? undefined,
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

  const { groups, completedTasks } = useMemo(() => {
    const scheduledParents = parentTasks.filter((t) => t.scheduled_date === today)
    const groupMap = new Map<string, TodayTask[]>()
    const completed: TodayTask[] = []

    for (const dbTask of scheduledParents) {
      const list = listMap.get(dbTask.list_id)
      if (!list) continue
      const task = toTask(dbTask)
      const todayTask: TodayTask = { ...task, listId: list.id, listName: list.name }

      if (task.completed) {
        completed.push(todayTask)
      } else {
        const existing = groupMap.get(list.id) ?? []
        existing.push(todayTask)
        groupMap.set(list.id, existing)
      }
    }

    const groups: TodayTaskGroup[] = []
    for (const list of dbLists) {
      const tasks = groupMap.get(list.id)
      if (tasks && tasks.length > 0) {
        groups.push({ listId: list.id, listName: list.name, tasks })
      }
    }

    return { groups, completedTasks: completed }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentTasks, childrenByParent, listMap, today, dbLists])

  const searchResults: SearchableTask[] = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return parentTasks
      .filter((t) => {
        if (t.completed) return false
        if (t.scheduled_date) return false
        const list = listMap.get(t.list_id)
        if (!list) return false
        return t.title.toLowerCase().includes(query)
      })
      .slice(0, 10)
      .map((t) => {
        const list = listMap.get(t.list_id)!
        return { id: t.id, title: t.title, listId: list.id, listName: list.name }
      })
  }, [searchQuery, parentTasks, listMap])

  const undoneTasks: SearchableTask[] = useMemo(() => {
    return parentTasks
      .filter((t) => {
        if (t.completed) return false
        if (t.scheduled_date) return false
        const list = listMap.get(t.list_id)
        return !!list
      })
      .map((t) => {
        const list = listMap.get(t.list_id)!
        return { id: t.id, title: t.title, listId: list.id, listName: list.name }
      })
  }, [parentTasks, listMap])

  const scheduleTask = useCallback(async (taskId: string, date?: string) => {
    const scheduleDate = date ?? today
    setDbTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, scheduled_date: scheduleDate } : t))
    )
    setSearchQuery('')

    const { error } = await supabase
      .from('tasks')
      .update({ scheduled_date: scheduleDate })
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [today, fetchAll])

  const unscheduleTask = useCallback(async (taskId: string) => {
    setDbTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, scheduled_date: null } : t))
    )

    const { error } = await supabase
      .from('tasks')
      .update({ scheduled_date: null })
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      await fetchAll()
    }
  }, [fetchAll])

  const completeTask = useCallback(async (taskId: string) => {
    const now = new Date().toISOString()
    setDbTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: true, completed_at: now } : t))
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

  const uncompleteTask = useCallback(async (taskId: string) => {
    setDbTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: false, completed_at: null } : t))
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

  const completeSubtask = useCallback(async (_parentId: string, subtaskId: string) => {
    const now = new Date().toISOString()
    setDbTasks((prev) =>
      prev.map((t) => (t.id === subtaskId ? { ...t, completed: true, completed_at: now } : t))
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

  const uncompleteSubtask = useCallback(async (_parentId: string, subtaskId: string) => {
    setDbTasks((prev) =>
      prev.map((t) => (t.id === subtaskId ? { ...t, completed: false, completed_at: null } : t))
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

  return {
    groups,
    completedTasks,
    searchResults,
    searchQuery,
    setSearchQuery,
    scheduleTask,
    unscheduleTask,
    completeTask,
    uncompleteTask,
    completeSubtask,
    uncompleteSubtask,
    undoneTasks,
    loading,
    error,
  }
}
