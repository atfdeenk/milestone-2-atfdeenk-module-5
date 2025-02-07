import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// This exports the server instance directly
export const server = setupServer(...handlers)

describe('MSW Server', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  it('should be defined', () => {
    expect(server).toBeDefined()
  })

  it('should have handlers', () => {
    expect(handlers.length).toBeGreaterThan(0)
  })
})
