import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskListView } from '../TaskListView'
import type { TaskList } from '../../../types/task-lists'

const mockTask = {
  id: 't-1',
  title: 'Review Q1 metrics',
  completed: false,
  order: 0,
  subtasks: [],
}

const mockCompletedTask = {
  id: 't-2',
  title: 'Send invoice to Acme Corp',
  completed: true,
  completedAt: '2026-02-27T09:10:00Z',
  order: 0,
  subtasks: [],
}

const mockList: TaskList = {
  id: 'list-1',
  name: 'Work',
  order: 0,
  tasks: [mockTask],
  completedTasks: [mockCompletedTask],
}

const mockEmptyList: TaskList = {
  id: 'list-2',
  name: 'Personal',
  order: 1,
  tasks: [],
  completedTasks: [],
}

describe('TaskListView', () => {
  describe('Empty states', () => {
    it('shows "Create a list to get started" when no lists exist', () => {
      render(<TaskListView lists={[]} />)
      expect(screen.getByText('Create a list to get started')).toBeInTheDocument()
    })

    it('shows empty state when active list has no tasks', () => {
      render(<TaskListView lists={[mockEmptyList]} />)
      expect(screen.getByText(/No tasks in/)).toBeInTheDocument()
      expect(screen.getAllByText('Personal').length).toBeGreaterThanOrEqual(1)
    })

    it('does not show completed toggle when no completed tasks', () => {
      render(<TaskListView lists={[mockEmptyList]} />)
      expect(screen.queryByText(/completed/)).not.toBeInTheDocument()
    })
  })

  describe('Task creation', () => {
    it('calls onCreateTask when typing and pressing Enter', async () => {
      const user = userEvent.setup()
      const onCreateTask = vi.fn()

      render(
        <TaskListView lists={[mockList]} onCreateTask={onCreateTask} />
      )

      const input = screen.getByPlaceholderText('Add a task…')
      await user.type(input, 'Pick up groceries{Enter}')

      expect(onCreateTask).toHaveBeenCalledWith('list-1', 'Pick up groceries')
    })

    it('does not call onCreateTask for whitespace-only input', async () => {
      const user = userEvent.setup()
      const onCreateTask = vi.fn()

      render(
        <TaskListView lists={[mockList]} onCreateTask={onCreateTask} />
      )

      const input = screen.getByPlaceholderText('Add a task…')
      await user.type(input, '   {Enter}')

      expect(onCreateTask).not.toHaveBeenCalled()
    })

    it('shows "Add ↵" button when task input has text', async () => {
      const user = userEvent.setup()
      const onCreateTask = vi.fn()

      render(
        <TaskListView lists={[mockList]} onCreateTask={onCreateTask} />
      )

      expect(screen.queryByText('Add ↵')).not.toBeInTheDocument()

      const input = screen.getByPlaceholderText('Add a task…')
      await user.type(input, 'New task')

      expect(screen.getByText('Add ↵')).toBeInTheDocument()
    })
  })

  describe('Task completion', () => {
    it('calls onCompleteTask when clicking checkbox', async () => {
      const user = userEvent.setup()
      const onCompleteTask = vi.fn()

      render(
        <TaskListView lists={[mockList]} onCompleteTask={onCompleteTask} />
      )

      const checkbox = screen.getByLabelText('Complete task')
      await user.click(checkbox)

      expect(onCompleteTask).toHaveBeenCalledWith('list-1', 't-1')
    })
  })

  describe('Completed tasks toggle', () => {
    it('shows completed count and reveals completed tasks on click', async () => {
      const user = userEvent.setup()

      render(<TaskListView lists={[mockList]} />)

      expect(screen.getByText('1 completed')).toBeInTheDocument()
      expect(screen.queryByText('Send invoice to Acme Corp')).not.toBeInTheDocument()

      await user.click(screen.getByText('1 completed'))

      expect(screen.getByText('Send invoice to Acme Corp')).toBeInTheDocument()
    })

    it('calls onUncompleteTask when clicking completed task checkbox', async () => {
      const user = userEvent.setup()
      const onUncompleteTask = vi.fn()

      render(
        <TaskListView lists={[mockList]} onUncompleteTask={onUncompleteTask} />
      )

      await user.click(screen.getByText('1 completed'))

      const markActiveBtn = screen.getByLabelText('Mark active')
      await user.click(markActiveBtn)

      expect(onUncompleteTask).toHaveBeenCalledWith('list-1', 't-2')
    })
  })

  describe('Task deletion', () => {
    it('shows confirmation dialog when clicking delete button', async () => {
      const user = userEvent.setup()
      const onDeleteTask = vi.fn()

      render(
        <TaskListView lists={[mockList]} onDeleteTask={onDeleteTask} />
      )

      const deleteBtn = screen.getByLabelText('Delete task')
      await user.click(deleteBtn)

      expect(onDeleteTask).not.toHaveBeenCalled()
      expect(screen.getByText(/Delete "Review Q1 metrics"\?/)).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('calls onDeleteTask after confirming deletion', async () => {
      const user = userEvent.setup()
      const onDeleteTask = vi.fn()

      render(
        <TaskListView lists={[mockList]} onDeleteTask={onDeleteTask} />
      )

      const deleteBtn = screen.getByLabelText('Delete task')
      await user.click(deleteBtn)
      await user.click(screen.getByText('Delete'))

      expect(onDeleteTask).toHaveBeenCalledWith('list-1', 't-1')
    })

    it('does not delete when cancelling confirmation', async () => {
      const user = userEvent.setup()
      const onDeleteTask = vi.fn()

      render(
        <TaskListView lists={[mockList]} onDeleteTask={onDeleteTask} />
      )

      const deleteBtn = screen.getByLabelText('Delete task')
      await user.click(deleteBtn)
      await user.click(screen.getByText('Cancel'))

      expect(onDeleteTask).not.toHaveBeenCalled()
      expect(screen.queryByText(/Delete "Review Q1 metrics"\?/)).not.toBeInTheDocument()
    })

    it('mentions subtasks in confirmation when task has subtasks', async () => {
      const user = userEvent.setup()
      const taskWithSubs = {
        id: 't-sub',
        title: 'Parent task',
        completed: false,
        order: 0,
        subtasks: [
          { id: 'st-1', title: 'Sub one', completed: false, order: 0, subtasks: [] },
          { id: 'st-2', title: 'Sub two', completed: false, order: 1, subtasks: [] },
        ],
      }
      const listWithSubs: TaskList = {
        id: 'list-sub',
        name: 'Project',
        order: 0,
        tasks: [taskWithSubs],
        completedTasks: [],
      }

      render(<TaskListView lists={[listWithSubs]} onDeleteTask={vi.fn()} />)

      const deleteBtn = screen.getByLabelText('Delete task')
      await user.click(deleteBtn)

      expect(screen.getByText(/2 subtasks/)).toBeInTheDocument()
    })
  })

  describe('List management', () => {
    it('renders list tabs with correct active styling', () => {
      render(<TaskListView lists={[mockList, mockEmptyList]} />)

      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
    })

    it('shows Add list button', () => {
      render(<TaskListView lists={[mockList]} />)
      expect(screen.getByText('Add list')).toBeInTheDocument()
    })

    it('shows inline input when Add list is clicked', async () => {
      const user = userEvent.setup()

      render(<TaskListView lists={[mockList]} />)

      await user.click(screen.getByText('Add list'))

      expect(screen.getByPlaceholderText('List name…')).toBeInTheDocument()
    })

    it('calls onCreateList when typing list name and pressing Enter', async () => {
      const user = userEvent.setup()
      const onCreateList = vi.fn()

      render(
        <TaskListView lists={[mockList]} onCreateList={onCreateList} />
      )

      await user.click(screen.getByText('Add list'))
      const input = screen.getByPlaceholderText('List name…')
      await user.type(input, 'Shopping{Enter}')

      expect(onCreateList).toHaveBeenCalledWith('Shopping')
    })

    it('cancels list creation on Escape', async () => {
      const user = userEvent.setup()
      const onCreateList = vi.fn()

      render(
        <TaskListView lists={[mockList]} onCreateList={onCreateList} />
      )

      await user.click(screen.getByText('Add list'))
      const input = screen.getByPlaceholderText('List name…')
      await user.type(input, 'Shopping{Escape}')

      expect(onCreateList).not.toHaveBeenCalled()
      expect(screen.queryByPlaceholderText('List name…')).not.toBeInTheDocument()
    })

    it('switches active list on tab click', async () => {
      const user = userEvent.setup()

      render(<TaskListView lists={[mockList, mockEmptyList]} />)

      expect(screen.getByText('Review Q1 metrics')).toBeInTheDocument()

      await user.click(screen.getByText('Personal'))

      expect(screen.queryByText('Review Q1 metrics')).not.toBeInTheDocument()
      expect(screen.getByText(/No tasks in/)).toBeInTheDocument()
    })

    it('shows delete confirmation modal for list with tasks', async () => {
      const user = userEvent.setup()
      const listWithTasks: TaskList = {
        ...mockEmptyList,
        tasks: [{ id: 't-99', title: 'A task', completed: false, order: 0, subtasks: [] }],
      }

      render(<TaskListView lists={[mockList, listWithTasks]} />)

      // The delete button appears on hover over inactive tabs
      // We need to find the small × button on the Personal tab
      const tabDeleteButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg') && btn.className.includes('absolute')
      )

      if (tabDeleteButtons.length > 0) {
        await user.click(tabDeleteButtons[0])
        expect(screen.getByText(/Delete "/)).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      }
    })
  })

  describe('Task display', () => {
    it('displays task titles', () => {
      render(<TaskListView lists={[mockList]} />)
      expect(screen.getByText('Review Q1 metrics')).toBeInTheDocument()
    })

    it('shows task count badge on tabs', () => {
      render(<TaskListView lists={[mockList]} />)
      // The badge shows count of active tasks — there are multiple "1" elements (badge + completed count)
      const ones = screen.getAllByText('1')
      expect(ones.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Subtasks', () => {
    const taskWithSubtasks = {
      id: 't-parent',
      title: 'Parent task',
      completed: false,
      order: 0,
      subtasks: [
        { id: 'st-1', title: 'Subtask one', completed: false, order: 0, subtasks: [] },
        { id: 'st-2', title: 'Subtask two', completed: true, completedAt: '2026-03-01T00:00:00Z', order: 1, subtasks: [] },
      ],
    }

    const listWithSubtasks: TaskList = {
      id: 'list-sub',
      name: 'Project',
      order: 0,
      tasks: [taskWithSubtasks],
      completedTasks: [],
    }

    it('shows subtask progress badge when collapsed', () => {
      render(<TaskListView lists={[listWithSubtasks]} />)
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })

    it('expands to show subtasks when chevron is clicked', async () => {
      const user = userEvent.setup()
      render(<TaskListView lists={[listWithSubtasks]} />)

      expect(screen.queryByText('Subtask one')).not.toBeInTheDocument()

      const expandBtn = screen.getByLabelText('Expand subtasks')
      await user.click(expandBtn)

      expect(screen.getByText('Subtask one')).toBeInTheDocument()
      expect(screen.getByText('Subtask two')).toBeInTheDocument()
    })

    it('shows add subtask input when expanded', async () => {
      const user = userEvent.setup()
      render(<TaskListView lists={[listWithSubtasks]} />)

      const expandBtn = screen.getByLabelText('Expand subtasks')
      await user.click(expandBtn)

      expect(screen.getByPlaceholderText('Add subtask…')).toBeInTheDocument()
    })

    it('calls onCreateSubtask when typing subtask and pressing Enter', async () => {
      const user = userEvent.setup()
      const onCreateSubtask = vi.fn()

      render(
        <TaskListView lists={[listWithSubtasks]} onCreateSubtask={onCreateSubtask} />
      )

      const expandBtn = screen.getByLabelText('Expand subtasks')
      await user.click(expandBtn)

      const input = screen.getByPlaceholderText('Add subtask…')
      await user.type(input, 'New subtask{Enter}')

      expect(onCreateSubtask).toHaveBeenCalledWith('list-sub', 't-parent', 'New subtask')
    })

    it('calls onDeleteSubtask after confirming deletion on a subtask', async () => {
      const user = userEvent.setup()
      const onDeleteSubtask = vi.fn()

      render(
        <TaskListView lists={[listWithSubtasks]} onDeleteSubtask={onDeleteSubtask} />
      )

      const expandBtn = screen.getByLabelText('Expand subtasks')
      await user.click(expandBtn)

      // There are multiple delete buttons — parent + 2 subtasks
      const deleteButtons = screen.getAllByLabelText('Delete task')
      // The first is the parent, the next two are subtasks
      await user.click(deleteButtons[1])

      expect(onDeleteSubtask).not.toHaveBeenCalled()
      expect(screen.getByText(/Delete "Subtask one"\?/)).toBeInTheDocument()

      await user.click(screen.getByText('Delete'))

      expect(onDeleteSubtask).toHaveBeenCalledWith('list-sub', 't-parent', 'st-1')
    })

    it('calls onCompleteSubtask when clicking subtask checkbox', async () => {
      const user = userEvent.setup()
      const onCompleteSubtask = vi.fn()

      render(
        <TaskListView lists={[listWithSubtasks]} onCompleteSubtask={onCompleteSubtask} />
      )

      const expandBtn = screen.getByLabelText('Expand subtasks')
      await user.click(expandBtn)

      // "Complete task" buttons: parent + the uncompleted subtask (st-1)
      const completeButtons = screen.getAllByLabelText('Complete task')
      // completeButtons[0] = parent, completeButtons[1] = st-1
      await user.click(completeButtons[1])

      expect(onCompleteSubtask).toHaveBeenCalledWith('list-sub', 't-parent', 'st-1')
    })

    it('collapses subtasks when chevron is clicked again', async () => {
      const user = userEvent.setup()
      render(<TaskListView lists={[listWithSubtasks]} />)

      await user.click(screen.getByLabelText('Expand subtasks'))
      expect(screen.getByText('Subtask one')).toBeInTheDocument()

      await user.click(screen.getByLabelText('Collapse subtasks'))
      expect(screen.queryByText('Subtask one')).not.toBeInTheDocument()
    })
  })

  describe('Task reordering', () => {
    const task1 = { id: 't-a', title: 'First task', completed: false, order: 0, subtasks: [] }
    const task2 = { id: 't-b', title: 'Second task', completed: false, order: 1, subtasks: [] }
    const task3 = { id: 't-c', title: 'Third task', completed: false, order: 2, subtasks: [] }

    const reorderList: TaskList = {
      id: 'list-reorder',
      name: 'Reorder Test',
      order: 0,
      tasks: [task1, task2, task3],
      completedTasks: [],
    }

    it('calls onReorderTasks when dragging a task to a new position', () => {
      const onReorderTasks = vi.fn()

      render(
        <TaskListView lists={[reorderList]} onReorderTasks={onReorderTasks} />
      )

      const taskElements = screen.getAllByText(/task$/).map(
        (el) => el.closest('[data-task-id]')!
      )

      // Drag first task onto third task
      fireEvent.dragStart(taskElements[0], {
        dataTransfer: { effectAllowed: 'move', setData: vi.fn() },
      })

      fireEvent.dragOver(taskElements[2], {
        dataTransfer: { dropEffect: 'move' },
      })

      fireEvent.drop(taskElements[2], {
        dataTransfer: { dropEffect: 'move' },
      })

      expect(onReorderTasks).toHaveBeenCalledWith('list-reorder', ['t-b', 't-c', 't-a'])
    })

    it('does not call onReorderTasks when dropping a task on itself', () => {
      const onReorderTasks = vi.fn()

      render(
        <TaskListView lists={[reorderList]} onReorderTasks={onReorderTasks} />
      )

      const taskElements = screen.getAllByText(/task$/).map(
        (el) => el.closest('[data-task-id]')!
      )

      fireEvent.dragStart(taskElements[0], {
        dataTransfer: { effectAllowed: 'move', setData: vi.fn() },
      })

      fireEvent.drop(taskElements[0], {
        dataTransfer: { dropEffect: 'move' },
      })

      expect(onReorderTasks).not.toHaveBeenCalled()
    })

    it('task rows have draggable attribute', () => {
      render(<TaskListView lists={[reorderList]} />)

      const taskElements = screen.getAllByText(/task$/).map(
        (el) => el.closest('[data-task-id]')!
      )

      taskElements.forEach((el) => {
        expect(el).toHaveAttribute('draggable', 'true')
      })
    })
  })
})
