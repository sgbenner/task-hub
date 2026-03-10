import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodayView } from '../TodayView'
import type { TodayTaskGroup, TodayTask, SearchableTask } from '../../../types/task-lists'

const defaultProps = {
  groups: [] as TodayTaskGroup[],
  completedTasks: [] as TodayTask[],
  searchResults: [] as SearchableTask[],
  searchQuery: '',
  onSearchChange: vi.fn(),
  onScheduleTask: vi.fn(),
  onUnscheduleTask: vi.fn(),
  onCompleteTask: vi.fn(),
  onUncompleteTask: vi.fn(),
  onCompleteSubtask: vi.fn(),
  onUncompleteSubtask: vi.fn(),
  onEditTask: vi.fn(),
  onDeleteTask: vi.fn(),
  onEditSubtask: vi.fn(),
  onDeleteSubtask: vi.fn(),
  onUpdateDueDate: vi.fn(),
}

const mockTodayTask: TodayTask = {
  id: 't-1',
  title: 'Review PR',
  completed: false,
  order: 0,
  subtasks: [
    { id: 'st-1', title: 'Check tests', completed: false, order: 0, subtasks: [] },
  ],
  listId: 'list-1',
  listName: 'Work',
}

const mockCompletedTodayTask: TodayTask = {
  id: 't-2',
  title: 'Send email',
  completed: true,
  completedAt: '2026-03-07T10:00:00Z',
  order: 1,
  subtasks: [],
  listId: 'list-1',
  listName: 'Work',
}

const mockGroup: TodayTaskGroup = {
  listId: 'list-1',
  listName: 'Work',
  tasks: [mockTodayTask],
}

describe('TodayView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Empty state', () => {
    it('shows empty state when no tasks scheduled', () => {
      render(<TodayView {...defaultProps} />)
      expect(screen.getByText('No tasks scheduled for today')).toBeInTheDocument()
      expect(screen.getByText('Search above to schedule existing tasks')).toBeInTheDocument()
    })

    it('shows search placeholder', () => {
      render(<TodayView {...defaultProps} />)
      expect(screen.getByPlaceholderText('Schedule a task for today…')).toBeInTheDocument()
    })
  })

  describe('Search', () => {
    it('calls onSearchChange when typing', async () => {
      const user = userEvent.setup()
      const onSearchChange = vi.fn()
      render(<TodayView {...defaultProps} onSearchChange={onSearchChange} />)

      const input = screen.getByPlaceholderText('Schedule a task for today…')
      await user.type(input, 'test')

      expect(onSearchChange).toHaveBeenCalledTimes(4)
    })

    it('shows search results dropdown', async () => {
      const user = userEvent.setup()
      const results: SearchableTask[] = [
        { id: 't-10', title: 'Fix bug', listId: 'list-1', listName: 'Work' },
        { id: 't-11', title: 'Write docs', listId: 'list-2', listName: 'Personal' },
      ]

      render(
        <TodayView
          {...defaultProps}
          searchQuery="fix"
          searchResults={results}
        />
      )

      // Click the input to trigger focus/onFocus
      const input = screen.getByPlaceholderText('Schedule a task for today…')
      await user.click(input)

      expect(screen.getByText('Fix bug')).toBeInTheDocument()
      expect(screen.getByText('Write docs')).toBeInTheDocument()
      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
    })

    it('calls onScheduleTask when clicking a search result', async () => {
      const user = userEvent.setup()
      const onScheduleTask = vi.fn()
      const results: SearchableTask[] = [
        { id: 't-10', title: 'Fix bug', listId: 'list-1', listName: 'Work' },
      ]

      render(
        <TodayView
          {...defaultProps}
          searchQuery="fix"
          searchResults={results}
          onScheduleTask={onScheduleTask}
        />
      )

      const input = screen.getByPlaceholderText('Schedule a task for today…')
      await user.click(input)

      await user.click(screen.getByText('Fix bug'))
      expect(onScheduleTask).toHaveBeenCalledWith('t-10')
    })

    it('shows no matching tasks message for empty results', async () => {
      const user = userEvent.setup()

      render(
        <TodayView
          {...defaultProps}
          searchQuery="nonexistent"
          searchResults={[]}
        />
      )

      const input = screen.getByPlaceholderText('Schedule a task for today…')
      await user.click(input)

      expect(screen.getByText('No matching tasks')).toBeInTheDocument()
    })
  })

  describe('Task groups', () => {
    it('renders task groups with list name headings', () => {
      render(<TodayView {...defaultProps} groups={[mockGroup]} />)
      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Review PR')).toBeInTheDocument()
    })

    it('does not show empty state when tasks exist', () => {
      render(<TodayView {...defaultProps} groups={[mockGroup]} />)
      expect(screen.queryByText('No tasks scheduled for today')).not.toBeInTheDocument()
    })

    it('calls onCompleteTask when clicking checkbox', async () => {
      const user = userEvent.setup()
      const onCompleteTask = vi.fn()

      render(
        <TodayView {...defaultProps} groups={[mockGroup]} onCompleteTask={onCompleteTask} />
      )

      const checkbox = screen.getByLabelText('Complete task')
      await user.click(checkbox)

      expect(onCompleteTask).toHaveBeenCalledWith('t-1')
    })

    it('shows unschedule button', () => {
      render(<TodayView {...defaultProps} groups={[mockGroup]} />)
      expect(screen.getByLabelText('Unschedule task')).toBeInTheDocument()
    })

    it('calls onUnscheduleTask when clicking unschedule', async () => {
      const user = userEvent.setup()
      const onUnscheduleTask = vi.fn()

      render(
        <TodayView {...defaultProps} groups={[mockGroup]} onUnscheduleTask={onUnscheduleTask} />
      )

      await user.click(screen.getByLabelText('Unschedule task'))
      expect(onUnscheduleTask).toHaveBeenCalledWith('t-1')
    })

    it('renders delete button on task', () => {
      render(<TodayView {...defaultProps} groups={[mockGroup]} />)
      expect(screen.getByLabelText('Delete task')).toBeInTheDocument()
    })
  })

  describe('Completed section', () => {
    it('shows completed toggle when completed tasks exist', () => {
      render(
        <TodayView {...defaultProps} completedTasks={[mockCompletedTodayTask]} />
      )
      expect(screen.getByText('1 completed')).toBeInTheDocument()
    })

    it('reveals completed tasks on click', async () => {
      const user = userEvent.setup()

      render(
        <TodayView {...defaultProps} completedTasks={[mockCompletedTodayTask]} />
      )

      expect(screen.queryByText('Send email')).not.toBeInTheDocument()

      await user.click(screen.getByText('1 completed'))
      expect(screen.getByText('Send email')).toBeInTheDocument()
    })

    it('calls onUncompleteTask on completed task checkbox click', async () => {
      const user = userEvent.setup()
      const onUncompleteTask = vi.fn()

      render(
        <TodayView
          {...defaultProps}
          completedTasks={[mockCompletedTodayTask]}
          onUncompleteTask={onUncompleteTask}
        />
      )

      await user.click(screen.getByText('1 completed'))
      await user.click(screen.getByLabelText('Mark active'))

      expect(onUncompleteTask).toHaveBeenCalledWith('t-2')
    })

    it('does not show completed section when no completed tasks', () => {
      render(<TodayView {...defaultProps} />)
      expect(screen.queryByText(/completed/)).not.toBeInTheDocument()
    })
  })
})
