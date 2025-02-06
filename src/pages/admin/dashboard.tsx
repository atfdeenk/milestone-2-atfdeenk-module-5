import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Product, Category } from '../../types';

const AdminDashboard = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isDeletingCategories, setIsDeletingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  type SortField = 'title' | 'price' | 'category';
  type SortDirection = 'asc' | 'desc';

  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({ 
    field: 'title', 
    direction: 'asc' 
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    image: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    categoryId: '',
    images: ['']
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }

    const init = async () => {
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (err) {
        console.error('Failed to initialize:', err);
      }
    };

    init();
  }, [router]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setError('');
    try {
      const response = await fetch('https://api.escuelajs.co/api/v1/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      console.log('Fetched categories:', data); // Debug log
      if (!Array.isArray(data)) throw new Error('Invalid categories data');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      setCategories([]); // Reset categories on error
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://api.escuelajs.co/api/v1/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategories = async (categoryIds: number[]) => {
    if (!window.confirm(`Are you sure you want to delete ${categoryIds.length} category(s)?`)) {
      return;
    }

    setIsDeletingCategories(true);
    setError('');

    try {
      const deletePromises = categoryIds.map(id =>
        fetch(`https://api.escuelajs.co/api/v1/categories/${id}`, {
          method: 'DELETE'
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const failedDeletes = results.filter(result => result.status === 'rejected');

      if (failedDeletes.length > 0) {
        setError(`Failed to delete ${failedDeletes.length} category(s)`);
      }

      await fetchCategories(); // Refresh the categories list
      await fetchProducts(); // Refresh products as some might be affected
      setSelectedCategories([]); // Clear selection after successful deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete categories');
    } finally {
      setIsDeletingCategories(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      image: Array.isArray(category.image) ? category.image[0] : category.image
    });
    setShowCategoryForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }

    // Validate category
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    // Ensure category exists
    const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId);
    if (!selectedCategory) {
      setError('Selected category not found');
      return;
    }

    try {
      // Filter out empty image URLs and clean the URLs
      const validImages = formData.images
        .filter(img => img.trim() !== '')
        .map(img => img.trim())
        .map(img => `["${img.replace(/[\[\]"]/g, '')}"]`);  // Format for API
      
      // Ensure there's at least one image URL
      if (validImages.length === 0) {
        setError('Please provide at least one valid image URL');
        return;
      }

      const url = editingProduct
        ? `https://api.escuelajs.co/api/v1/products/${editingProduct.id}`
        : 'https://api.escuelajs.co/api/v1/products';

      const method = editingProduct ? 'PUT' : 'POST';

      // For new products, we need to create it first
      if (!editingProduct) {
        const createResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            price: Number(formData.price),
            description: formData.description,
            categoryId: Number(formData.categoryId),
            images: validImages
          })
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.message || 'Failed to create product');
        }

        const newProduct = await createResponse.json();

        // If it's an update, just send the update request
        if (method === 'PUT') {
          const updateResponse = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: formData.title,
              price: Number(formData.price),
              description: formData.description,
              categoryId: Number(formData.categoryId),
              images: validImages
            })
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to update product');
          }
        }
      }

      await fetchProducts(); // Refresh the product list
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        title: '',
        price: '',
        description: '',
        categoryId: '',
        images: ['']
      });
      setError(''); // Clear any existing errors
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  const handleDelete = async (productIds: number[]) => {
    if (!window.confirm(`Are you sure you want to delete ${productIds.length} product(s)?`)) return;

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const deletePromises = productIds.map(id =>
        fetch(`https://api.escuelajs.co/api/v1/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const failedDeletes = results.filter(result => result.status === 'rejected');

      if (failedDeletes.length > 0) {
        setError(`Failed to delete ${failedDeletes.length} product(s)`);
      }

      setSelectedProducts([]);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete products');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectAllCategories = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(categories.map(c => c.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }

    if (!categoryFormData.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (!categoryFormData.image.trim()) {
      setError('Category image URL is required');
      return;
    }

    setCreatingCategory(true);

    try {
      const url = editingCategory
        ? `https://api.escuelajs.co/api/v1/categories/${editingCategory.id}`
        : 'https://api.escuelajs.co/api/v1/categories/';

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: categoryFormData.name.trim(),
          image: categoryFormData.image.trim()
        })
      });

      if (!response.ok) {
        throw new Error(editingCategory ? 'Failed to update category' : 'Failed to create category');
      }

      const updatedCategory = await response.json();
      setCategories(prev => 
        editingCategory
          ? prev.map(cat => cat.id === editingCategory.id ? updatedCategory : cat)
          : [...prev, updatedCategory]
      );
      setEditingCategory(null);
      setCategoryFormData({ name: '', image: '' });
      setShowCategoryForm(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price.toString(),
      description: product.description,
      categoryId: product.category.id.toString(),
      images: [...product.images]
    });
    setShowForm(true);
  };

  const handleAddImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <React.Fragment>
      <Head>
        <title>Admin Dashboard | Your Store</title>
      </Head>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Categories Section */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Categories
                </h3>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => handleDeleteCategories(selectedCategories)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    disabled={isDeletingCategories}
                  >
                    {isDeletingCategories ? 'Deleting...' : `Delete (${selectedCategories.length})`}
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === categories.length}
                    onChange={(e) => handleSelectAllCategories(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Select All
                  </label>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryFormData({
                      name: '',
                      image: ''
                    });
                    setShowCategoryForm(true);
                  }}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Category
                </button>
              </div>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg relative group">
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => handleSelectCategory(category.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <img
                      src={Array.isArray(category.image) ? category.image[0] : category.image}
                      alt={category.name}
                      className="w-full h-40 object-cover rounded-md mb-2"
                    />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{category.name}</h4>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Form Modal */}
          {showCategoryForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                      }}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <form onSubmit={handleSaveCategory} className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Image URL
                      </label>
                      <input
                        type="text"
                        id="image"
                        value={categoryFormData.image}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, image: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Section */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Products
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    title: '',
                    price: '',
                    description: '',
                    categoryId: '',
                    images: ['']
                  });
                  setShowForm(true);
                }}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Product
              </button>
            </div>

            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingProduct(null);
                        }}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:px-6">

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      required
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </label>
                    <div className="mt-1 relative">
                      {loadingCategories ? (
                        <div className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          Loading categories...
                        </div>
                      ) : (
                        <select
                          name="categoryId"
                          id="categoryId"
                          required
                          value={formData.categoryId}
                          onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                          className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name} (ID: {category.id})
                            </option>
                          ))}
                        </select>
                      )}
                      <div className="mt-1">
                        {error && (
                          <div className="text-red-600 text-sm mb-2">{error}</div>
                        )}
                        {selectedCategories.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {selectedCategories.length} category(s) selected
                              </span>
                              <button
                                onClick={() => handleDeleteCategories(selectedCategories)}
                                disabled={isDeletingCategories}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                              >
                                {isDeletingCategories ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  <span>Delete Selected</span>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center space-x-4">
                            <input
                              type="checkbox"
                              checked={selectedCategories.length === categories.length}
                              onChange={(e) => handleSelectAllCategories(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Select All
                            </span>
                          </div>
                          <div>
                            {categories.length === 0 && !loadingCategories && (
                              <div className="text-gray-500 dark:text-gray-400 text-sm">
                                No categories available
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowCategoryForm(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                          >
                            Add Category
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {categories.map(category => (
                            <div 
                              key={category.id} 
                              onClick={() => setFormData(prev => ({ ...prev, categoryId: category.id.toString() }))}
                              className={`p-2 rounded-md border cursor-pointer transition-all hover:shadow-md relative ${formData.categoryId === category.id.toString() ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}`}
                            >
                              <div className="absolute top-2 left-2 z-10">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.includes(category.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleSelectCategory(category.id, e.target.checked);
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </div>
                              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700 mb-2">
                                <div className="absolute top-2 right-2 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditCategory(category);
                                    }}
                                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                </div>
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className="object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/150';
                                  }}
                                />
                              </div>
                              <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                                {category.name}
                                <br />
                                <span className="text-gray-400 dark:text-gray-500">ID: {category.id}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Images
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Add at least one image URL. The image should be accessible and in a common format (jpg, png, etc).
                    </p>
                    {formData.images.map((image, index) => (
                      <div key={index} className="mt-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={image}
                            onChange={e => {
                              const newImages = [...formData.images];
                              newImages[index] = e.target.value;
                              setFormData(prev => ({ ...prev, images: newImages }));
                            }}
                            placeholder="https://example.com/image.jpg"
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="px-2 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            disabled={formData.images.length === 1}
                          >
                            Remove
                          </button>
                        </div>
                        {image && (
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                              src={(() => {
                                try {
                                  if (image.startsWith('["') && image.endsWith('"]')) {
                                    return JSON.parse(image)[0];
                                  }
                                  return image.replace(/[\[\]"]/g, '');
                                } catch (e) {
                                  return image;
                                }
                              })()}
                              alt="Preview"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/150';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                    >
                      Add Image
                    </button>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {editingProduct ? 'Update' : 'Create'} Product
                    </button>
                  </div>
                </form>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              {selectedProducts.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedProducts.length} product(s) selected
                    </span>
                    <button
                      onClick={() => handleDelete(selectedProducts)}
                      disabled={isDeleting}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <span>Delete Selected</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Image
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('title')}>
                      <div className="flex items-center space-x-1">
                        <span>Title</span>
                        {sortConfig.field === 'title' && (
                          <svg className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('price')}>
                      <div className="flex items-center space-x-1">
                        <span>Price</span>
                        {sortConfig.field === 'price' && (
                          <svg className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('category')}>
                      <div className="flex items-center space-x-1">
                        <span>Category</span>
                        {sortConfig.field === 'category' && (
                          <svg className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {[...products].sort((a, b) => {
                    if (sortConfig.field === 'title') {
                      return sortConfig.direction === 'asc'
                        ? a.title.localeCompare(b.title)
                        : b.title.localeCompare(a.title);
                    }
                    if (sortConfig.field === 'price') {
                      return sortConfig.direction === 'asc'
                        ? a.price - b.price
                        : b.price - a.price;
                    }
                    if (sortConfig.field === 'category') {
                      return sortConfig.direction === 'asc'
                        ? a.category.name.localeCompare(b.category.name)
                        : b.category.name.localeCompare(a.category.name);
                    }
                    return 0;
                  }).map((product) => (
                    <tr key={product.id} className={selectedProducts.includes(product.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-20 w-20 relative rounded-lg overflow-hidden">
                          <img
                            src={(() => {
                              try {
                                if (Array.isArray(product.images) && product.images[0]) {
                                  // Handle double-wrapped JSON string
                                  const imageUrl = product.images[0];
                                  if (typeof imageUrl === 'string' && imageUrl.startsWith('["') && imageUrl.endsWith('"]')) {
                                    return JSON.parse(imageUrl)[0];
                                  }
                                  return imageUrl.replace(/[\[\]"]/g, '');
                                }
                                return 'https://via.placeholder.com/150';
                              } catch (e) {
                                return 'https://via.placeholder.com/150';
                              }
                            })()}
                            alt={product.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/150';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="max-w-xs truncate">{product.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {product.category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete([product.id])}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={() => setShowCategoryForm(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={categoryFormData.name}
                    onChange={e => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="categoryImage"
                    value={categoryFormData.image}
                    onChange={e => setCategoryFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {categoryFormData.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Image Preview:</p>
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <img
                        src={categoryFormData.image}
                        alt="Category preview"
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCategory}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {creatingCategory ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
        )}
      </div>
    </React.Fragment>
  );
};

export default AdminDashboard;
