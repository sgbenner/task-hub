import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoalPlanningView } from '../GoalPlanningView'
import type { Horizon } from '../../../types/goal-planning'

const mockGoalWithDescription = {
  id: 'g-1',
  title: 'Ship the MVP and get 100 paying users',
  description: 'Build, launch, and iterate until we hit the first revenue milestone.',
}

const mockGoalWithoutDescription = {
  id: 'g-2',
  title: 'Read 24 books',
  description: '',
}

const mockHorizonWithGoals: Horizon = {
  id: '1-year',
  label: '1 Year',
  goals: [mockGoalWithDescription, mockGoalWithoutDescription],
}

const mockHorizonEmpty: Horizon = {
  id: '5-year',
  label: '5 Years',
  goals: [],
}

const mockHorizon10Year: Horizon = {
  id: '10-year',
  label: '10 Years',
  goals: [],
}

const allHorizons: Horizon[] = [mockHorizonWithGoals, mockHorizonEmpty, mockHorizon10Year]

describe('GoalPlanningView', () => {
  describe('Horizon tabs', () => {
    it('renders all three horizon tabs', () => {
      render(<GoalPlanningView horizons={allHorizons} />)

      expect(screen.getByText('1 Year')).toBeInTheDocument()
      expect(screen.getByText('5 Years')).toBeInTheDocument()
      expect(screen.getByText('10 Years')).toBeInTheDocument()
    })

    it('shows context prompt for 1-year horizon', () => {
      render(<GoalPlanningView horizons={allHorizons} />)

      expect(
        screen.getByText('What do you want to accomplish in the next 12 months?')
      ).toBeInTheDocument()
    })

    it('shows goal count badge only on tabs with goals', () => {
      render(<GoalPlanningView horizons={allHorizons} />)

      // 1 Year tab should have badge with "2"
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('switches horizon and updates context prompt', async () => {
      const user = userEvent.setup()
      render(<GoalPlanningView horizons={allHorizons} />)

      await user.click(screen.getByText('5 Years'))

      expect(
        screen.getByText('Where do you want to be in 5 years?')
      ).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('shows empty state when horizon has no goals', async () => {
      const user = userEvent.setup()
      render(<GoalPlanningView horizons={allHorizons} />)

      await user.click(screen.getByText('5 Years'))

      expect(screen.getByText('No goals yet for this horizon')).toBeInTheDocument()
      expect(screen.getByText('Add your first goal →')).toBeInTheDocument()
    })

    it('opens inline creation when clicking "Add your first goal →"', async () => {
      const user = userEvent.setup()
      render(<GoalPlanningView horizons={allHorizons} />)

      await user.click(screen.getByText('5 Years'))
      await user.click(screen.getByText('Add your first goal →'))

      expect(screen.getByPlaceholderText('Goal title…')).toBeInTheDocument()
    })
  })

  describe('Goal display', () => {
    it('displays goal titles', () => {
      render(<GoalPlanningView horizons={allHorizons} />)

      expect(screen.getByText('Ship the MVP and get 100 paying users')).toBeInTheDocument()
      expect(screen.getByText('Read 24 books')).toBeInTheDocument()
    })

    it('displays goal description when present', () => {
      render(<GoalPlanningView horizons={allHorizons} />)

      expect(
        screen.getByText('Build, launch, and iterate until we hit the first revenue milestone.')
      ).toBeInTheDocument()
    })

    it('shows "Add a description…" placeholder when no description', () => {
      render(<GoalPlanningView horizons={allHorizons} />)

      const placeholders = screen.getAllByText('Add a description…')
      expect(placeholders.length).toBeGreaterThan(0)
    })
  })

  describe('Goal creation', () => {
    it('shows Add goal button when goals exist', () => {
      render(<GoalPlanningView horizons={allHorizons} />)

      expect(screen.getByText('Add goal')).toBeInTheDocument()
    })

    it('opens inline creation on Add goal click', async () => {
      const user = userEvent.setup()
      render(<GoalPlanningView horizons={allHorizons} />)

      await user.click(screen.getByText('Add goal'))

      expect(screen.getByPlaceholderText('Goal title…')).toBeInTheDocument()
      expect(screen.getByText('Save goal')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('calls onCreateGoal when saving a new goal', async () => {
      const user = userEvent.setup()
      const onCreateGoal = vi.fn()

      render(
        <GoalPlanningView horizons={allHorizons} onCreateGoal={onCreateGoal} />
      )

      await user.click(screen.getByText('Add goal'))

      const titleInput = screen.getByPlaceholderText('Goal title…')
      await user.type(titleInput, 'Run a 5K race')
      await user.click(screen.getByText('Save goal'))

      expect(onCreateGoal).toHaveBeenCalledWith('1-year', 'Run a 5K race', undefined)
    })

    it('cancels creation on Escape', async () => {
      const user = userEvent.setup()
      const onCreateGoal = vi.fn()

      render(
        <GoalPlanningView horizons={allHorizons} onCreateGoal={onCreateGoal} />
      )

      await user.click(screen.getByText('Add goal'))
      const titleInput = screen.getByPlaceholderText('Goal title…')
      await user.type(titleInput, 'Test{Escape}')

      expect(onCreateGoal).not.toHaveBeenCalled()
      expect(screen.queryByPlaceholderText('Goal title…')).not.toBeInTheDocument()
    })

    it('has disabled Save goal button when title is empty', async () => {
      const user = userEvent.setup()

      render(<GoalPlanningView horizons={allHorizons} />)

      await user.click(screen.getByText('Add goal'))

      const saveBtn = screen.getByText('Save goal')
      expect(saveBtn).toBeDisabled()
    })

    it('cancels in-progress creation when switching horizons', async () => {
      const user = userEvent.setup()

      render(<GoalPlanningView horizons={allHorizons} />)

      await user.click(screen.getByText('Add goal'))
      expect(screen.getByPlaceholderText('Goal title…')).toBeInTheDocument()

      await user.click(screen.getByText('5 Years'))
      expect(screen.queryByPlaceholderText('Goal title…')).not.toBeInTheDocument()
    })
  })

  describe('Goal deletion', () => {
    it('calls onDeleteGoal when clicking delete button', async () => {
      const user = userEvent.setup()
      const onDeleteGoal = vi.fn()

      render(
        <GoalPlanningView horizons={allHorizons} onDeleteGoal={onDeleteGoal} />
      )

      const deleteButtons = screen.getAllByLabelText('Delete goal')
      await user.click(deleteButtons[0])

      expect(onDeleteGoal).toHaveBeenCalledWith('1-year', 'g-1')
    })
  })

  describe('Goal editing', () => {
    it('calls onEditGoalTitle when clicking and editing title', async () => {
      const user = userEvent.setup()
      const onEditGoalTitle = vi.fn()

      render(
        <GoalPlanningView horizons={allHorizons} onEditGoalTitle={onEditGoalTitle} />
      )

      await user.click(screen.getByText('Ship the MVP and get 100 paying users'))

      const input = screen.getByDisplayValue('Ship the MVP and get 100 paying users')
      await user.clear(input)
      await user.type(input, 'Ship the MVP{Enter}')

      expect(onEditGoalTitle).toHaveBeenCalledWith('1-year', 'g-1', 'Ship the MVP')
    })

    it('calls onEditGoalDescription when clicking and editing description', async () => {
      const user = userEvent.setup()
      const onEditGoalDescription = vi.fn()

      render(
        <GoalPlanningView
          horizons={allHorizons}
          onEditGoalDescription={onEditGoalDescription}
        />
      )

      await user.click(
        screen.getByText('Build, launch, and iterate until we hit the first revenue milestone.')
      )

      const textarea = screen.getByDisplayValue(
        'Build, launch, and iterate until we hit the first revenue milestone.'
      )
      await user.clear(textarea)
      await user.type(textarea, 'New description{Enter}')

      expect(onEditGoalDescription).toHaveBeenCalledWith('1-year', 'g-1', 'New description')
    })
  })
})
