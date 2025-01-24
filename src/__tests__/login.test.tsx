import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../pages/login'
import { useRouter } from 'next/router'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// Mock fetch API
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.dispatchEvent
window.dispatchEvent = jest.fn()

describe('Login Page', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '/'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'fake-token',
          profile: {
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      })
    )
  })

  it('redirects to products if user is already logged in', () => {
    localStorageMock.getItem.mockReturnValueOnce('existing-token')
    render(<Login />)
    expect(mockRouter.push).toHaveBeenCalledWith('/products')
  })

  it('renders login form', () => {
    render(<Login />)
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows error message on invalid credentials', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      })
    )

    render(<Login />)
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'invalid@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('handles successful login', async () => {
    jest.useFakeTimers()
    
    const mockUserData = {
      name: 'Test User',
      email: 'test@example.com'
    }

    // Mock successful login response
    ;(global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake-token' })
      }))
      // Mock successful profile fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))

    render(<Login />)
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Sign in successful! Redirecting...')).toBeInTheDocument()
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake-token')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userName', mockUserData.name)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userEmail', mockUserData.email)

    // Advance timers to trigger redirect
    jest.advanceTimersByTime(1500)

    // Wait for redirect
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/products')
    })

    jest.useRealTimers()
  })

  it('handles network errors', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    )

    render(<Login />)
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('loads existing cart data after login', async () => {
    const mockUserData = {
      name: 'Test User',
      email: 'test@example.com'
    }

    const mockCartData = JSON.stringify([{ id: 1, quantity: 2 }])
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === `cart_${mockUserData.email}`) {
        return mockCartData
      }
      return null
    })

    // Mock successful login and profile fetch
    ;(global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake-token' })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))

    render(<Login />)
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: mockUserData.email }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('cart', mockCartData)
      expect(window.dispatchEvent).toHaveBeenCalled()
    })
  })

  it('validates required fields', async () => {
    render(<Login />)
    
    // Try to submit without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    // Check for HTML5 validation
    expect(screen.getByLabelText(/email address/i)).toBeInvalid()
    expect(screen.getByLabelText(/password/i)).toBeInvalid()
  })
})
