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
