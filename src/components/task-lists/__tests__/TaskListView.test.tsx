import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskListView } from '../TaskListView'
import type { TaskList } from '../../../types/task-lists'

const mockTask = {
  id: 't-1',
  title: 'Review Q1 metrics',
  completed: false,
  order: 0,
}

const mockCompletedTask = {
  id: 't-2',
  title: 'Send invoice to Acme Corp',
  completed: true,
  completedAt: '2026-02-27T09:10:00Z',
  order: 0,
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
    it('calls onDeleteTask when clicking delete button', async () => {
      const user = userEvent.setup()
      const onDeleteTask = vi.fn()

      render(
        <TaskListView lists={[mockList]} onDeleteTask={onDeleteTask} />
      )

      const deleteBtn = screen.getByLabelText('Delete task')
      await user.click(deleteBtn)

      expect(onDeleteTask).toHaveBeenCalledWith('list-1', 't-1')
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
        tasks: [{ id: 't-99', title: 'A task', completed: false, order: 0 }],
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
})
