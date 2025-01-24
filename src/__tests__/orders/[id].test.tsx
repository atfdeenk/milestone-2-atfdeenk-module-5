import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import OrderDetail from '@/pages/orders/[id]'
import { useRouter } from 'next/router'
import { mockProducts } from '../products/mockData'
import { setupMockServer } from '@/mocks/server'
import { rest } from 'msw'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

const mockRouter = {
  push: jest.fn(),
  query: { id: '1' },
  pathname: '/orders/[id]',
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

describe('Order Detail Page', () => {
  const server = setupMockServer()

  beforeAll(() => server.listen())
  afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })
  afterAll(() => server.close())

  it('renders order details correctly', async () => {
    const mockOrder = {
      id: 1,
      products: mockProducts,
      total: 299.98,
      status: 'pending',
      createdAt: '2024-01-24T00:00:00.000Z',
      updatedAt: '2024-01-24T00:00:00.000Z'
    }

    server.use(
      rest.get('https://api.escuelajs.co/api/v1/orders/1', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockOrder))
      })
    )

    render(<OrderDetail />)

    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeInTheDocument()
      expect(screen.getByText('$299.98')).toBeInTheDocument()
      expect(screen.getByText('pending')).toBeInTheDocument()
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })
  })

  it('handles order not found', async () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/orders/1', (req, res, ctx) => {
        return res(ctx.status(404))
      })
    )

    render(<OrderDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('Order not found')).toBeInTheDocument()
    })
  })

  it('handles API error', async () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/orders/1', (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    render(<OrderDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load order')).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/orders/1', (req, res, ctx) => {
        return res(ctx.delay(2000), ctx.json({}))
      })
    )

    render(<OrderDetail />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
