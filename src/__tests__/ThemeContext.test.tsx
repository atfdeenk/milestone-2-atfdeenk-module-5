import { render, screen, fireEvent, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock document.documentElement.classList
Object.defineProperty(document.documentElement, 'classList', {
  value: {
    add: jest.fn(),
    remove: jest.fn(),
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
    jest.spyOn(document.documentElement.classList, 'add')
    jest.spyOn(document.documentElement.classList, 'remove')
  })

  it('provides default light theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark')
  })

  it('loads saved dark theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce('dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
  })

  it('toggles theme when button is clicked', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Initial state
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')

    // Toggle to dark
    fireEvent.click(screen.getByText('Toggle Theme'))
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')

    // Toggle back to light
    fireEvent.click(screen.getByText('Toggle Theme'))
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('persists theme changes to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByText('Toggle Theme'))
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')

    fireEvent.click(screen.getByText('Toggle Theme'))
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
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
