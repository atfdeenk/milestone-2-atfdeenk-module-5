import { useState } from 'react';
import { Category } from '../types';

interface FilterState {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
}

interface ProductFilterProps {
  categories: Category[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters: FilterState;
  isVisible: boolean;
}

const ProductFilter = ({ categories, onFilterChange, initialFilters, isVisible }: ProductFilterProps) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800 dark:text-white">Categories</h3>
        <select
          className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          value={filters.category || ''}
          onChange={(e) => handleFilterChange({ category: e.target.value || null })}
          aria-label="Categories"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800 dark:text-white">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : null })}
            className="w-1/2 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            min="0"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}
            className="w-1/2 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800 dark:text-white">Sort By</h3>
        <select
          className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          value={filters.sortBy || ''}
          onChange={(e) => handleFilterChange({ sortBy: e.target.value || null })}
          aria-label="Sort By"
        >
          <option value="">Most Recent</option>
          <option value="price">Price</option>
          <option value="title">Name</option>
        </select>
        <select
          className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
          aria-label="Sort Order"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <button
        className="w-full bg-red-500 dark:bg-red-600 text-white py-2 rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200"
        onClick={() => {
          const defaultFilters: FilterState = {
            category: null,
            minPrice: null,
            maxPrice: null,
            sortBy: null,
            sortOrder: 'desc' as const
          };
          setFilters(defaultFilters);
          onFilterChange(defaultFilters);
        }}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default ProductFilter;
