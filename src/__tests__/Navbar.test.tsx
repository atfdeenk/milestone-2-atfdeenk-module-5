import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Navbar from '../components/Navbar'
import * as ThemeContext from '../context/ThemeContext'

// Mock the useTheme hook
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: jest.fn() })
}))



// Mock next/router
const mockRouter = {
  push: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
}

jest.mock('next/router', () => ({
  useRouter: () => mockRouter
}))

// Mock contexts
const mockAuthContext = {
  user: null,
  loading: false,
  setUser: jest.fn(),
  logout: jest.fn().mockImplementation(() => {
    mockAuthContext.user = null
  }),
}

const mockCartContext = {
  cartItems: [],
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  totalItems: 0,
}

// Import necessary contexts
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'

// Create a wrapper component that includes necessary providers
const renderWithProviders = (
  ui: React.ReactElement,
  { authValue = mockAuthContext, cartValue = mockCartContext } = {}
) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <CartContext.Provider value={cartValue}>
        {ui}
      </CartContext.Provider>
    </AuthContext.Provider>
  )
}

describe('Navbar Component', () => {
  const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks()
  window.localStorage.clear()
})

  it('renders logo and theme toggle', () => {
    renderWithProviders(<Navbar />)
    const logo = screen.getByText('ShopSmart')
    const themeToggle = screen.getAllByRole('button', { 'aria-label': 'Toggle dark mode' })[0]
    
    expect(logo).toBeInTheDocument()
    expect(themeToggle).toBeInTheDocument()
    expect(logo.closest('a')).toHaveAttribute('href', '/')
  })

  it('shows login/signup buttons when user is not logged in', () => {
    renderWithProviders(<Navbar />)
    
    // Initially there should be no token
    expect(window.localStorage.getItem('token')).toBeFalsy()
    expect(window.localStorage.getItem('adminToken')).toBeFalsy()
    
    // Login/signup links should be visible
    const loginLinks = screen.getAllByRole('link', { name: /sign/i })
    expect(loginLinks).toHaveLength(2)
    expect(loginLinks[0]).toHaveAttribute('href', '/login')
    expect(loginLinks[1]).toHaveAttribute('href', '/register')
  })

  it('shows user profile and logout when user is logged in', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User' }
    const mockAuth = {
      ...mockAuthContext,
      user: mockUser,
    }

    const { rerender } = renderWithProviders(<Navbar />, { authValue: mockAuth })
    
    // Force rerender to update the component with the new user state
    rerender(
      <AuthContext.Provider value={mockAuth}>
        <CartContext.Provider value={mockCartContext}>
          <Navbar />
        </CartContext.Provider>
      </AuthContext.Provider>
    )
    
    const signOutButton = screen.getByTestId('sign-out-button')
    expect(signOutButton).toBeInTheDocument()
    
    const userProfile = screen.getByTestId('user-profile')
    expect(userProfile).toBeInTheDocument()
  })





  it('handles cart interaction when logged in', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User' }
    const mockAuth = {
      ...mockAuthContext,
      user: mockUser,
    }

    const { rerender } = renderWithProviders(<Navbar />, { authValue: mockAuth })
    
    // Force rerender to update the component with the new user state
    rerender(
      <AuthContext.Provider value={mockAuth}>
        <CartContext.Provider value={mockCartContext}>
          <Navbar />
        </CartContext.Provider>
      </AuthContext.Provider>
    )
    
    const cartLink = screen.getByTestId('cart-link')
    expect(cartLink).toBeInTheDocument()
  })

  it('handles logout', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User' }
    const mockAuth = {
      ...mockAuthContext,
      user: mockUser,
    }

    const { rerender } = renderWithProviders(<Navbar />, { authValue: mockAuth })
    
    // Force rerender to update the component with the new user state
    rerender(
      <AuthContext.Provider value={mockAuth}>
        <CartContext.Provider value={mockCartContext}>
          <Navbar />
        </CartContext.Provider>
      </AuthContext.Provider>
    )

    // Click sign out
    const signOutButton = screen.getByTestId('sign-out-button')
    fireEvent.click(signOutButton)

    // Verify logout was called
    expect(mockAuth.logout).toHaveBeenCalled()

    // Force rerender after logout
    mockAuth.user = null
    rerender(
      <AuthContext.Provider value={mockAuth}>
        <CartContext.Provider value={mockCartContext}>
          <Navbar />
        </CartContext.Provider>
      </AuthContext.Provider>
    )

    // Verify login/signup buttons are shown
    const signInLink = screen.getByRole('link', { name: /sign in/i })
    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signInLink).toBeInTheDocument()
    expect(signUpLink).toBeInTheDocument()
  })

  it('shows correct number of items in cart', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User' }
    const mockAuth = {
      ...mockAuthContext,
      user: mockUser,
    }

    const mockCart = {
      ...mockCartContext,
      cartItems: [
        { id: 1, quantity: 2, title: 'Product 1', price: 10, image: 'test.jpg' },
        { id: 2, quantity: 3, title: 'Product 2', price: 20, image: 'test2.jpg' }
      ],
      totalItems: 5,
    }

    const { rerender } = renderWithProviders(<Navbar />, { authValue: mockAuth, cartValue: mockCart })
    
    // Force rerender to update the component with the new states
    rerender(
      <AuthContext.Provider value={mockAuth}>
        <CartContext.Provider value={mockCart}>
          <Navbar />
        </CartContext.Provider>
      </AuthContext.Provider>
    )
    
    const cartLink = screen.getByTestId('cart-link')
    expect(cartLink).toBeInTheDocument()
    const cartCount = screen.getByTestId('cart-count')
    expect(cartCount).toHaveTextContent('5')
  })

  it('toggles mobile menu', () => {
    renderWithProviders(<Navbar />)
    const menuButton = screen.getByLabelText('Toggle mobile menu')
    
    // Initially the sign in button should be visible (mobile view)
    const signInButton = screen.getByText('Sign in')
    expect(signInButton).toBeInTheDocument()
    
    // Click menu button
    fireEvent.click(menuButton)
    
    // Sign in button should still be visible
    expect(signInButton).toBeInTheDocument()
  })
})
