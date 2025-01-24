import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// Mock ThemeContext
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn()
  })
}))

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

// Mock fetch API
global.fetch = jest.fn()

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn()
window.dispatchEvent = mockDispatchEvent

describe('Navbar Component', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '/'
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    localStorageMock.clear()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: 'Test User', email: 'test@example.com' })
    })
  })

  it('renders logo and navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('ShopSmart')).toBeInTheDocument()
    expect(screen.getByLabelText('Search products')).toBeInTheDocument()
  })

  it('shows login/signup buttons when user is not logged in', () => {
    render(<Navbar />)
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('shows user profile and logout when user is logged in', async () => {
    // Setup logged in state
    localStorageMock.setItem('token', 'fake-token')
    localStorageMock.setItem('userName', 'Test User')
    localStorageMock.setItem('userEmail', 'test@example.com')

    render(<Navbar />)
    
    // Wait for the profile to be loaded
    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument() // First letter of Test User
    })

    // Open profile dropdown (hover simulation)
    const profileButton = screen.getByText('T')
    fireEvent.mouseEnter(profileButton.parentElement!.parentElement!)

    // Check if logout button is present
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('handles search functionality', () => {
    render(<Navbar />)
    // Use getAllByLabelText to get all search inputs and use the first one (desktop)
    const searchInputs = screen.getAllByLabelText('Search products')
    const searchInput = searchInputs[0]
    const searchForm = searchInput.closest('form')!

    // Type in search
    fireEvent.change(searchInput, { target: { value: 'test product' } })
    expect(searchInput).toHaveValue('test product')

    // Submit search
    fireEvent.submit(searchForm)
    expect(mockRouter.push).toHaveBeenCalledWith('/products?search=test%20product')
  })

  it('handles cart interaction when not logged in', () => {
    render(<Navbar />)
    const cartButton = screen.getByLabelText('Shopping cart')
    
    fireEvent.click(cartButton)
    // The cart button still navigates to /cart, but it will show a message and redirect in the component
    expect(mockRouter.push).toHaveBeenCalledWith('/cart')
  })

  it('handles cart interaction when logged in', () => {
    localStorageMock.setItem('token', 'fake-token')
    localStorageMock.setItem('userName', 'Test User')
    
    render(<Navbar />)
    const cartButton = screen.getByLabelText('Shopping cart')
    
    fireEvent.click(cartButton)
    expect(mockRouter.push).toHaveBeenCalledWith('/cart')
  })

  it('handles logout', async () => {
    // Setup logged in state
    localStorageMock.setItem('token', 'fake-token')
    localStorageMock.setItem('userName', 'Test User')
    localStorageMock.setItem('userEmail', 'test@example.com')

    render(<Navbar />)
    
    // Wait for the profile to be loaded
    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument()
    })

    // Open profile dropdown and click logout
    const profileButton = screen.getByText('T')
    fireEvent.mouseEnter(profileButton.parentElement!.parentElement!)
    
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    // Check if localStorage items were removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('userName')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('userEmail')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('cart')

    // Check if redirected to login
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  it('shows correct number of items in cart', () => {
    // Setup cart with items
    const cartItems = [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 3 }
    ]
    localStorageMock.setItem('cart', JSON.stringify(cartItems))
    localStorageMock.setItem('token', 'fake-token') // Need to be logged in to see cart

    render(<Navbar />)
    
    // Use getAllByText to get all cart count elements and check the first one
    const cartCounts = screen.getAllByText('5')
    expect(cartCounts[0]).toBeInTheDocument()
  })

  it('toggles mobile menu', () => {
    render(<Navbar />)
    const menuButton = screen.getByLabelText('Menu')
    
    // Initially the mobile menu should be hidden
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
    
    // Open menu
    fireEvent.click(menuButton)
    
    // The mobile menu should now be visible with its content
    expect(screen.getByText('Login')).toBeInTheDocument()
    
    // Close menu
    fireEvent.click(menuButton)
    
    // The mobile menu should be hidden again
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
  })
})
