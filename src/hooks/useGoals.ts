import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Horizon, Goal, HorizonId } from '../types/goal-planning'

interface DbGoal {
  id: string
  horizon_id: string
  title: string
  description: string | null
  order: number
}

const HORIZON_LABELS: Record<HorizonId, string> = {
  '1-year': '1 Year',
  '5-year': '5 Years',
  '10-year': '10 Years',
}

const HORIZON_IDS: HorizonId[] = ['1-year', '5-year', '10-year']

function buildHorizons(dbGoals: DbGoal[]): Horizon[] {
  return HORIZON_IDS.map((id) => ({
    id,
    label: HORIZON_LABELS[id],
    goals: dbGoals
      .filter((g) => g.horizon_id === id)
      .sort((a, b) => a.order - b.order)
      .map(toGoal),
  }))
}

function toGoal(g: DbGoal): Goal {
  return {
    id: g.id,
    title: g.title,
    description: g.description ?? undefined,
  }
}

export function useGoals() {
  const [horizons, setHorizons] = useState<Horizon[]>(
    HORIZON_IDS.map((id) => ({ id, label: HORIZON_LABELS[id], goals: [] }))
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('goals')
      .select('*')
      .order('order')

    if (err) {
      setError(err.message)
      return
    }

    setHorizons(buildHorizons(data ?? []))
    setError(null)
  }, [])

  useEffect(() => {
    fetchAll().finally(() => setLoading(false))
  }, [fetchAll])

  const createGoal = useCallback(async (horizonId: HorizonId, title: string, description?: string) => {
    const horizon = horizons.find((h) => h.id === horizonId)
    const maxOrder = horizon
      ? horizon.goals.reduce((max, _g, i) => Math.max(max, i), -1)
      : -1

    const tempId = crypto.randomUUID()
    const newGoal: Goal = { id: tempId, title, description }

    setHorizons((prev) =>
      prev.map((h) =>
        h.id === horizonId ? { ...h, goals: [...h.goals, newGoal] } : h
      )
    )

    const { error: err } = await supabase
      .from('goals')
      .insert({
        horizon_id: horizonId,
        title,
        description: description ?? null,
        order: maxOrder + 1,
      })

    if (err) {
      setError(err.message)
    }

    await fetchAll()
  }, [horizons, fetchAll])

  const editGoalTitle = useCallback(async (horizonId: HorizonId, goalId: string, title: string) => {
    setHorizons((prev) =>
      prev.map((h) =>
        h.id === horizonId
          ? {
              ...h,
              goals: h.goals.map((g) =>
                g.id === goalId ? { ...g, title } : g
              ),
            }
          : h
      )
    )

    const { error: err } = await supabase
      .from('goals')
      .update({ title })
      .eq('id', goalId)

    if (err) {
      setError(err.message)
      await fetchAll()
    }
  }, [fetchAll])

  const editGoalDescription = useCallback(async (horizonId: HorizonId, goalId: string, description: string) => {
    setHorizons((prev) =>
      prev.map((h) =>
        h.id === horizonId
          ? {
              ...h,
              goals: h.goals.map((g) =>
                g.id === goalId ? { ...g, description } : g
              ),
            }
          : h
      )
    )

    const { error: err } = await supabase
      .from('goals')
      .update({ description: description || null })
      .eq('id', goalId)

    if (err) {
      setError(err.message)
      await fetchAll()
    }
  }, [fetchAll])

  const deleteGoal = useCallback(async (horizonId: HorizonId, goalId: string) => {
    setHorizons((prev) =>
      prev.map((h) =>
        h.id === horizonId
          ? { ...h, goals: h.goals.filter((g) => g.id !== goalId) }
          : h
      )
    )

    const { error: err } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (err) {
      setError(err.message)
      await fetchAll()
    }
  }, [fetchAll])

  return {
    horizons,
    loading,
    error,
    createGoal,
    editGoalTitle,
    editGoalDescription,
    deleteGoal,
  }
}
