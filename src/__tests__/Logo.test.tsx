import { render, screen } from '@testing-library/react'
import Logo from '../components/Logo'

describe('Logo Component', () => {
  it('renders the logo with correct text', () => {
    render(<Logo />)
    const logoText = screen.getByText('ShopSmart')
    expect(logoText).toBeInTheDocument()
  })

  it('has a link to the homepage', () => {
    render(<Logo />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })

  it('has the correct styling classes', () => {
    render(<Logo />)
    const heading = screen.getByRole('heading')
    expect(heading).toHaveClass('text-3xl', 'font-bold')
    
    const text = screen.getByText('ShopSmart')
    expect(text).toHaveClass(
      'bg-gradient-to-r',
      'from-blue-500',
      'to-blue-400',
      'bg-clip-text',
      'text-transparent',
      'hover:from-blue-600',
      'hover:to-blue-500',
      'transition-all',
      'duration-300'
    )
  })
})
