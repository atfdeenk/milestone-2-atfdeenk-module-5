import { render, screen, fireEvent } from '@testing-library/react'
import ProductFilter from '../components/ProductFilter'
import { Category } from '../types'

describe('ProductFilter Component', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Electronics', image: 'electronics.jpg' },
    { id: 2, name: 'Clothing', image: 'clothing.jpg' }
  ]

  const mockInitialFilters = {
    category: null,
    minPrice: null,
    maxPrice: null,
    sortBy: null,
    sortOrder: 'desc' as const
  }

  const mockOnFilterChange = jest.fn()

  const defaultProps = {
    categories: mockCategories,
    onFilterChange: mockOnFilterChange,
    initialFilters: mockInitialFilters,
    isVisible: true
  }

  beforeEach(() => {
    mockOnFilterChange.mockClear()
  })

  it('renders nothing when isVisible is false', () => {
    render(<ProductFilter {...defaultProps} isVisible={false} />)
    expect(screen.queryByText('Categories')).not.toBeInTheDocument()
  })

  it('renders all filter sections when visible', () => {
    render(<ProductFilter {...defaultProps} />)
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Price Range')).toBeInTheDocument()
    expect(screen.getByText('Sort By')).toBeInTheDocument()
  })

  it('renders all categories in the dropdown', () => {
    render(<ProductFilter {...defaultProps} />)
    const categorySelect = screen.getByLabelText('Categories') as HTMLSelectElement
    expect(categorySelect).toBeInTheDocument()
    expect(screen.getByText('All Categories')).toBeInTheDocument()
    mockCategories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument()
    })
  })

  it('handles category change', () => {
    render(<ProductFilter {...defaultProps} />)
    const categorySelect = screen.getByLabelText('Categories')
    fireEvent.change(categorySelect, { target: { value: '1' } })
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockInitialFilters,
      category: '1'
    })
  })

  it('handles price range changes', () => {
    render(<ProductFilter {...defaultProps} />)
    const minPrice = screen.getByPlaceholderText('Min')
    const maxPrice = screen.getByPlaceholderText('Max')

    fireEvent.change(minPrice, { target: { value: '10' } })
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockInitialFilters,
      minPrice: 10
    })

    fireEvent.change(maxPrice, { target: { value: '100' } })
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockInitialFilters,
      minPrice: 10,
      maxPrice: 100
    })
  })

  it('handles sort options changes', () => {
    render(<ProductFilter {...defaultProps} />)
    const sortBySelect = screen.getByLabelText('Sort By')
    const sortOrderSelect = screen.getByLabelText('Sort Order')

    fireEvent.change(sortBySelect, { target: { value: 'price' } })
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockInitialFilters,
      sortBy: 'price'
    })

    fireEvent.change(sortOrderSelect, { target: { value: 'asc' } })
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockInitialFilters,
      sortBy: 'price',
      sortOrder: 'asc'
    })
  })

  it('resets filters when clicking reset button', () => {
    render(<ProductFilter {...defaultProps} />)
    
    // First make some changes
    const categorySelect = screen.getByLabelText('Categories')
    fireEvent.change(categorySelect, { target: { value: '1' } })
    
    // Then reset
    const resetButton = screen.getByText('Clear Filters')
    fireEvent.click(resetButton)
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      category: null,
      minPrice: null,
      maxPrice: null,
      sortBy: null,
      sortOrder: 'desc'
    })
  })

  it('handles invalid price range inputs', () => {
    render(<ProductFilter {...defaultProps} />)
    const minPrice = screen.getByPlaceholderText('Min')
    const maxPrice = screen.getByPlaceholderText('Max')

    // Test negative values
    fireEvent.change(minPrice, { target: { value: '-10' } })
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockInitialFilters,
      minPrice: -10
    })

    // Test non-numeric values (these should be converted to null)
    fireEvent.change(maxPrice, { target: { value: 'abc' } })
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockInitialFilters,
      minPrice: -10,
      maxPrice: null
    })
  })

  it('maintains filter state between renders', () => {
    const customInitialFilters = {
      category: '1',
      minPrice: 10,
      maxPrice: 100,
      sortBy: 'price',
      sortOrder: 'asc' as const
    }

    const { rerender } = render(
      <ProductFilter {...defaultProps} initialFilters={customInitialFilters} />
    )

    // Verify initial state
    expect(screen.getByLabelText('Categories')).toHaveValue('1')
    expect(screen.getByPlaceholderText('Min')).toHaveValue(10)
    expect(screen.getByPlaceholderText('Max')).toHaveValue(100)
    expect(screen.getByLabelText('Sort By')).toHaveValue('price')
    expect(screen.getByLabelText('Sort Order')).toHaveValue('asc')

    // Rerender with same props
    rerender(<ProductFilter {...defaultProps} initialFilters={customInitialFilters} />)

    // State should be maintained
    expect(screen.getByLabelText('Categories')).toHaveValue('1')
    expect(screen.getByPlaceholderText('Min')).toHaveValue(10)
    expect(screen.getByPlaceholderText('Max')).toHaveValue(100)
    expect(screen.getByLabelText('Sort By')).toHaveValue('price')
    expect(screen.getByLabelText('Sort Order')).toHaveValue('asc')
  })

  it('handles empty categories array', () => {
    render(
      <ProductFilter
        {...defaultProps}
        categories={[]}
      />
    )

    const categorySelect = screen.getByLabelText('Categories')
    expect(categorySelect.children).toHaveLength(1) // Only "All Categories" option
    expect(screen.getByText('All Categories')).toBeInTheDocument()
  })

  it('preserves other filter values when changing one filter', () => {
    render(<ProductFilter {...defaultProps} />)

    // Set initial values
    const minPrice = screen.getByPlaceholderText('Min')
    const maxPrice = screen.getByPlaceholderText('Max')
    const sortBySelect = screen.getByLabelText('Sort By')

    fireEvent.change(minPrice, { target: { value: '10' } })
    fireEvent.change(maxPrice, { target: { value: '100' } })
    fireEvent.change(sortBySelect, { target: { value: 'price' } })

    // Change category and verify other values are preserved
    const categorySelect = screen.getByLabelText('Categories')
    fireEvent.change(categorySelect, { target: { value: '1' } })

    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      category: '1',
      minPrice: 10,
      maxPrice: 100,
      sortBy: 'price',
      sortOrder: 'desc'
    })
  })
})
