import { render, screen, fireEvent, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  const getItem = jest.fn((key: string) => store[key] || null)
  const setItem = jest.fn((key: string, value: string) => {
    store[key] = value.toString()
  })
  const clear = jest.fn(() => {
    store = {}
  })
  return { getItem, setItem, clear }
})()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock document.documentElement.classList and style
Object.defineProperty(document.documentElement, 'classList', {
  value: {
    add: jest.fn(),
    remove: jest.fn(),
  },
  configurable: true,
})

Object.defineProperty(document.documentElement, 'style', {
  value: {
    setProperty: jest.fn(),
  },
  configurable: true,
})

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    localStorageMock.getItem.mockReset()
    localStorageMock.setItem.mockReset()
    jest.spyOn(document.documentElement.classList, 'add')
    jest.spyOn(document.documentElement.classList, 'remove')
    jest.spyOn(document.documentElement.style, 'setProperty')
  })

  it('provides default light theme', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Wait for mounted state
    await screen.findByTestId('theme-value')

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark')
  })

  it('loads saved dark theme from localStorage', async () => {
    // Set up localStorage mock before rendering
    localStorageMock.getItem.mockReturnValue('dark')

    await act(async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Wait for mounted state
      const themeValue = await screen.findByTestId('theme-value')
      
      // Wait for next tick to allow state updates
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(themeValue).toHaveTextContent('dark')
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('color-scheme', 'dark')
    })
  })

  it('toggles theme when button is clicked', async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Wait for mounted state
      const themeValue = await screen.findByTestId('theme-value')

      // Initial state
      expect(themeValue).toHaveTextContent('light')

      // Toggle to dark
      const toggleButton = screen.getByText('Toggle Theme')
      fireEvent.click(toggleButton)
      
      // Wait for next tick to allow state updates
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(themeValue).toHaveTextContent('dark')
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('color-scheme', 'dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')

      // Toggle back to light
      fireEvent.click(toggleButton)
      
      // Wait for next tick to allow state updates
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(themeValue).toHaveTextContent('light')
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark')
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('color-scheme', 'light')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
    })
  })

  it('persists theme changes to localStorage', async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Wait for mounted state
      const themeValue = await screen.findByTestId('theme-value')
      const toggleButton = screen.getByText('Toggle Theme')

      // Toggle to dark
      fireEvent.click(toggleButton)
      
      // Wait for next tick to allow state updates
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(themeValue).toHaveTextContent('dark')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')

      // Toggle back to light
      fireEvent.click(toggleButton)
      
      // Wait for next tick to allow state updates
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(themeValue).toHaveTextContent('light')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
    })
  })

  it('throws error when useTheme is used outside of ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error')
    consoleSpy.mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useTheme must be used within a ThemeProvider')

    consoleSpy.mockRestore()
  })

  it('provides theme context and toggles theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Initial theme should be light
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')

    // Toggle theme
    fireEvent.click(screen.getByText('Toggle Theme'))

    // Theme should be dark
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')

    // Toggle theme again
    fireEvent.click(screen.getByText('Toggle Theme'))

    // Theme should be light
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark')
  })
})
