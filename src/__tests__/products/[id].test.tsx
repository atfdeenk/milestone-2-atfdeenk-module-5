import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ProductDetail from '@/pages/products/[id]'
import { useRouter } from 'next/router'
import { setupMockServer } from '@/mocks/server'
import { rest } from 'msw'
import { mockProducts } from './mockData'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

const mockRouter = {
  push: jest.fn(),
  query: { id: '1' },
  pathname: '/products/[id]',
  isReady: true
}

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, ...rest } = props
    const modifiedProps = {
      ...rest,
      fill: fill ? "true" : undefined,
      priority: priority ? "true" : undefined
    }
    return <img {...modifiedProps} />
  }
}))

describe('Product Detail Page', () => {
  const server = setupMockServer()

  beforeAll(() => server.listen())
  afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })
  afterAll(() => server.close())

  it('renders product details correctly', async () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/products/1', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockProducts[0]))
      })
    )

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('$99.99')).toBeInTheDocument()
      expect(screen.getByText('Description 1')).toBeInTheDocument()
      expect(screen.getByText('Category 1')).toBeInTheDocument()
    })
  })

  it('handles loading state', async () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/products/1', (req, res, ctx) => {
        return new Promise(() => {}) // Never resolves
      })
    )

    render(<ProductDetail />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('handles error state', async () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/products/1', (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    render(<ProductDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load product details')).toBeInTheDocument()
    })
  })

  it('handles product not found', async () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/products/999', (req, res, ctx) => {
        return res(
          ctx.status(404),
          ctx.json({ message: 'Product not found' })
        )
      })
    )

    mockRouter.query.id = '999'
    render(<ProductDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('Product not found')).toBeInTheDocument()
    })
  })

  it('handles image gallery navigation', async () => {
    const productWithMultipleImages = {
      ...mockProducts[0],
      images: ['https://i.imgur.com/image1.jpg', 'https://i.imgur.com/image2.jpg']
    }

    server.use(
      rest.get('https://api.escuelajs.co/api/v1/products/1', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(productWithMultipleImages))
      })
    )

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByAltText('Test Product 1')).toBeInTheDocument()
    })

    // Find thumbnail images
    const thumbnails = screen.getAllByRole('img')
    expect(thumbnails).toHaveLength(3) // Main image + 2 thumbnails

    // Click second thumbnail
    fireEvent.click(thumbnails[2])

    // Main image should update
    const mainImage = screen.getByAltText('Test Product 1')
    expect(mainImage).toHaveAttribute('src', 'https://i.imgur.com/image2.jpg')
  })

  it('handles invalid image URLs', async () => {
    const productWithInvalidImage = {
      ...mockProducts[0],
      images: ['invalid-url', null, undefined, '']
    }

    server.use(
      rest.get('https://api.escuelajs.co/api/v1/products/1', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(productWithInvalidImage))
      })
    )

    render(<ProductDetail />)

    await waitFor(() => {
      const fallbackImage = screen.getByAltText('Test Product 1')
      expect(fallbackImage).toHaveAttribute('src', 'https://i.imgur.com/QkIa5tT.jpeg')
    })
  })
})
