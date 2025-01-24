import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Register from '../pages/register'
import { useRouter } from 'next/router'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// Mock fetch API
global.fetch = jest.fn()

describe('Register Page', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '/'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://ui-avatars.com/api/?name=Test+User&background=random'
        })
      })
    )
  })

  it('renders registration form', () => {
    render(<Register />)
    expect(screen.getByText('Create an Account')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('validates password match', async () => {
    render(<Register />)
    
    // Fill in form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password456' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('validates password strength', async () => {
    render(<Register />)
    
    // Fill in form with weak password
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '12345' }
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: '12345' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })
  })

  it('handles successful registration', async () => {
    jest.useFakeTimers()

    render(<Register />)
    
    // Fill in form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Registration successful! Redirecting to login...')).toBeInTheDocument()
    })

    // Advance timers to trigger redirect
    jest.advanceTimersByTime(1500)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })

    jest.useRealTimers()
  })

  it('handles registration error', async () => {
    // Mock API error response
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already exists' })
      })
    )

    render(<Register />)
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('handles network errors', async () => {
    // Mock network error
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    )

    render(<Register />)
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(<Register />)
    
    // Try to submit without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    // Check for HTML5 validation
    expect(screen.getByLabelText(/name/i)).toBeInvalid()
    expect(screen.getByLabelText(/email address/i)).toBeInvalid()
    expect(screen.getByLabelText(/^password$/i)).toBeInvalid()
    expect(screen.getByLabelText(/confirm password/i)).toBeInvalid()
  })
})
