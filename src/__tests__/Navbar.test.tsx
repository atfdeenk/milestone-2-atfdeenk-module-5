import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Navbar from '../components/Navbar'
import { ThemeProvider } from '../context/ThemeContext'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock contexts
const mockAuthContext = {
  user: null,
  loading: false,
  setUser: jest.fn(),
}

const mockCartContext = {
  cartItems: [],
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
}

// Create a wrapper component that includes necessary providers
const renderWithProviders = (ui: React.ReactElement, { authValue = mockAuthContext, cartValue = mockCartContext } = {}) => {
  return render(
    <ThemeProvider>
      <AuthProvider value={authValue}>
        <CartProvider value={cartValue}>
          {ui}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

describe('Navbar Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  it('renders logo and theme toggle', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByText('ShopSmart')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle dark mode')).toBeInTheDocument()
  })

  it('shows login/signup buttons when user is not logged in', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('shows user profile and logout when user is logged in', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User' }
    const mockAuth = {
      ...mockAuthContext,
      user: mockUser,
    }

    renderWithProviders(<Navbar />, { authValue: mockAuth })
    
    // Wait for the profile to be loaded
    await waitFor(() => {
      const signOutButton = screen.getByTestId('sign-out-button')
      expect(signOutButton).toBeInTheDocument()
    })
  })





  it('handles cart interaction when logged in', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User' }
    const mockAuth = {
      ...mockAuthContext,
      user: mockUser,
    }

    renderWithProviders(<Navbar />, { authValue: mockAuth })
    
    // Wait for the cart to be visible after login
    await waitFor(() => {
      const cartLink = screen.getByTestId('cart-link')
      expect(cartLink).toBeInTheDocument()
    })
  })

  it('handles logout', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User' }
    const mockSetUser = jest.fn()
    const mockAuth = {
      ...mockAuthContext,
      user: mockUser,
      setUser: mockSetUser,
    }

    renderWithProviders(<Navbar />, { authValue: mockAuth })
    
    // Wait for the profile to be loaded
    await waitFor(() => {
      const signOutButton = screen.getByTestId('sign-out-button')
      expect(signOutButton).toBeInTheDocument()
    })

    // Click sign out
    const signOutButton = screen.getByTestId('sign-out-button')
    fireEvent.click(signOutButton)

    // Verify setUser was called with null
    expect(mockSetUser).toHaveBeenCalledWith(null)
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
    }

    renderWithProviders(<Navbar />, { authValue: mockAuth, cartValue: mockCart })
    
    // Wait for the cart count to be updated
    await waitFor(() => {
      const cartLink = screen.getByTestId('cart-link')
      expect(cartLink).toBeInTheDocument()
      const cartCount = screen.getByTestId('cart-count')
      expect(cartCount).toHaveTextContent('5')
    })
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
