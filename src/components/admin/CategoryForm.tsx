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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[32rem] max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-xl font-bold mb-4">
          {editingCategory ? 'Edit Category' : 'Create New Category'}
        </h2>
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={categoryFormData.name}
              onChange={(e) =>
                setCategoryFormData({ ...categoryFormData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              value={categoryFormData.image}
              onChange={(e) =>
                setCategoryFormData({ ...categoryFormData, image: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCategoryForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
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
