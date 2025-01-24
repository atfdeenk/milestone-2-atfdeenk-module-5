import { render, screen, fireEvent } from '@testing-library/react'
import DarkModeToggle from '../components/DarkModeToggle'

// Mock the ThemeContext module
const mockToggleTheme = jest.fn()
let mockTheme = 'light'

jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme
  })
}))

describe('DarkModeToggle Component', () => {
  beforeEach(() => {
    // Reset to default theme and clear mock calls
    mockTheme = 'light'
    mockToggleTheme.mockClear()
  })

  it('renders with light theme initially', () => {
    render(<DarkModeToggle />)
    const button = screen.getByLabelText('Toggle dark mode')
    expect(button).toBeInTheDocument()
    
    // Check if the moon icon SVG is present
    const moonIcon = button.querySelector('svg')
    expect(moonIcon).toHaveClass('text-gray-700')
  })

  it('shows sun icon when theme is dark', () => {
    // Set theme to dark
    mockTheme = 'dark'
    
    render(<DarkModeToggle />)
    const button = screen.getByLabelText('Toggle dark mode')
    const sunIcon = button.querySelector('svg')
    expect(sunIcon).toHaveClass('text-yellow-500')
  })

  it('calls toggleTheme when clicked', () => {
    render(<DarkModeToggle />)
    const button = screen.getByLabelText('Toggle dark mode')
    fireEvent.click(button)
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('accepts and applies custom className prop', () => {
    const customClass = 'custom-class'
    render(<DarkModeToggle className={customClass} />)
    const button = screen.getByLabelText('Toggle dark mode')
    expect(button.className).toContain(customClass)
  })
})
