import React from 'react';
import { Product, Category } from '../../types';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  selectedProducts: number[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<number[]>>;
  handleEdit: (product: Product) => void;
  handleDelete: (productIds: number[]) => Promise<void>;
  sortConfig: {
    field: 'title' | 'price' | 'category';
    direction: 'asc' | 'desc';
  };
  setSortConfig: React.Dispatch<React.SetStateAction<{
    field: 'title' | 'price' | 'category';
    direction: 'asc' | 'desc';
  }>>;
  isDeleting: boolean;
}

export default function ProductList({
  products,
  categories,
  selectedProducts,
  setSelectedProducts,
  handleEdit,
  handleDelete,
  sortConfig,
  setSortConfig,
  isDeleting
}: ProductListProps) {
  const handleSort = (field: 'title' | 'price' | 'category') => {
    setSortConfig({
      field,
      direction:
        sortConfig.field === field && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product.id));
    }
  };

  const toggleSelectProduct = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    switch (sortConfig.field) {
      case 'title':
        return direction * a.title.localeCompare(b.title);
      case 'price':
        return direction * (a.price - b.price);
      case 'category':
        const categoryA = categories.find((c) => c.id === a.category.id)?.name || '';
        const categoryB = categories.find((c) => c.id === b.category.id)?.name || '';
        return direction * categoryA.localeCompare(categoryB);
      default:
        return 0;
    }
  });

  return (
    <div className="overflow-x-auto rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedProducts.length === products.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium dark:text-gray-200">Select All</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedProducts.length} of {products.length} selected
          </span>
        </div>
        {selectedProducts.length > 0 && (
          <button
            onClick={() => handleDelete(selectedProducts)}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Deleting...</span>
              </>
            ) : (
              'Delete Selected'
            )}
          </button>
        )}
      </div>
      <table className="min-w-full bg-white dark:bg-gray-800 transition-colors duration-200">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"></th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              onClick={() => handleSort('title')}
            >
              Title {sortConfig.field === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              onClick={() => handleSort('price')}
            >
              Price {sortConfig.field === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              onClick={() => handleSort('category')}
            >
              Category {sortConfig.field === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-3 border-b border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 border-b border-gray-300">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleSelectProduct(product.id)}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-6 py-4 border-b border-gray-300">{product.title}</td>
              <td className="px-6 py-4 border-b border-gray-300">${product.price}</td>
              <td className="px-6 py-4 border-b border-gray-300">
                {categories.find((c) => c.id === product.category.id)?.name}
              </td>
              <td className="px-6 py-4 border-b border-gray-300">
                <button
                  onClick={() => handleEdit(product)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
