import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const setupMockServer = () => {
  const server = setupServer(...handlers)
  
  // Enable request interception
  beforeAll(() => server.listen())
  
  // Reset handlers between tests
  afterEach(() => server.resetHandlers())
  
  // Clean up after all tests
  afterAll(() => server.close())

  return server
}

export { handlers }
