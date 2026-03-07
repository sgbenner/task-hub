import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiPlannerPanel } from '../AiPlannerPanel'
import type { AiPlannerProps, SearchableTask } from '../../../types/task-lists'

const mockTasks: SearchableTask[] = [
  { id: 't-1', title: 'Clean kitchen', listId: 'l-1', listName: 'Household' },
  { id: 't-2', title: 'Buy groceries', listId: 'l-1', listName: 'Household' },
]

const taskMap = new Map(mockTasks.map((t) => [t.id, t]))

const baseProps: AiPlannerProps = {
  status: 'idle',
  suggestions: [],
  pendingSuggestions: [],
  decidedCount: 0,
  errorMessage: null,
  requestPlan: vi.fn(),
  acceptSuggestion: vi.fn(),
  rejectSuggestion: vi.fn(),
  reset: vi.fn(),
  taskMap,
}

describe('AiPlannerPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Idle state', () => {
    it('shows input and plan button', () => {
      render(<AiPlannerPanel {...baseProps} />)
      expect(screen.getByPlaceholderText(/household chores/i)).toBeInTheDocument()
      expect(screen.getByText('Plan my day')).toBeInTheDocument()
    })

    it('calls requestPlan on button click', async () => {
      const user = userEvent.setup()
      const requestPlan = vi.fn()
      render(<AiPlannerPanel {...baseProps} requestPlan={requestPlan} />)

      const input = screen.getByPlaceholderText(/household chores/i)
      await user.type(input, '2 hours free')
      await user.click(screen.getByText('Plan my day'))

      expect(requestPlan).toHaveBeenCalledWith('2 hours free')
    })

    it('calls requestPlan on Enter key', async () => {
      const user = userEvent.setup()
      const requestPlan = vi.fn()
      render(<AiPlannerPanel {...baseProps} requestPlan={requestPlan} />)

      const input = screen.getByPlaceholderText(/household chores/i)
      await user.type(input, 'morning routine{Enter}')

      expect(requestPlan).toHaveBeenCalledWith('morning routine')
    })

    it('disables button when input is empty', () => {
      render(<AiPlannerPanel {...baseProps} />)
      expect(screen.getByText('Plan my day')).toBeDisabled()
    })
  })

  describe('Loading state', () => {
    it('shows thinking message', () => {
      render(<AiPlannerPanel {...baseProps} status="loading" />)
      expect(screen.getByText('Thinking…')).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('shows error message and retry button', () => {
      render(
        <AiPlannerPanel {...baseProps} status="error" errorMessage="API key invalid" />
      )
      expect(screen.getByText('API key invalid')).toBeInTheDocument()
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })

    it('calls reset on retry click', async () => {
      const user = userEvent.setup()
      const reset = vi.fn()
      render(
        <AiPlannerPanel {...baseProps} status="error" errorMessage="fail" reset={reset} />
      )

      await user.click(screen.getByText('Try again'))
      expect(reset).toHaveBeenCalled()
    })
  })

  describe('Done state with suggestions', () => {
    const suggestions = [
      { taskId: 't-1', suggestedDate: '2026-03-07', reason: 'Quick kitchen task' },
      { taskId: 't-2', suggestedDate: '2026-03-08', reason: 'Weekend shopping' },
    ]

    const doneProps: AiPlannerProps = {
      ...baseProps,
      status: 'done',
      suggestions,
      pendingSuggestions: suggestions,
    }

    it('renders suggestion cards with task titles', () => {
      render(<AiPlannerPanel {...doneProps} />)
      expect(screen.getByText('Clean kitchen')).toBeInTheDocument()
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    })

    it('shows list names on cards', () => {
      render(<AiPlannerPanel {...doneProps} />)
      expect(screen.getAllByText('Household')).toHaveLength(2)
    })

    it('shows AI reasons', () => {
      render(<AiPlannerPanel {...doneProps} />)
      expect(screen.getByText('Quick kitchen task')).toBeInTheDocument()
      expect(screen.getByText('Weekend shopping')).toBeInTheDocument()
    })

    it('shows progress bar with count', () => {
      render(<AiPlannerPanel {...doneProps} decidedCount={1} />)
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })

    it('calls acceptSuggestion on accept click', async () => {
      const user = userEvent.setup()
      const acceptSuggestion = vi.fn()
      render(<AiPlannerPanel {...doneProps} acceptSuggestion={acceptSuggestion} />)

      const acceptButtons = screen.getAllByLabelText('Accept suggestion')
      await user.click(acceptButtons[0])
      expect(acceptSuggestion).toHaveBeenCalledWith('t-1')
    })

    it('calls rejectSuggestion on dismiss click', async () => {
      const user = userEvent.setup()
      const rejectSuggestion = vi.fn()
      render(<AiPlannerPanel {...doneProps} rejectSuggestion={rejectSuggestion} />)

      const dismissButtons = screen.getAllByLabelText('Dismiss suggestion')
      await user.click(dismissButtons[1])
      expect(rejectSuggestion).toHaveBeenCalledWith('t-2')
    })
  })

  describe('Done state with no suggestions', () => {
    it('shows empty message', () => {
      render(<AiPlannerPanel {...baseProps} status="done" />)
      expect(screen.getByText('No suggestions for that context.')).toBeInTheDocument()
    })
  })

  describe('Done state with all decided', () => {
    it('shows completion message', () => {
      const suggestions = [
        { taskId: 't-1', suggestedDate: '2026-03-07', reason: 'Test' },
      ]
      render(
        <AiPlannerPanel
          {...baseProps}
          status="done"
          suggestions={suggestions}
          pendingSuggestions={[]}
          decidedCount={1}
        />
      )
      expect(screen.getByText(/All done/)).toBeInTheDocument()
      expect(screen.getByText('Plan again')).toBeInTheDocument()
    })
  })
})
