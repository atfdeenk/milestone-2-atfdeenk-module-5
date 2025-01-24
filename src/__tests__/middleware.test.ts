import { NextResponse } from 'next/server'
import { middleware } from '../middleware'

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn().mockReturnValue({ type: 'next' }),
    redirect: jest.fn().mockImplementation((url) => ({ type: 'redirect', destination: url })),
  },
}))

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow access to auth pages', () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/login',
      },
    }

    const response = middleware(mockRequest as any)
    expect(response).toEqual({ type: 'next' })
  })

  it('should allow access to protected routes', () => {
    const mockCartRequest = {
      nextUrl: {
        pathname: '/cart',
      },
    }

    const mockReceiptRequest = {
      nextUrl: {
        pathname: '/receipt',
      },
    }

    const cartResponse = middleware(mockCartRequest as any)
    const receiptResponse = middleware(mockReceiptRequest as any)

    expect(cartResponse).toEqual({ type: 'next' })
    expect(receiptResponse).toEqual({ type: 'next' })
  })

  it('should allow access to public routes', () => {
    const mockHomeRequest = {
      nextUrl: {
        pathname: '/',
      },
    }

    const mockProductsRequest = {
      nextUrl: {
        pathname: '/products',
      },
    }

    const homeResponse = middleware(mockHomeRequest as any)
    const productsResponse = middleware(mockProductsRequest as any)

    expect(homeResponse).toEqual({ type: 'next' })
    expect(productsResponse).toEqual({ type: 'next' })
  })

  it('should match configured routes', () => {
    const { config } = require('../middleware')
    expect(config.matcher).toEqual(['/cart', '/receipt', '/login', '/register'])
  })
})
