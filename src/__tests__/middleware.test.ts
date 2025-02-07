import { NextResponse } from 'next/server'
import { middleware } from '../middleware'

// Mock next/server
jest.mock('next/server', () => {
  const mockHeaders = new Map()
  const mockHeadersHandler = {
    set: function(name: string, value: string) {
      mockHeaders.set(name, value)
    },
    get: function(name: string) {
      return mockHeaders.get(name)
    },
  }

  return {
    NextResponse: {
      next: jest.fn().mockReturnValue({ type: 'next', headers: mockHeadersHandler }),
      redirect: jest.fn().mockImplementation((url) => ({ type: 'redirect', destination: new URL(url), headers: mockHeadersHandler })),
    },
  }
})

// Helper function to create mock request
const createMockRequest = (pathname: string, cookies: { [key: string]: string } = {}) => ({
  nextUrl: {
    pathname,
    origin: 'http://localhost:3000',
  },
  url: 'http://localhost:3000' + pathname,
  cookies: {
    get: (name: string) => cookies[name] ? { value: cookies[name] } : undefined,
  },
})

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow access to auth pages when not logged in', () => {
    const mockRequest = createMockRequest('/login')
    const response = middleware(mockRequest as any)
    expect(response.type).toBe('next')
    expect(response.headers.set).toBeDefined()
  })

  it('should redirect from auth pages when logged in', () => {
    const mockRequest = createMockRequest('/login', { token: 'test-token' })
    const response = middleware(mockRequest as any)
    expect(response.type).toBe('redirect')
    expect(response.destination.pathname).toBe('/products')
    expect(response.headers.set).toBeDefined()
  })

  it('should redirect from protected routes when not logged in', () => {
    const mockCartRequest = createMockRequest('/cart')
    const mockReceiptRequest = createMockRequest('/receipt')

    const cartResponse = middleware(mockCartRequest as any)
    const receiptResponse = middleware(mockReceiptRequest as any)

    expect(cartResponse.type).toBe('redirect')
    expect(cartResponse.destination.pathname).toBe('/login')
    expect(cartResponse.headers.set).toBeDefined()
    expect(cartResponse.headers.get('Cache-Control')).toBe('no-store')

    expect(receiptResponse.type).toBe('redirect')
    expect(receiptResponse.destination.pathname).toBe('/login')
    expect(receiptResponse.headers.set).toBeDefined()
    expect(receiptResponse.headers.get('Cache-Control')).toBe('no-store')
  })

  it('should allow access to protected routes when logged in', () => {
    const mockCartRequest = createMockRequest('/cart', { token: 'test-token' })
    const mockReceiptRequest = createMockRequest('/receipt', { token: 'test-token' })

    const cartResponse = middleware(mockCartRequest as any)
    const receiptResponse = middleware(mockReceiptRequest as any)

    expect(cartResponse.type).toBe('next')
    expect(cartResponse.headers.set).toBeDefined()
    expect(cartResponse.headers.get('Cache-Control')).toBe('no-store')

    expect(receiptResponse.type).toBe('next')
    expect(receiptResponse.headers.set).toBeDefined()
    expect(receiptResponse.headers.get('Cache-Control')).toBe('no-store')
  })

  it('should allow access to public routes', () => {
    const mockHomeRequest = createMockRequest('/')
    const mockProductsRequest = createMockRequest('/products')

    const homeResponse = middleware(mockHomeRequest as any)
    const productsResponse = middleware(mockProductsRequest as any)

    expect(homeResponse.type).toBe('next')
    expect(homeResponse.headers.set).toBeDefined()

    expect(productsResponse.type).toBe('next')
    expect(productsResponse.headers.set).toBeDefined()
  })

  it('should match configured routes', () => {
    const { config } = require('../middleware')
    expect(config.matcher).toEqual(['/cart', '/receipt', '/login', '/register', '/admin/:path*'])
  })

  it('should handle admin routes correctly', () => {
    // Redirect to login when not logged in
    const mockAdminRequest = createMockRequest('/admin/dashboard')
    const noAuthResponse = middleware(mockAdminRequest as any)
    expect(noAuthResponse.type).toBe('redirect')
    expect(noAuthResponse.destination.pathname).toBe('/admin/login')
    expect(noAuthResponse.headers.set).toBeDefined()
    expect(noAuthResponse.headers.get('Cache-Control')).toBe('no-store')

    // Allow access with admin token
    const mockAdminAuthRequest = createMockRequest('/admin/dashboard', { adminToken: 'admin-token' })
    const adminAuthResponse = middleware(mockAdminAuthRequest as any)
    expect(adminAuthResponse.type).toBe('next')
    expect(adminAuthResponse.headers.set).toBeDefined()
    expect(adminAuthResponse.headers.get('Cache-Control')).toBe('no-store')

    // Redirect admin login to regular login
    const mockAdminLoginRequest = createMockRequest('/admin/login')
    const adminLoginResponse = middleware(mockAdminLoginRequest as any)
    expect(adminLoginResponse.type).toBe('redirect')
    expect(adminLoginResponse.destination.pathname).toBe('/login')
    expect(adminLoginResponse.destination.href).toBe('http://localhost:3000/login')
    expect(typeof adminLoginResponse.headers.set).toBe('function')
  })
})
