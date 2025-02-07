import React, { useState } from 'react';
import Image from 'next/image';
import { Category } from '../../types';

const DEFAULT_IMAGE = 'https://picsum.photos/200/200';

const validateImageUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const allowedDomains = [
      'api.escuelajs.co',
      'picsum.photos',
      'images.unsplash.com',
      'via.placeholder.com',
      'fastly.picsum.photos',
      'loremflickr.com',
      'cloudflare-ipfs.com',
      'raw.githubusercontent.com',
      'avatars.githubusercontent.com',
      'robohash.org',
      'carshow.id',
      'storage.googleapis.com',
      'storage.cloud.google.com'
    ];

    return allowedDomains.includes(parsed.hostname) ? url : DEFAULT_IMAGE;
  } catch {
    return DEFAULT_IMAGE;
  }
};

interface CategoryListProps {
  categories: Category[];
  selectedCategories: number[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<number[]>>;
  handleEditCategory: (category: Category) => void;
  handleDeleteCategories: (categoryIds: number[]) => Promise<void>;
  isDeletingCategories: boolean;
}

export default function CategoryList({
  categories,
  selectedCategories,
  setSelectedCategories,
  handleEditCategory,
  handleDeleteCategories,
  isDeletingCategories
}: CategoryListProps) {
  const toggleSelectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((category) => category.id));
    }
  };

  const toggleSelectCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="overflow-x-auto mt-8 rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedCategories.length === categories.length}
              onChange={toggleSelectAllCategories}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium dark:text-gray-200">Select All Categories</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedCategories.length} of {categories.length} selected
          </span>
        </div>
        {selectedCategories.length > 0 && (
          <button
            onClick={() => handleDeleteCategories(selectedCategories)}
            disabled={isDeletingCategories}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 flex items-center gap-2"
          >
            {isDeletingCategories ? (
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm bg-white dark:bg-gray-800">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleSelectCategory(category.id)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800">{category.name}</td>
              <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-700 dark:text-gray-200">
                <div className="relative w-16 h-16">
                  <Image
                    src={validateImageUrl(category.image)}
                    alt={category.name}
                    fill
                    className="object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_IMAGE;
                    }}
                    />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-700 dark:text-gray-200">
                <button
                  onClick={() => handleEditCategory(category)}
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
