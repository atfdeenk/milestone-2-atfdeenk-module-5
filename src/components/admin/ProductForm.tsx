import React from 'react';
import { Product, Category } from '../../types';

interface ProductFormProps {
  formData: {
    title: string;
    price: string;
    description: string;
    categoryId: string;
    images: string[];
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    price: string;
    description: string;
    categoryId: string;
    images: string[];
  }>>;
  categories: Category[];
  editingProduct: Product | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProductForm({
  formData,
  setFormData,
  categories,
  editingProduct,
  handleSubmit,
  setShowForm
}: ProductFormProps) {
  const handleImageChange = (index: number, value: string) => {
    // Ensure URL starts with http:// or https://
    let processedValue = value.trim();
    if (processedValue && !processedValue.startsWith('http://') && !processedValue.startsWith('https://')) {
      processedValue = `https://${processedValue}`;
    }
    
    const newImages = [...formData.images];
    newImages[index] = processedValue;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[32rem] max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-xl font-bold mb-4">
          {editingProduct ? 'Edit Product' : 'Create New Product'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Images</label>
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Image URL"
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Image
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editingProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
