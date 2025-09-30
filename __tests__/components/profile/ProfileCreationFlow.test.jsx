import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileCreationFlow from '@/components/profile/ProfileCreationFlow'

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

const mockProps = {
  userData: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  },
  onComplete: jest.fn(),
}

describe('ProfileCreationFlow Component', () => {
  beforeEach(() => {
    fetch.mockClear()
    mockProps.onComplete.mockClear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders step 1 (Personal Info) initially', () => {
    render(<ProfileCreationFlow {...mockProps} />)
    
    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Branch/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Year of Passing/)).toBeInTheDocument()
  })

  it('pre-fills form with userData', () => {
    render(<ProfileCreationFlow {...mockProps} />)
    
    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
  })

  it('validates required fields on step 1', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationFlow {...mockProps} />)
    
    const nextButton = screen.getByRole('button', { name: /next/i })
    
    // Clear required fields
    const firstNameInput = screen.getByLabelText(/First Name/)
    await user.clear(firstNameInput)
    
    await user.click(nextButton)
    
    expect(screen.getByText(/First name must be at least 2 characters/)).toBeInTheDocument()
  })

  it('validates branch selection', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationFlow {...mockProps} />)
    
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    
    expect(screen.getByText(/Please select your branch/)).toBeInTheDocument()
  })

  it('validates year of passing range', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationFlow {...mockProps} />)
    
    const yearInput = screen.getByLabelText(/Year of Passing/)
    await user.type(yearInput, '2005')
    
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    
    expect(screen.getByText(/Please enter a valid year \(2010-2030\)/)).toBeInTheDocument()
  })

  it('navigates to step 2 when step 1 is valid', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationFlow {...mockProps} />)
    
    // Fill required fields
    const branchSelect = screen.getByLabelText(/Branch/)
    await user.selectOptions(branchSelect, 'Computer Science')
    
    const yearInput = screen.getByLabelText(/Year of Passing/)
    await user.type(yearInput, '2024')
    
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
      expect(screen.getByLabelText(/Current Company/)).toBeInTheDocument()
    })
  })

  it('handles file upload validation', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationFlow {...mockProps} />)
    
    // Navigate to step 2
    const branchSelect = screen.getByLabelText(/Branch/)
    await user.selectOptions(branchSelect, 'Computer Science')
    const yearInput = screen.getByLabelText(/Year of Passing/)
    await user.type(yearInput, '2024')
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Resume \(PDF\/DOCX, max 5MB\)/)).toBeInTheDocument()
    })
    
    // Test file upload with invalid file type
    const fileInput = screen.getByRole('button', { name: /drop your resume here/i })
    
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    // Mock file upload
    const uploadArea = screen.getByText(/Drop your resume here/)
    fireEvent.drop(uploadArea, {
      dataTransfer: {
        files: [invalidFile],
      },
    })
    
    // Should show error for invalid file type
    await waitFor(() => {
      expect(screen.getByText(/Only PDF and DOCX files are allowed/)).toBeInTheDocument()
    })
  })

  it('validates URL patterns on step 3', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationFlow {...mockProps} />)
    
    // Navigate to step 3
    await navigateToStep3(user)
    
    const linkedinInput = screen.getByLabelText(/LinkedIn Profile/)
    await user.type(linkedinInput, 'invalid-url')
    
    const submitButton = screen.getByRole('button', { name: /complete setup/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/Please enter a valid LinkedIn URL/)).toBeInTheDocument()
  })

  it('shows profile preview on step 3', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationFlow {...mockProps} />)
    
    await navigateToStep3(user)
    
    expect(screen.getByText('Profile Preview')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Computer Science')).toBeInTheDocument()
  })

  it('auto-saves form data to localStorage', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationFlow {...mockProps} />)
    
    const firstNameInput = screen.getByLabelText(/First Name/)
    await user.type(firstNameInput, 'Jane')
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'profileCreationDraft',
      expect.stringContaining('Jane')
    )
  })

  it('loads saved data from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ firstName: 'SavedName', lastName: 'SavedLastName' })
    )
    
    render(<ProfileCreationFlow {...mockProps} />)
    
    expect(screen.getByDisplayValue('SavedName')).toBeInTheDocument()
    expect(screen.getByDisplayValue('SavedLastName')).toBeInTheDocument()
  })

  it('submits complete profile successfully', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        data: { user: { id: 1, firstName: 'John' } } 
      })
    })
    
    render(<ProfileCreationFlow {...mockProps} />)
    
    await navigateToStep3(user)
    
    const submitButton = screen.getByRole('button', { name: /complete setup/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer null'
        },
        body: expect.stringContaining('John')
      })
    })
    
    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({ id: 1, firstName: 'John' })
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Server error' })
    })
    
    render(<ProfileCreationFlow {...mockProps} />)
    
    await navigateToStep3(user)
    
    const submitButton = screen.getByRole('button', { name: /complete setup/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument()
    })
  })

  it('allows navigation back to previous steps', async () => {
    const user = userEvent.setup()
    render(<ProfileCreationFlow {...mockProps} />)
    
    await navigateToStep3(user)
    
    // Go back to step 2
    const previousButton = screen.getByRole('button', { name: /previous/i })
    await user.click(previousButton)
    
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    
    // Go back to step 1
    await user.click(previousButton)
    
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  // Helper function to navigate to step 3
  async function navigateToStep3(user) {
    // Step 1
    const branchSelect = screen.getByLabelText(/Branch/)
    await user.selectOptions(branchSelect, 'Computer Science')
    const yearInput = screen.getByLabelText(/Year of Passing/)
    await user.type(yearInput, '2024')
    let nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    
    // Step 2
    await waitFor(() => {
      nextButton = screen.getByRole('button', { name: /next/i })
    })
    await user.click(nextButton)
    
    // Step 3
    await waitFor(() => {
      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
    })
  }
})
