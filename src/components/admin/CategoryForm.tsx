import React from 'react';
import { Category } from '../../types';

interface CategoryFormProps {
  categoryFormData: {
    name: string;
    image: string;
  };
  setCategoryFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    image: string;
  }>>;
  editingCategory: Category | null;
  handleSaveCategory: (e: React.FormEvent) => Promise<void>;
  setShowCategoryForm: React.Dispatch<React.SetStateAction<boolean>>;
  creatingCategory: boolean;
}

export default function CategoryForm({
  categoryFormData,
  setCategoryFormData,
  editingCategory,
  handleSaveCategory,
  setShowCategoryForm,
  creatingCategory
}: CategoryFormProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl w-[32rem] max-h-[90vh] overflow-y-auto relative transition-all duration-200 transform">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button
            onClick={() => setShowCategoryForm(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSaveCategory} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={categoryFormData.name}
              onChange={(e) =>
                setCategoryFormData({ ...categoryFormData, name: e.target.value })
              }
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
            <input
              type="url"
              value={categoryFormData.image}
              onChange={(e) =>
                setCategoryFormData({ ...categoryFormData, image: e.target.value })
              }
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCategoryForm(false)}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center gap-2"
              disabled={creatingCategory}
            >
              {creatingCategory ? (
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
                  <span>Creating...</span>
                </>
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
