import { renderHook, act } from '@testing-library/react'
import { useAiTaskCreator } from '../useAiTaskCreator'
import { supabase } from '../../lib/supabase'
import type { TaskList } from '../../types/task-lists'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}))

const mockLists: TaskList[] = [
  {
    id: 'list-1',
    name: 'Personal',
    order: 0,
    tasks: [{ id: 't-1', title: 'Existing task', completed: false, order: 0, subtasks: [] }],
    completedTasks: [],
  },
  {
    id: 'list-2',
    name: 'Work',
    order: 1,
    tasks: [],
    completedTasks: [],
  },
]

const mockRefetch = vi.fn().mockResolvedValue(undefined)

function mockSupabaseInsert(insertedId: string = 'new-task-id') {
  const single = vi.fn().mockResolvedValue({ data: { id: insertedId }, error: null })
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert })
  return { insert, select, single }
}

describe('useAiTaskCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with idle status', () => {
    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    expect(result.current.status).toBe('idle')
    expect(result.current.createdTasks).toEqual([])
    expect(result.current.errorMessage).toBeNull()
  })

  it('sets loading status when called', async () => {
    // Make invoke hang so we can check loading state
    ;(supabase.functions.invoke as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    act(() => {
      result.current.createTasksFromPrompt('clean the house')
    })

    expect(result.current.status).toBe('loading')
  })

  it('creates tasks successfully', async () => {
    const aiResponse = {
      tasks: [
        { title: 'Clean the house', listId: 'list-1' },
        { title: 'Buy groceries', listId: 'list-1', dueDate: '2026-03-08' },
      ],
    }

    ;(supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: aiResponse,
      error: null,
    })

    mockSupabaseInsert()

    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    await act(async () => {
      await result.current.createTasksFromPrompt('clean the house and buy groceries')
    })

    expect(result.current.status).toBe('done')
    expect(result.current.createdTasks).toHaveLength(2)
    expect(result.current.createdTasks[0].title).toBe('Clean the house')
    expect(result.current.createdTasks[1].dueDate).toBe('2026-03-08')
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('handles edge function error', async () => {
    ;(supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: new Error('Edge function failed'),
    })

    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    await act(async () => {
      await result.current.createTasksFromPrompt('some tasks')
    })

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('Edge function failed')
  })

  it('handles invalid AI response', async () => {
    ;(supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { invalid: true },
      error: null,
    })

    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    await act(async () => {
      await result.current.createTasksFromPrompt('some tasks')
    })

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('Invalid response from AI')
  })

  it('handles DB insert error', async () => {
    ;(supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { tasks: [{ title: 'Test task', listId: 'list-1' }] },
      error: null,
    })

    const single = vi.fn().mockResolvedValue({ data: null, error: new Error('DB insert failed') })
    const select = vi.fn(() => ({ single }))
    const insert = vi.fn(() => ({ select }))
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert })

    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    await act(async () => {
      await result.current.createTasksFromPrompt('test task')
    })

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('DB insert failed')
  })

  it('handles empty prompt gracefully', async () => {
    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    await act(async () => {
      await result.current.createTasksFromPrompt('  ')
    })

    expect(result.current.status).toBe('idle')
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })

  it('handles empty lists gracefully', async () => {
    const { result } = renderHook(() => useAiTaskCreator([], mockRefetch))

    await act(async () => {
      await result.current.createTasksFromPrompt('create tasks')
    })

    expect(result.current.status).toBe('idle')
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })

  it('handles AI returning empty tasks array', async () => {
    ;(supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { tasks: [] },
      error: null,
    })

    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    await act(async () => {
      await result.current.createTasksFromPrompt('gibberish input')
    })

    expect(result.current.status).toBe('done')
    expect(result.current.createdTasks).toEqual([])
  })

  it('resets state correctly', async () => {
    ;(supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { tasks: [{ title: 'Test', listId: 'list-1' }] },
      error: null,
    })

    mockSupabaseInsert()

    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    await act(async () => {
      await result.current.createTasksFromPrompt('test')
    })

    expect(result.current.status).toBe('done')

    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.createdTasks).toEqual([])
    expect(result.current.errorMessage).toBeNull()
  })

  it('creates subtasks when AI returns them', async () => {
    const aiResponse = {
      tasks: [
        {
          title: 'Clean the house',
          listId: 'list-1',
          subtasks: [{ title: 'Vacuum' }, { title: 'Mop floors' }],
        },
      ],
    }

    ;(supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: aiResponse,
      error: null,
    })

    // First call returns parent task id, second call returns subtask insert
    const single = vi.fn().mockResolvedValue({ data: { id: 'parent-id' }, error: null })
    const select = vi.fn(() => ({ single }))
    const insert = vi.fn(() => ({ select }))
    ;(supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ insert })

    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    await act(async () => {
      await result.current.createTasksFromPrompt('clean the house')
    })

    expect(result.current.status).toBe('done')
    expect(result.current.createdTasks[0].subtasks).toHaveLength(2)

    // Verify supabase.from was called for both parent task and subtasks
    expect(supabase.from).toHaveBeenCalledWith('tasks')
  })

  it('calls edge function with correct body', async () => {
    ;(supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { tasks: [] },
      error: null,
    })

    const { result } = renderHook(() => useAiTaskCreator(mockLists, mockRefetch))

    await act(async () => {
      await result.current.createTasksFromPrompt('plan my weekend')
    })

    expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-create-tasks', {
      body: {
        prompt: 'plan my weekend',
        taskLists: [
          { id: 'list-1', name: 'Personal' },
          { id: 'list-2', name: 'Work' },
        ],
      },
    })
  })
})
