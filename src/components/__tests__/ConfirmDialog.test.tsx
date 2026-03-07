import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    title: 'Delete "My task"?',
    message: 'This task will be permanently deleted.',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and message', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('Delete "My task"?')).toBeInTheDocument()
    expect(screen.getByText('This task will be permanently deleted.')).toBeInTheDocument()
  })

  it('renders Cancel and Delete buttons', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)

    await user.click(screen.getByText('Cancel'))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onConfirm when Delete is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

    await user.click(screen.getByText('Delete'))

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('uses custom confirm label when provided', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Remove" />)

    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })
})
