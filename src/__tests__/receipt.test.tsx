import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Receipt from '../pages/receipt'
import { useRouter } from 'next/router'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

interface MockWindow {
  document: {
    write: jest.Mock;
    close: jest.Mock;
  };
  print: jest.Mock;
  open: jest.Mock<MockWindow>;
}

const mockWindow: MockWindow = {
  document: {
    write: jest.fn(),
    close: jest.fn()
  },
  print: jest.fn(),
  open: jest.fn((): MockWindow => mockWindow)
}

beforeEach(() => {
  // Cast mockWindow to Window type to satisfy TypeScript
  Object.defineProperty(global, 'window', {
    value: mockWindow as unknown as Window,
    writable: true
  })
})

describe('Receipt Page', () => {
  const mockRouter = {
    push: jest.fn(),
    query: {}
  }

  const mockReceiptData = {
    items: [
      {
        id: 1,
        title: 'Test Product',
        price: 19.99,
        quantity: 2
      }
    ],
    totalPrice: 39.98,
    orderDate: '2025-01-24',
    orderNumber: 'ORDER123'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('redirects to cart if no receipt data', () => {
    mockRouter.query = {}
    render(<Receipt />)
    expect(mockRouter.push).toHaveBeenCalledWith('/cart')
  })

  it('renders receipt details', () => {
    mockRouter.query = {
      receiptData: JSON.stringify(mockReceiptData)
    }

    render(<Receipt />)

    // Check header
    expect(screen.getByText('Shop Smart 🛒')).toBeInTheDocument()
    expect(screen.getByText('Thank you for your purchase!')).toBeInTheDocument()

    // Check order details
    expect(screen.getByText(`Order Number: ${mockReceiptData.orderNumber}`)).toBeInTheDocument()
    expect(screen.getByText(`Date: ${mockReceiptData.orderDate}`)).toBeInTheDocument()

    // Check product details
    const product = mockReceiptData.items[0]
    expect(screen.getByText(product.title)).toBeInTheDocument()
    expect(screen.getByText(`Quantity: ${product.quantity}`)).toBeInTheDocument()
    expect(screen.getAllByText(`$${(product.price * product.quantity).toFixed(2)}`)).toHaveLength(2)
    expect(screen.getByText(`$${product.price.toFixed(2)} each`)).toBeInTheDocument()

    // Check total
    expect(screen.getAllByText(`$${mockReceiptData.totalPrice.toFixed(2)}`)).toHaveLength(2)

    // Check buttons
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument()
    expect(screen.getByText('Print Receipt')).toBeInTheDocument()
  })

  it('handles print button click', () => {
    mockRouter.query = {
      receiptData: JSON.stringify(mockReceiptData)
    }

    render(<Receipt />)

    const printButton = screen.getByText('Print Receipt')
    fireEvent.click(printButton)

    expect(mockWindow.open).toHaveBeenCalledWith('', '_blank')
    expect(mockWindow.document.write).toHaveBeenCalled()
    expect(mockWindow.document.close).toHaveBeenCalled()
    expect(mockWindow.print).toHaveBeenCalled()

    // Verify print content includes important details
    const writeCall = mockWindow.document.write.mock.calls[0][0]
    expect(writeCall).toContain('Shop Smart')
    expect(writeCall).toContain(mockReceiptData.orderNumber)
    expect(writeCall).toContain(mockReceiptData.orderDate)
    expect(writeCall).toContain(mockReceiptData.items[0].title)
    expect(writeCall).toContain(mockReceiptData.totalPrice.toFixed(2))
  })

  it('handles malformed receipt data', () => {
    // Mock console.error to prevent error output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    mockRouter.query = {
      receiptData: 'invalid-json'
    }

    render(<Receipt />)
    expect(mockRouter.push).toHaveBeenCalledWith('/cart')

    consoleError.mockRestore()
  })

  it('renders multiple items correctly', () => {
    const multiItemReceiptData = {
      ...mockReceiptData,
      items: [
        {
          id: 1,
          title: 'Product 1',
          price: 19.99,
          quantity: 2
        },
        {
          id: 2,
          title: 'Product 2',
          price: 29.99,
          quantity: 1
        }
      ],
      totalPrice: 69.97
    }

    mockRouter.query = {
      receiptData: JSON.stringify(multiItemReceiptData)
    }

    render(<Receipt />)

    // Check both products are rendered
    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.getByText('Product 2')).toBeInTheDocument()
    expect(screen.getByText('$39.98')).toBeInTheDocument() // 19.99 * 2
    expect(screen.getByText('$29.99')).toBeInTheDocument() // 29.99 * 1
    expect(screen.getByText('$69.97')).toBeInTheDocument() // Total
  })

  it('handles window.open returning null', () => {
    mockRouter.query = {
      receiptData: JSON.stringify(mockReceiptData)
    }

    // Mock window.open to return null
    ;(mockWindow.open as jest.Mock).mockReturnValueOnce(null)

    render(<Receipt />)

    const printButton = screen.getByText('Print Receipt')
    fireEvent.click(printButton)

    expect(mockWindow.open).toHaveBeenCalledWith('', '_blank')
    expect(mockWindow.document.write).not.toHaveBeenCalled()
    expect(mockWindow.document.close).not.toHaveBeenCalled()
    expect(mockWindow.print).not.toHaveBeenCalled()
  })
})
