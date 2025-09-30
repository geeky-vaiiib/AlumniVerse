import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OTPVerification from '@/components/auth/OTPVerification'

// Mock fetch
global.fetch = jest.fn()

const mockProps = {
  email: 'test@example.com',
  firstName: 'John',
  onStepChange: jest.fn(),
}

describe('OTPVerification Component', () => {
  beforeEach(() => {
    fetch.mockClear()
    mockProps.onStepChange.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with email and firstName', () => {
    render(<OTPVerification {...mockProps} />)
    
    expect(screen.getByText(/Enter the 6-digit code/)).toBeInTheDocument()
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
    expect(screen.getByText(/Hi John/)).toBeInTheDocument()
  })

  it('renders 6 OTP input fields', () => {
    render(<OTPVerification {...mockProps} />)
    
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(6)
    
    inputs.forEach((input, index) => {
      expect(input).toHaveAttribute('id', `otp-${index}`)
      expect(input).toHaveAttribute('maxLength', '1')
    })
  })

  it('allows typing digits and auto-focuses next input', async () => {
    const user = userEvent.setup()
    render(<OTPVerification {...mockProps} />)
    
    const inputs = screen.getAllByRole('textbox')
    
    // Type in first input
    await user.type(inputs[0], '1')
    expect(inputs[0]).toHaveValue('1')
    expect(inputs[1]).toHaveFocus()
    
    // Type in second input
    await user.type(inputs[1], '2')
    expect(inputs[1]).toHaveValue('2')
    expect(inputs[2]).toHaveFocus()
  })

  it('prevents non-digit input', async () => {
    const user = userEvent.setup()
    render(<OTPVerification {...mockProps} />)
    
    const firstInput = screen.getAllByRole('textbox')[0]
    
    await user.type(firstInput, 'a')
    expect(firstInput).toHaveValue('')
    
    await user.type(firstInput, '!')
    expect(firstInput).toHaveValue('')
    
    await user.type(firstInput, '5')
    expect(firstInput).toHaveValue('5')
  })

  it('handles backspace navigation correctly', async () => {
    const user = userEvent.setup()
    render(<OTPVerification {...mockProps} />)
    
    const inputs = screen.getAllByRole('textbox')
    
    // Fill first two inputs
    await user.type(inputs[0], '1')
    await user.type(inputs[1], '2')
    
    // Focus on second input and press backspace
    inputs[1].focus()
    await user.keyboard('{Backspace}')
    
    // Should clear second input and focus first
    expect(inputs[1]).toHaveValue('')
    expect(inputs[0]).toHaveFocus()
  })

  it('handles paste functionality', async () => {
    const user = userEvent.setup()
    render(<OTPVerification {...mockProps} />)
    
    const firstInput = screen.getAllByRole('textbox')[0]
    firstInput.focus()
    
    // Mock clipboard with 6-digit code
    navigator.clipboard.readText.mockResolvedValue('123456')
    
    // Simulate Ctrl+V
    await user.keyboard('{Control>}v{/Control}')
    
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveValue('1')
      expect(inputs[1]).toHaveValue('2')
      expect(inputs[2]).toHaveValue('3')
      expect(inputs[3]).toHaveValue('4')
      expect(inputs[4]).toHaveValue('5')
      expect(inputs[5]).toHaveValue('6')
    })
  })

  it('handles arrow key navigation', async () => {
    const user = userEvent.setup()
    render(<OTPVerification {...mockProps} />)
    
    const inputs = screen.getAllByRole('textbox')
    
    // Focus on third input
    inputs[2].focus()
    
    // Press left arrow
    await user.keyboard('{ArrowLeft}')
    expect(inputs[1]).toHaveFocus()
    
    // Press right arrow
    await user.keyboard('{ArrowRight}')
    expect(inputs[2]).toHaveFocus()
  })

  it('shows error for incomplete OTP on submit', async () => {
    const user = userEvent.setup()
    render(<OTPVerification {...mockProps} />)
    
    const submitButton = screen.getByRole('button', { name: /verify/i })
    
    // Try to submit with incomplete OTP
    await user.click(submitButton)
    
    expect(screen.getByText(/Please enter all 6 digits/)).toBeInTheDocument()
  })

  it('submits OTP when complete', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'OTP verified successfully' })
    })
    
    render(<OTPVerification {...mockProps} />)
    
    const inputs = screen.getAllByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /verify/i })
    
    // Fill all inputs
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], (i + 1).toString())
    }
    
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          otp: '123456'
        })
      })
    })
  })

  it('handles resend OTP functionality', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'OTP resent successfully' })
    })
    
    render(<OTPVerification {...mockProps} />)
    
    // Wait for timer to allow resend (or mock timer)
    const resendButton = screen.getByRole('button', { name: /resend/i })
    
    // Initially disabled
    expect(resendButton).toBeDisabled()
    
    // Mock timer completion
    fireEvent.click(resendButton)
    
    // Should not call API when disabled
    expect(fetch).not.toHaveBeenCalled()
  })

  it('displays timer countdown', () => {
    render(<OTPVerification {...mockProps} />)
    
    // Should show initial timer
    expect(screen.getByText(/60/)).toBeInTheDocument()
  })

  it('shows attempts remaining', () => {
    render(<OTPVerification {...mockProps} />)
    
    expect(screen.getByText(/5 attempts remaining/)).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Invalid OTP' })
    })
    
    render(<OTPVerification {...mockProps} />)
    
    const inputs = screen.getAllByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /verify/i })
    
    // Fill all inputs
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], (i + 1).toString())
    }
    
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid OTP/)).toBeInTheDocument()
    })
  })

  it('clears error when user starts typing', async () => {
    const user = userEvent.setup()
    render(<OTPVerification {...mockProps} />)
    
    const submitButton = screen.getByRole('button', { name: /verify/i })
    const firstInput = screen.getAllByRole('textbox')[0]
    
    // Trigger error
    await user.click(submitButton)
    expect(screen.getByText(/Please enter all 6 digits/)).toBeInTheDocument()
    
    // Start typing
    await user.type(firstInput, '1')
    
    // Error should be cleared
    expect(screen.queryByText(/Please enter all 6 digits/)).not.toBeInTheDocument()
  })
})
