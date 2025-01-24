import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProductDetail from '@/pages/products/[id]'
import { Product, Category } from '@/types'
import { useRouter } from 'next/router'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

const mockRouter = {
  push: jest.fn(),
  query: { id: '1' }
}

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

const mockCategory: Category = {
  id: 1,
  name: 'Test Category',
  image: 'category1.jpg'
}

const mockProduct: Product = {
  id: 1,
  title: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  category: mockCategory,
  images: ['image1.jpg', 'image2.jpg'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockRelatedProducts: Product[] = [
  {
    id: 2,
    title: 'Related Product 1',
    description: 'Related Description',
    price: 29.99,
    category: mockCategory,
    images: ['related1.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

describe('Product Detail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    global.fetch = jest.fn()
  })

  it('renders product details correctly', async () => {
    render(
      <ProductDetail 
        initialProduct={mockProduct}
        relatedProducts={mockRelatedProducts}
        error={null}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Test Product' })).toBeInTheDocument()
      expect(screen.getByText('$99.99')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Category')).toBeInTheDocument()
    })
  })

  it('renders loading state when no initial product', async () => {
    render(
      <ProductDetail 
        initialProduct={null}
        error={null}
      />
    )
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders error state', async () => {
    render(
      <ProductDetail 
        initialProduct={null}
        error="Failed to fetch product"
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to fetch product/i)).toBeInTheDocument()
    })
  })

  it('handles image gallery navigation', async () => {
    render(
      <ProductDetail 
        initialProduct={mockProduct}
        relatedProducts={mockRelatedProducts}
        error={null}
      />
    )

    await waitFor(() => {
      const thumbnails = screen.getAllByRole('img')
      expect(thumbnails.length).toBeGreaterThan(1)
      
      // Click second thumbnail
      fireEvent.click(thumbnails[1])
      const mainImage = screen.getByTestId('main-image')
      expect(mainImage).toHaveAttribute('src', mockProduct.images[1])
    })
  })

  it('displays related products', async () => {
    render(
      <ProductDetail 
        initialProduct={mockProduct}
        relatedProducts={mockRelatedProducts}
        error={null}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Related Product 1')).toBeInTheDocument()
      expect(screen.getByText('$29.99')).toBeInTheDocument()
    })
  })
})
