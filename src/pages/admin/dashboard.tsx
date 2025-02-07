import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Product, Category } from '../../types';
import { removeAuthToken } from '../../utils/auth';
import ProgressBar from '../../components/admin/ProgressBar';
import ProductForm from '../../components/admin/ProductForm';
import ProductList from '../../components/admin/ProductList';
import CategoryForm from '../../components/admin/CategoryForm';
import CategoryList from '../../components/admin/CategoryList';

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, operation: '' });
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

  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [countdown, setCountdown] = useState(15);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Auto-refresh timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRefreshEnabled) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Reset countdown and refresh data
            fetchProducts();
            fetchCategories();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefreshEnabled]);

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(prev => !prev);
    if (!autoRefreshEnabled) {
      // Reset countdown when enabling
      setCountdown(15);
    }
  };

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    image: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    categoryId: '',
    images: ['']
  });

  useEffect(() => {
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }

      try {
        const verifyResponse = await fetch('https://api.escuelajs.co/api/v1/auth/profile', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (!verifyResponse.ok) {
          removeAuthToken('admin');
          router.push('/admin/login');
          return;
        }

        const userData = await verifyResponse.json();
        if (userData.role !== 'admin') {
          removeAuthToken('admin');
          router.push('/admin/login');
          return;
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        removeAuthToken('admin');
        router.push('/admin/login');
        return;
      }
    };

    const loadData = async () => {
      await checkAuth();
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (err) {
        console.error('Failed to initialize:', err);
      }
    };

    loadData();
  }, [router]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('https://api.escuelajs.co/api/v1/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.escuelajs.co/api/v1/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProgress({
      current: 0,
      total: 3, // 3 steps: validation, image processing, saving
      operation: editingProduct ? 'Updating Product' : 'Creating Product'
    });
    
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      setError('Admin token not found. Please log in again.');
      router.push('/admin/login');
      return;
    }

    try {
      const verifyResponse = await fetch('https://api.escuelajs.co/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!verifyResponse.ok) {
        setError('Admin session expired. Please log in again.');
        removeAuthToken('admin');
        router.push('/admin/login');
        return;
      }

      const userData = await verifyResponse.json();
      if (userData.role !== 'admin') {
        setError('Unauthorized. Admin access required.');
        removeAuthToken('admin');
        router.push('/admin/login');
        return;
      }

      setProgress(prev => ({ ...prev, current: 1 })); // Step 1: Validation
      
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

      setProgress(prev => ({ ...prev, current: 2 })); // Step 2: Image processing
      
      // Filter out empty image URLs and ensure proper URL format
      const validImages = formData.images
        .filter(img => img.trim() !== '')
        .map(img => {
          let url = img.trim();
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
          }
          return url;
        });
      
      // Ensure there's at least one image URL
      if (validImages.length === 0) {
        setError('Please provide at least one valid image URL');
        return;
      }
      
      // Validate that all URLs are properly formatted
      if (!validImages.every(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      })) {
        setError('One or more image URLs are invalid');
        return;
      }

      const url = editingProduct
        ? `https://api.escuelajs.co/api/v1/products/${editingProduct.id}`
        : 'https://api.escuelajs.co/api/v1/products';

      setProgress(prev => ({ ...prev, current: 3 })); // Step 3: Saving
      
      if (!editingProduct) {
        // Create new product
        const createResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
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
      } else {
        // Update existing product
        const updateResponse = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
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
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setProgress({ current: 0, total: 0, operation: '' });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price.toString(),
      description: product.description,
      categoryId: product.category.id.toString(),
      images: product.images
    });
    setShowForm(true);
  };

  const handleDelete = async (productIds: number[]) => {
    if (!window.confirm(`Are you sure you want to delete ${productIds.length} product(s)?`)) return;

    setIsDeleting(true);
    setProgress({ current: 0, total: productIds.length, operation: 'Deleting Products' });
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      setError('Admin token not found. Please log in again.');
      router.push('/admin/login');
      return;
    }

    try {
      // First verify the admin token
      console.log('Verifying admin token...');
      const verifyResponse = await fetch('https://api.escuelajs.co/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-store' // Prevent caching
      });

      if (!verifyResponse.ok) {
        throw new Error('Admin session expired. Please log in again.');
      }

      const userData = await verifyResponse.json();
      if (userData.role !== 'admin') {
        throw new Error('Unauthorized. Admin access required.');
      }

      console.log('Token verified, proceeding with deletion...');

      // Delete products one by one instead of using Promise.all
      for (const id of productIds) {
        try {
          console.log(`Attempting to delete product ${id}...`);
          const response = await fetch(`https://api.escuelajs.co/api/v1/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            cache: 'no-store' // Prevent caching
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Failed to delete product ${id}:`, errorData);
            throw new Error(errorData.message || `Failed to delete product ${id}`);
          }

          console.log(`Successfully deleted product ${id}`);
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        } catch (error) {
          console.error(`Error deleting product ${id}:`, error);
          throw error;
        }
      }

      console.log('All products deleted successfully');
      setSelectedProducts([]);
      await fetchProducts();
    } catch (err) {
      console.error('Error in delete operation:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete one or more products');
      if (err instanceof Error && (err.message.includes('session expired') || err.message.includes('Unauthorized'))) {
        removeAuthToken('admin');
        router.push('/admin/login');
      }
    } finally {
      setIsDeleting(false);
      setProgress({ current: 0, total: 0, operation: '' });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      image: category.image
    });
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreatingCategory(true);
    setProgress({
      current: 0,
      total: 2, // 2 steps: validation and saving
      operation: editingCategory ? 'Updating Category' : 'Creating Category'
    });

    // Validate URL format
    try {
      new URL(categoryFormData.image);
    } catch (err) {
      setError('Please enter a valid image URL (e.g., https://example.com/image.jpg)');
      setCreatingCategory(false);
      setProgress({ current: 0, total: 0, operation: '' });
      return;
    }

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      setError('Admin token not found. Please log in again.');
      router.push('/admin/login');
      return;
    }

    try {
      setProgress(prev => ({ ...prev, current: 1 })); // Step 1: Validation
      const url = editingCategory
        ? `https://api.escuelajs.co/api/v1/categories/${editingCategory.id}`
        : 'https://api.escuelajs.co/api/v1/categories';

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(categoryFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingCategory ? 'update' : 'create'} category`);
      }

      setProgress(prev => ({ ...prev, current: 2 })); // Step 2: Saving
      await fetchCategories();
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        image: ''
      });
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setCreatingCategory(false);
      setProgress({ current: 0, total: 0, operation: '' });
    }
  };

  const handleDeleteCategories = async (categoryIds: number[]) => {
    if (!window.confirm(`Are you sure you want to delete ${categoryIds.length} category(s)?`)) return;

    setIsDeletingCategories(true);
    setProgress({
      current: 0,
      total: categoryIds.length,
      operation: 'Deleting Categories'
    });
    const adminToken = localStorage.getItem('adminToken');

    try {
      await Promise.all(
        categoryIds.map(async (id) => {
          const response = await fetch(`https://api.escuelajs.co/api/v1/categories/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${adminToken}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to delete category ${id}`);
          }
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        })
      );

      setSelectedCategories([]);
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting categories:', err);
      setError('Failed to delete one or more categories');
    } finally {
      setIsDeletingCategories(false);
      setProgress({ current: 0, total: 0, operation: '' });
    }
  };

  return (
    <React.Fragment>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        {progress.total > 0 && (
          <ProgressBar
            progress={progress.current}
            total={progress.total}
            operation={progress.operation}
          />
        )}
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6 transition-colors duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-colors duration-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Products Summary</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAutoRefresh}
                  className={`flex items-center px-2 py-1 rounded text-xs ${autoRefreshEnabled 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                >
                  <svg className={`w-3 h-3 mr-1 ${autoRefreshEnabled ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {autoRefreshEnabled ? `Auto-refresh in ${countdown}s` : 'Auto-refresh off'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 dark:bg-gray-700 p-2 rounded relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Total Products</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{products.length}</p>
                </div>
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-800 opacity-20 transform scale-x-0 origin-left transition-transform duration-15000 ease-linear animate-progress"></div>
              </div>
              <div className="bg-green-50 dark:bg-gray-700 p-2 rounded relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Selected Products</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{selectedProducts.length}</p>
                </div>
                <div className="absolute inset-0 bg-green-100 dark:bg-green-800 opacity-20 transform scale-x-0 origin-left transition-transform duration-15000 ease-linear animate-progress"></div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-colors duration-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Categories Summary</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAutoRefresh}
                  className={`flex items-center px-2 py-1 rounded text-xs ${autoRefreshEnabled 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                >
                  <svg className={`w-3 h-3 mr-1 ${autoRefreshEnabled ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {autoRefreshEnabled ? `Auto-refresh in ${countdown}s` : 'Auto-refresh off'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-purple-50 dark:bg-gray-700 p-2 rounded relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Total Categories</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{categories.length}</p>
                </div>
                <div className="absolute inset-0 bg-purple-100 dark:bg-purple-800 opacity-20 transform scale-x-0 origin-left transition-transform duration-15000 ease-linear animate-progress"></div>
              </div>
              <div className="bg-indigo-50 dark:bg-gray-700 p-2 rounded relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs text-gray-600 dark:text-gray-300">Selected Categories</p>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{selectedCategories.length}</p>
                </div>
                <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-800 opacity-20 transform scale-x-0 origin-left transition-transform duration-15000 ease-linear animate-progress"></div>
              </div>
            </div>
          </div>
        </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-6">
            {error && (
              <div className="m-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                <button
                  className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'products'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('products')}
                >
                  Products ({products.length})
                </button>
                <button
                  className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'categories'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('categories')}
                >
                  Categories ({categories.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'products' ? (
                loading ? (
                  <div className="flex justify-center items-center h-32">
                    <svg
                      className="animate-spin h-8 w-8 text-gray-500"
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
                  </div>
                ) : (
                  <ProductList
                    products={products}
                    categories={categories}
                    selectedProducts={selectedProducts}
                    setSelectedProducts={setSelectedProducts}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    sortConfig={sortConfig}
                    setSortConfig={setSortConfig}
                    isDeleting={isDeleting}
                  />
                )
              ) : (
                loadingCategories ? (
                  <div className="flex justify-center items-center h-32">
                    <svg
                      className="animate-spin h-8 w-8 text-gray-500"
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
                  </div>
                ) : (
                  <CategoryList
                    categories={categories}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    handleEditCategory={handleEditCategory}
                    handleDeleteCategories={handleDeleteCategories}
                    isDeletingCategories={isDeletingCategories}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          editingProduct={editingProduct}
          handleSubmit={handleSubmit}
          setShowForm={setShowForm}
        />
      )}

      {showForm && (
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          editingProduct={editingProduct}
          handleSubmit={handleSubmit}
          setShowForm={setShowForm}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          categoryFormData={categoryFormData}
          setCategoryFormData={setCategoryFormData}
          editingCategory={editingCategory}
          handleSaveCategory={handleSaveCategory}
          setShowCategoryForm={setShowCategoryForm}
          creatingCategory={creatingCategory}
        />
      )}
    </React.Fragment>
  );
}
