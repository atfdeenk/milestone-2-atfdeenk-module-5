import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import Products from '../../pages/products'
import { Product, Category } from '../../types'
import { useRouter } from 'next/router'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

const mockRouter = {
  push: jest.fn(),
  query: {},
  pathname: '/products'
}

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

const mockCategories: Category[] = [
  { id: 1, name: 'Category 1', image: 'cat1.jpg' },
  { id: 2, name: 'Category 2', image: 'cat2.jpg' }
]

const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Test Product 1',
    description: 'Description 1',
    price: 99.99,
    category: mockCategories[0],
    images: ['image1.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Test Product 2',
    description: 'Description 2',
    price: 149.99,
    category: mockCategories[1],
    images: ['image2.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

describe('Products Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    global.fetch = jest.fn()
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories)
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts)
      })
    })
  })

  it('renders product list correctly', async () => {
    render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('$99.99')).toBeInTheDocument()
      expect(screen.getByText('Description 1')).toBeInTheDocument()
      
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByText('$149.99')).toBeInTheDocument()
      expect(screen.getByText('Description 2')).toBeInTheDocument()
    })
  })

  it('applies filters from URL query params', async () => {
    const mockRouter = {
      push: jest.fn(),
      query: { category: '2' },
      pathname: '/products'
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter)

    render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

    await waitFor(() => {
      // Should only show products from category 2
      const product2 = screen.getByText('Test Product 2')
      expect(product2).toBeInTheDocument()
      
      // Product 1 should not be visible
      expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument()
    })
  })

  it('handles empty product list', async () => {
    const mockEmptyResponse = {
      ok: true,
      products: [],
      categories: []
    }
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockEmptyResponse)
    })

    render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

    await waitFor(() => {
      const noProductsMessage = screen.getByText('No products found')
      expect(noProductsMessage).toBeInTheDocument()
    })
  })

  it('handles search functionality', async () => {
    await act(async () => {
      const { rerender } = render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

      // Simulate search query
      mockRouter.query = { search: 'Test Product 1' }
      rerender(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)
    })

    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
  })

  it('handles category filter', async () => {
    await act(async () => {
      const { rerender } = render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

      // Simulate category filter
      mockRouter.query = { category: '1' }
      rerender(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)
    })

    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
  })

  it('handles price range filter', async () => {
    await act(async () => {
      const { rerender } = render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

      // Simulate price range filter
      mockRouter.query = { minPrice: '100', maxPrice: '150' }
      rerender(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)
    })

    expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument()
    expect(screen.getByText('Test Product 2')).toBeInTheDocument()
  })

  it('handles sorting', async () => {
    await act(async () => {
      const { rerender } = render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)

      // Simulate sorting by price desc
      mockRouter.query = { sortBy: 'price', sortOrder: 'desc' }
      rerender(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)
    })

    const prices = screen.getAllByText(/\$\d+\.\d+/)
    expect(prices[0]).toHaveTextContent('$149.99')
    expect(prices[1]).toHaveTextContent('$99.99')
  })

  it('handles filter toggle', async () => {
    await act(async () => {
      render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)
    })

    const filterButton = screen.getByText(/filters/i)
    fireEvent.click(filterButton)

    // Check if filter options are visible
    expect(screen.getByText(/price range/i)).toBeInTheDocument()
    expect(screen.getByText(/sort by/i)).toBeInTheDocument()
  })

  it('handles product click navigation', async () => {
    await act(async () => {
      render(<Products initialProducts={mockProducts} initialCategories={mockCategories} />)
    })

    const productLink = screen.getAllByRole('link', { name: /test product/i })[0]
    fireEvent.click(productLink)

    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining('/products/1'),
      expect.anything(),
      expect.anything()
    )
  })
})
