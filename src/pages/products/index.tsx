import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Category } from '../../types';
import ProductFilter from '../../components/ProductFilter';

interface FilterState {
  category: number | null;
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const Products = ({ initialProducts, initialCategories }: { initialProducts: Product[], initialCategories: Category[] }) => {
  const router = useRouter();
  const { search, category, minPrice, maxPrice, sortBy, sortOrder } = router.query;

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);

  const initialFilters: FilterState = {
    category: category ? Number(category) : null,
    priceRange: {
      min: minPrice ? Number(minPrice) : 0,
      max: maxPrice ? Number(maxPrice) : 0,
    },
    sortBy: sortBy as string || '',
    sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const isValidImageUrl = (url: string) => {
    try {
      return url && 
        (url.startsWith('http://') || url.startsWith('https://')) &&
        !url.includes('undefined') &&
        !url.includes('null');
    } catch {
      return false;
    }
  };

  const getValidImageUrl = (product: Product) => {
    if (!product.images || product.images.length === 0) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title)}&background=random&size=200`;
    }

    // Find the first valid image URL
    const validImage = product.images.find(isValidImageUrl);
    if (validImage) {
      return validImage;
    }

    // If no valid images found, return a fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title)}&background=random&size=200`;
  };

  const getProductImageScore = useCallback((product: Product) => {
    if (!product.images || product.images.length === 0) return 0;
    const validImages = product.images.filter(isValidImageUrl);
    return validImages.length;
  }, []);

  const sortProducts = useCallback((products: Product[], sortBy: string, sortOrder: 'asc' | 'desc') => {
    return [...products].sort((a, b) => {
      let comparison = 0;

      if (!sortBy || sortBy === '') {
        // If no sort is selected, prioritize by valid images first
        const aScore = getProductImageScore(a);
        const bScore = getProductImageScore(b);
        comparison = bScore - aScore; // Higher score first
        
        // If image scores are equal, then sort by creation date
        if (comparison === 0) {
          const dateA = new Date(a.createdAt || '').getTime();
          const dateB = new Date(b.createdAt || '').getTime();
          comparison = dateB - dateA; // Newest first
        }
      } else {
        // Apply the selected sort
        switch (sortBy) {
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'createdAt': {
            const dateA = new Date(a.createdAt || '').getTime();
            const dateB = new Date(b.createdAt || '').getTime();
            comparison = dateA - dateB;
            break;
          }
          default:
            comparison = 0;
        }

        // If primary sort criteria are equal, then sort by image validity
        if (comparison === 0) {
          const aScore = getProductImageScore(a);
          const bScore = getProductImageScore(b);
          comparison = bScore - aScore; // Higher score first
        }
      }
      
      return sortBy === '' ? comparison : (sortOrder === 'asc' ? comparison : -comparison);
    });
  }, [getProductImageScore]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://api.escuelajs.co/api/v1/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const url = 'https://api.escuelajs.co/api/v1/products';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        // Initial sort by creation date (newest first)
        const sortedProducts = sortProducts(data, 'createdAt', 'desc');
        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortProducts]);

  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    const searchQuery = (search as string)?.toLowerCase().trim() || '';
    if (searchQuery) {
      filtered = filtered.filter((product) => {
        // Only search in title for more precise results
        const title = product.title.toLowerCase();
        return title.includes(searchQuery);
      });
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((product) => product.category.id === filters.category);
    }

    // Apply price filter
    if (filters.priceRange.min > 0 || filters.priceRange.max > 0) {
      filtered = filtered.filter((product) => {
        if (filters.priceRange.min > 0 && product.price < filters.priceRange.min) return false;
        if (filters.priceRange.max > 0 && product.price > filters.priceRange.max) return false;
        return true;
      });
    }

    // Apply final sorting
    const sortedFiltered = sortProducts(filtered, filters.sortBy, filters.sortOrder);
    setFilteredProducts(sortedFiltered);
  }, [products, search, filters, sortProducts]);

  useEffect(() => {
    // Check authentication on client side
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Update URL params
    const query: any = { ...router.query };
    if (newFilters.category) {
      query.category = newFilters.category.toString();
    } else {
      delete query.category;
    }
    if (newFilters.priceRange.min) {
      query.minPrice = newFilters.priceRange.min.toString();
    } else {
      delete query.minPrice;
    }
    if (newFilters.priceRange.max) {
      query.maxPrice = newFilters.priceRange.max.toString();
    } else {
      delete query.maxPrice;
    }
    query.sortBy = newFilters.sortBy;
    query.sortOrder = newFilters.sortOrder;
    router.push({ query }, undefined, { shallow: true });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Products</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          {showFilters ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Hide Filters
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Show Filters
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter sidebar - only show when filters are enabled */}
        {showFilters && (
          <div className="md:w-1/4">
            <ProductFilter
              categories={categories}
              onFilterChange={handleFilterChange}
              initialFilters={initialFilters}
              isVisible={true}
            />
          </div>
        )}

        {/* Main content - adjust width based on filter visibility */}
        <div className={showFilters ? "md:w-3/4" : "w-full"}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <>
              {/* Search Results Info */}
              {(search || filters.category) && (
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold mb-4">
                    <span>
                      {search ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-800 dark:text-white inline-flex items-center gap-2 flex-wrap">
                            <span className="whitespace-nowrap">
                              Search results for "
                              <span className="text-blue-600 dark:text-blue-400">{search}</span>
                              "
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found)
                            </span>
                            <button
                              onClick={() => {
                                const query = { ...router.query };
                                delete query.search;
                                router.push({ query }, undefined, { shallow: true });
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 inline-flex items-center"
                              title="Clear search"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </span>
                        </div>
                      ) : (
                        "All Products"
                      )}
                    </span>
                  </h2>
                </div>
              )}
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <Link
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 group relative"
                  >
                    <div className="relative pb-[100%]">
                      <Image
                        src={getValidImageUrl(product)}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        priority={index < 4} // Load first 4 images immediately
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {product.category.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* No Products Message */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">No products found</h3>
                  <p className="text-gray-500 dark:text-gray-300 mt-2">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch('https://api.escuelajs.co/api/v1/products'),
      fetch('https://api.escuelajs.co/api/v1/categories')
    ]);
    
    const [products, categories] = await Promise.all([
      productsRes.json(),
      categoriesRes.json()
    ]);

    return {
      props: {
        initialProducts: products,
        initialCategories: categories,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        initialProducts: [],
        initialCategories: [],
        error: 'Failed to fetch data'
      },
    };
  }
};

export default Products;
