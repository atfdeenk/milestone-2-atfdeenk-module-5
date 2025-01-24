import { rest } from 'msw'
import { Product, Category } from '@/types'

export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Category 1',
    image: 'category1.jpg'
  },
  {
    id: 2,
    name: 'Category 2',
    image: 'category2.jpg'
  }
]

export const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Test Product 1',
    description: 'Test Description 1',
    price: 100,
    category: mockCategories[0],
    images: ['image1.jpg'],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    title: 'Test Product 2',
    description: 'Test Description 2',
    price: 200,
    category: mockCategories[1],
    images: ['image2.jpg'],
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z'
  }
]

export const handlers = [
  // Get all products
  rest.get('https://api.escuelajs.co/api/v1/products', async (req, res, ctx) => {
    // Get search params
    const searchQuery = req.url.searchParams.get('title')
    const categoryId = req.url.searchParams.get('categoryId')
    const minPrice = req.url.searchParams.get('price_min')
    const maxPrice = req.url.searchParams.get('price_max')
    const sortBy = req.url.searchParams.get('sort')
    const order = req.url.searchParams.get('order')

    // Apply filters
    let filteredProducts = [...mockProducts]

    // Search filter
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (categoryId) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.id === Number(categoryId)
      )
    }

    // Price range filter
    if (minPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price >= Number(minPrice)
      )
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price <= Number(maxPrice)
      )
    }

    // Sorting
    if (sortBy && order) {
      filteredProducts.sort((a, b) => {
        let comparison = 0
        switch (sortBy) {
          case 'price':
            comparison = a.price - b.price
            break
          case 'title':
            comparison = a.title.localeCompare(b.title)
            break
          default:
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            comparison = dateA - dateB
        }
        return order === 'asc' ? comparison : -comparison
      })
    }

    return res(
      ctx.status(200),
      ctx.json(filteredProducts)
    )
  }),

  // Get single product
  rest.get('https://api.escuelajs.co/api/v1/products/:id', (req, res, ctx) => {
    const { id } = req.params
    const product = mockProducts.find(p => p.id === Number(id))
    
    if (!product) {
      return res(
        ctx.status(404),
        ctx.json({ 
          statusCode: 404,
          message: 'Product not found',
          error: 'Not Found'
        })
      )
    }

    return res(
      ctx.status(200),
      ctx.json(product)
    )
  }),

  // Get categories
  rest.get('https://api.escuelajs.co/api/v1/categories', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockCategories)
    )
  }),

  // Handle errors for other routes
  rest.get('*', (req, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json({ 
        statusCode: 404,
        message: 'Resource not found',
        error: 'Not Found'
      })
    )
  })
]
