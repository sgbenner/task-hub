import { render, screen, fireEvent } from '@testing-library/react'
import { TaskRow, computeDropZone } from '../TaskRow'
import type { Task } from '../../../types/task-lists'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't-1',
  title: 'Task one',
  completed: false,
  order: 0,
  subtasks: [],
  ...overrides,
})

function createDragData(taskId: string, parentId: string | null = null, isSubtask = false) {
  return JSON.stringify({ taskId, parentId, isSubtask })
}

function mockDataTransfer(data: Record<string, string> = {}) {
  const store: Record<string, string> = { ...data }
  return {
    setData: (type: string, val: string) => { store[type] = val },
    getData: (type: string) => store[type] ?? '',
    types: Object.keys(store),
    effectAllowed: 'move',
    dropEffect: 'none',
  }
}

describe('computeDropZone', () => {
  const rect = { top: 0, height: 60, left: 0, width: 300 }

  describe('top-level tasks (isSubtask=false)', () => {
    it('returns "above" when cursor is in top third', () => {
      expect(computeDropZone(10, 100, rect, false)).toBe('above')
      expect(computeDropZone(0, 50, rect, false)).toBe('above')
      expect(computeDropZone(19, 50, rect, false)).toBe('above')
    })

    it('returns "below" when cursor is in bottom third', () => {
      expect(computeDropZone(50, 100, rect, false)).toBe('below')
      expect(computeDropZone(41, 50, rect, false)).toBe('below')
      expect(computeDropZone(60, 50, rect, false)).toBe('below')
    })

    it('returns "nest" when cursor is in middle third', () => {
      expect(computeDropZone(30, 100, rect, false)).toBe('nest')
      expect(computeDropZone(20, 50, rect, false)).toBe('nest')
      expect(computeDropZone(39, 50, rect, false)).toBe('nest')
    })

    it('returns "nest" when cursor is on the right side (>60% width)', () => {
      // Right side always nests regardless of vertical position
      expect(computeDropZone(10, 200, rect, false)).toBe('nest')
      expect(computeDropZone(50, 250, rect, false)).toBe('nest')
      expect(computeDropZone(30, 181, rect, false)).toBe('nest')
    })

    it('does not nest when cursor is left of 60% width', () => {
      expect(computeDropZone(10, 179, rect, false)).toBe('above')
      expect(computeDropZone(50, 100, rect, false)).toBe('below')
    })
  })

  describe('subtask rows (isSubtask=true)', () => {
    it('returns "above" when cursor is in top half', () => {
      expect(computeDropZone(10, 100, rect, true)).toBe('above')
      expect(computeDropZone(29, 100, rect, true)).toBe('above')
    })

    it('returns "below" when cursor is in bottom half', () => {
      expect(computeDropZone(50, 100, rect, true)).toBe('below')
      expect(computeDropZone(41, 100, rect, true)).toBe('below')
    })

    it('never returns "nest" for subtask rows', () => {
      // Center zone for subtask returns above/below, not nest
      expect(computeDropZone(25, 100, rect, true)).toBe('above')
      expect(computeDropZone(35, 100, rect, true)).toBe('below')
      // Right side also doesn't nest for subtasks
      expect(computeDropZone(10, 250, rect, true)).toBe('above')
    })
  })

  it('handles zero-height rect gracefully', () => {
    const zeroRect = { top: 0, height: 0, left: 0, width: 0 }
    // Should not throw, falls back to height=1, width=1
    const result = computeDropZone(0, 0, zeroRect, false)
    expect(['above', 'below', 'nest']).toContain(result)
  })
})

