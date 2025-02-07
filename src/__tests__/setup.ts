import '@testing-library/jest-dom'
import { server } from './mocks/server'
import 'whatwg-fetch'

beforeAll(() => {
  // Enable the mocking in tests.
  server.listen({ onUnhandledRequest: 'bypass' })
})

afterEach(() => {
  // Reset handlers between tests
  server.resetHandlers()
  
  // Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Clear mocked localStorage
localStorageMock.clear()
  
  // Reset mocks
  jest.clearAllMocks()
})

afterAll(() => {
  // Clean up after all tests
  server.close()
})

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props: any) {
    return {
      type: 'img',
      props: { ...props }
    }
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
