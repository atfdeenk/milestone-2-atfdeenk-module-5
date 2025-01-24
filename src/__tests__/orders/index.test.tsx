import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OrderDetail from '@/pages/orders/[id]'
import Orders from '@/pages/orders'
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
  query: {},
  pathname: '/orders',
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

describe('Orders Page', () => {
  const server = setupMockServer()

  beforeAll(() => server.listen())
  afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })
  afterAll(() => server.close())

  it('renders orders list correctly', async () => {
    const mockOrders = [
      {
        id: 1,
        products: mockProducts,
        total: 299.98,
        status: 'pending',
        createdAt: '2024-01-24T00:00:00.000Z',
        updatedAt: '2024-01-24T00:00:00.000Z'
      }
    ]

    server.use(
      rest.get('https://api.escuelajs.co/api/v1/orders', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockOrders))
      })
    )

    render(<Orders />)

    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeInTheDocument()
      expect(screen.getByText('$299.98')).toBeInTheDocument()
      expect(screen.getByText('pending')).toBeInTheDocument()
    })
  })

  it('handles empty orders list', async () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/orders', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]))
      })
    )

    render(<Orders />)
    
    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeInTheDocument()
    })
  })

  it('handles API error', async () => {
    server.use(
      rest.get('https://api.escuelajs.co/api/v1/orders', (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    render(<Orders />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load orders')).toBeInTheDocument()
    })
  })

  it('navigates to order detail page on click', async () => {
    const mockOrders = [
      {
        id: 1,
        products: mockProducts,
        total: 299.98,
        status: 'pending',
        createdAt: '2024-01-24T00:00:00.000Z',
        updatedAt: '2024-01-24T00:00:00.000Z'
      }
    ]

    server.use(
      rest.get('https://api.escuelajs.co/api/v1/orders', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockOrders))
      })
    )

    render(<Orders />)

    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Order #1'))
    expect(mockRouter.push).toHaveBeenCalledWith('/orders/1')
  })
})