describe('TaskRow drag-and-drop', () => {
  describe('drag source', () => {
    it('sets draggable attribute on non-completed tasks', () => {
      render(<TaskRow task={makeTask()} />)
      const row = screen.getByTestId('task-row-t-1')
      expect(row).toHaveAttribute('draggable', 'true')
    })

    it('does not set draggable on completed tasks', () => {
      render(<TaskRow task={makeTask({ completed: true })} completed />)
      const row = screen.getByTestId('task-row-t-1')
      expect(row).toHaveAttribute('draggable', 'false')
    })

    it('sets task data on dragStart', () => {
      render(<TaskRow task={makeTask()} parentId={null} />)
      const row = screen.getByTestId('task-row-t-1')
      const dt = mockDataTransfer()
      fireEvent.dragStart(row, { dataTransfer: dt })

      const data = JSON.parse(dt.getData('application/taskhub-task'))
      expect(data.taskId).toBe('t-1')
      expect(data.parentId).toBeNull()
      expect(data.isSubtask).toBe(false)
    })

    it('sets subtask data on dragStart for subtask rows', () => {
      render(<TaskRow task={makeTask({ id: 'st-1' })} isSubtask parentId="t-parent" />)
      const row = screen.getByTestId('task-row-st-1')
      const dt = mockDataTransfer()
      fireEvent.dragStart(row, { dataTransfer: dt })

      const data = JSON.parse(dt.getData('application/taskhub-task'))
      expect(data.taskId).toBe('st-1')
      expect(data.parentId).toBe('t-parent')
      expect(data.isSubtask).toBe(true)
    })
  })

  describe('drop target', () => {
    it('does not call onMoveTask when dropping task on itself', () => {
      const onMoveTask = vi.fn()
      render(
        <TaskRow task={makeTask({ id: 't-self' })} taskIndex={0} parentId={null} onMoveTask={onMoveTask} />
      )

      const row = screen.getByTestId('task-row-t-self')
      const dt = mockDataTransfer({
        'application/taskhub-task': createDragData('t-self'),
      })

      fireEvent.drop(row, { dataTransfer: dt })

      expect(onMoveTask).not.toHaveBeenCalled()
    })

    it('calls onMoveTask on drop with valid drag data', () => {
      const onMoveTask = vi.fn()
      const targetTask = makeTask({ id: 't-target', title: 'Target' })

      render(
        <TaskRow task={targetTask} taskIndex={0} parentId={null} onMoveTask={onMoveTask} />
      )

      const row = screen.getByTestId('task-row-t-target')
      const dt = mockDataTransfer({
        'application/taskhub-task': createDragData('t-dragged'),
      })

      fireEvent.drop(row, { dataTransfer: dt })

      // In JSDOM, getBoundingClientRect returns zeros, so computeDropZone
      // gets height=1, width=1 fallback. The exact zone depends on clientY/X defaults.
      // The important thing is onMoveTask IS called with the dragged task id.
      expect(onMoveTask).toHaveBeenCalledTimes(1)
      expect(onMoveTask.mock.calls[0][0]).toBe('t-dragged')
    })

    it('does not call onMoveTask without valid drag data', () => {
      const onMoveTask = vi.fn()
      render(
        <TaskRow task={makeTask({ id: 't-target' })} taskIndex={0} parentId={null} onMoveTask={onMoveTask} />
      )

      const row = screen.getByTestId('task-row-t-target')
      const dt = mockDataTransfer({}) // no task data

      fireEvent.drop(row, { dataTransfer: dt })

      expect(onMoveTask).not.toHaveBeenCalled()
    })

    it('passes onMoveTask to subtask rows when expanded', async () => {
      const onMoveTask = vi.fn()
      const parentTask = makeTask({
        id: 't-parent',
        title: 'Parent',
        subtasks: [
          { id: 'st-1', title: 'Sub one', completed: false, order: 0, subtasks: [] },
        ],
      })

      const { getByTestId, getByLabelText } = render(
        <TaskRow
          task={parentTask}
          taskIndex={0}
          parentId={null}
          onMoveTask={onMoveTask}
          onCompleteSubtask={vi.fn()}
          onUncompleteSubtask={vi.fn()}
          onEditSubtask={vi.fn()}
          onDeleteSubtask={vi.fn()}
        />
      )

      // Expand subtasks
      fireEvent.click(getByLabelText('Expand subtasks'))

      // Subtask row should exist and be a drop target
      const subtaskRow = getByTestId('task-row-st-1')
      expect(subtaskRow).toHaveAttribute('draggable', 'true')
    })
  })

  describe('data-testid', () => {
    it('renders with data-testid containing task id', () => {
      render(<TaskRow task={makeTask({ id: 'my-task' })} />)
      expect(screen.getByTestId('task-row-my-task')).toBeInTheDocument()
    })
  })
})
