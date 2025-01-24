import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Products from '@/pages/products'
import { useRouter } from 'next/router'
import { setupMockServer } from '@/mocks/server'
import { rest } from 'msw'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

const mockRouter = {
  push: jest.fn(),
  query: {},
}

(useRouter as jest.Mock).mockReturnValue(mockRouter)

const mockProducts = [
  {
    id: 1,
    title: 'Test Product 1',
    price: 100,
    description: 'Test Description 1',
    category: { id: 1, name: 'Category 1', image: 'category1.jpg' },
    images: ['image1.jpg'],
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Test Product 2',
    price: 200,
    description: 'Test Description 2',
    category: { id: 2, name: 'Category 2', image: 'category2.jpg' },
    images: ['image2.jpg'],
    createdAt: '2023-01-02T00:00:00.000Z',
  },
]

const mockCategories = [
  { id: 1, name: 'Category 1', image: 'category1.jpg' },
  { id: 2, name: 'Category 2', image: 'category2.jpg' },
]

describe('Products Page', () => {
  const server = setupMockServer()

  beforeAll(() => server.listen())
  afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
  })
  afterAll(() => server.close())

  it('renders loading state initially when no initial products', async () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/products', (req, res, ctx) => {
        return res(ctx.delay(100), ctx.json(mockProducts))
      })
    )

    render(<Products initialProducts={null} initialCategories={null} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders products when data is loaded', async () => {
    render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('Test Product 2')).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

    // Show filters to reveal search input
    fireEvent.click(screen.getByText(/Show Filters/i))

    const searchInput = screen.getByPlaceholderText(/Search products/i)
    fireEvent.change(searchInput, { target: { value: 'Test Product 1' } })

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
    })

    // Verify URL update
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ search: 'Test Product 1' }),
      }),
      undefined,
      { shallow: true }
    )
  })

  it('handles filter changes', async () => {
    render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

    // Show filters
    fireEvent.click(screen.getByText(/Show Filters/i))

    // Select category filter
    const categorySelect = screen.getByLabelText(/Category/i)
    fireEvent.change(categorySelect, { target: { value: '1' } })

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
    })

    // Verify URL update
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ category: '1' }),
      }),
      undefined,
      { shallow: true }
    )
  })

  it('shows no products message when no results found', async () => {
    render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

    // Show filters
    fireEvent.click(screen.getByText(/Show Filters/i))

    // Search for non-existent product
    const searchInput = screen.getByPlaceholderText(/Search products/i)
    fireEvent.change(searchInput, { target: { value: 'Non-existent Product' } })

    await waitFor(() => {
      expect(screen.getByText(/No products found matching your criteria/i)).toBeInTheDocument()
    })
  })

  it('clears search when clicking clear button', async () => {
    render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

    // Show filters
    fireEvent.click(screen.getByText(/Show Filters/i))

    // Add search term
    const searchInput = screen.getByPlaceholderText(/Search products/i)
    fireEvent.change(searchInput, { target: { value: 'Test Product 1' } })

    // Clear search
    const clearButton = screen.getByRole('button', { name: /Clear search/i })
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(searchInput).toHaveValue('')
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })

    // Verify URL update
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.not.objectContaining({ search: expect.anything() }),
      }),
      undefined,
      { shallow: true }
    )
  })

  it('handles error state', async () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/products', (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    render(<Products initialProducts={null} initialCategories={null} />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load products/i)).toBeInTheDocument()
    })
  })

  it('handles empty products state', () => {
    render(<Products initialProducts={[]} initialCategories={mockCategories} />)
    expect(screen.getByText(/No products found/i)).toBeInTheDocument()
  })

  it('toggles filter visibility', () => {
    render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

    // Initially filters are hidden
    expect(screen.queryByPlaceholderText(/Search products/i)).not.toBeInTheDocument()

    // Show filters
    fireEvent.click(screen.getByText(/Show Filters/i))
    expect(screen.getByPlaceholderText(/Search products/i)).toBeInTheDocument()

    // Hide filters
    fireEvent.click(screen.getByText(/Hide Filters/i))
    expect(screen.queryByPlaceholderText(/Search products/i)).not.toBeInTheDocument()
  })
})
