import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Category } from '../../types';
import ProductFilter from '../../components/ProductFilter';
import LoadingSpinner from '../../components/LoadingSpinner';
import { GetServerSideProps } from 'next';
import { clearSearch } from '../../utils/search';

interface FilterState {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
}

interface QueryParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: string;
}

const Products = ({ initialProducts, initialCategories, appliedFilters }: { initialProducts: Product[] | null, initialCategories: Category[] | null, appliedFilters?: Partial<FilterState> }) => {
  const router = useRouter();
  const { search, category, minPrice, maxPrice, sortBy, sortOrder } = router.query;

  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts || []);
  const [searchValue, setSearchValue] = useState(search as string || '');

  const defaultFilters: FilterState = {
    category: null,
    minPrice: null,
    maxPrice: null,
    sortBy: '',
    sortOrder: 'desc',
  };

  const initialFilters: FilterState = {
    category: category as string || null,
    minPrice: minPrice ? Number(minPrice) : null,
    maxPrice: maxPrice ? Number(maxPrice) : null,
    sortBy: sortBy as string || null,
    sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
  };

  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
    ...appliedFilters
  });

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

  const sortProducts = useCallback((productsToSort: Product[], sortBy: string | null, sortOrder: 'asc' | 'desc') => {
    if (!sortBy) {
      // When no sort criteria is specified, prioritize products with valid images
      return [...productsToSort].sort((a, b) => {
        const aScore = getProductImageScore(a);
        const bScore = getProductImageScore(b);
        return sortOrder === 'asc' ? aScore - bScore : bScore - aScore;
      });
    }

    return [...productsToSort].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          // For default sorting (including date), also consider image validity as a secondary sort criteria
          const aScore = getProductImageScore(a);
          const bScore = getProductImageScore(b);
          if (aScore !== bScore) {
            comparison = bScore - aScore;
          } else {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            comparison = dateA - dateB;
          }
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [getProductImageScore]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('https://api.escuelajs.co/api/v1/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
      }
    };

    if (!initialProducts) {
      fetchProducts();
    }
    if (!initialCategories) {
      fetchCategories();
    }
  }, [initialProducts, initialCategories]);

  useEffect(() => {
    if (typeof search === 'string') {
      setSearchValue(search);
    } else {
      setSearchValue('');
    }
  }, [search]);

  useEffect(() => {
    if (!products) return;

    let filtered = [...products];

    // Apply search filter
    if (searchValue) {
      filtered = filtered.filter((product) => {
        const searchTerms = searchValue.toLowerCase().split(' ');
        return searchTerms.every(term =>
          product.title.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term)
        );
      });
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((product) => 
        product.category.id === Number(filters.category)
      );
    }

    // Apply price range filter
    if (filters.minPrice !== null) {
      filtered = filtered.filter((product) => product.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      filtered = filtered.filter((product) => product.price <= filters.maxPrice!);
    }

    // Apply final sorting
    const sortedFiltered = sortProducts(filtered, filters.sortBy, filters.sortOrder);
    setFilteredProducts(sortedFiltered);
  }, [products, searchValue, filters, sortProducts]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    const query: any = { ...router.query };

    // Update URL query parameters
    if (newFilters.category) {
      query.category = newFilters.category;
    } else {
      delete query.category;
    }

    if (newFilters.minPrice) {
      query.minPrice = newFilters.minPrice;
    } else {
      delete query.minPrice;
    }

    if (newFilters.maxPrice) {
      query.maxPrice = newFilters.maxPrice;
    } else {
      delete query.maxPrice;
    }

    if (newFilters.sortBy) {
      query.sortBy = newFilters.sortBy;
      query.sortOrder = newFilters.sortOrder;
    } else {
      delete query.sortBy;
      delete query.sortOrder;
    }

    router.push({ query }, undefined, { shallow: true });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    const query: any = { ...router.query };
    if (value) {
      query.search = value;
    } else {
      delete query.search;
    }
    router.push({ query }, undefined, { shallow: true });
  };

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No products found</h1>
          <p className="text-gray-600 dark:text-gray-400">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
          <p className="text-gray-600 dark:text-gray-400">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {loading && <LoadingSpinner delay={600} message="Loading product catalog..." />}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Products</h1>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none transition-all duration-200"
                />
                {searchValue && (
                  <button
                    onClick={() => {
                      setSearchValue('');
                      clearSearch(router, setSearchValue);
                    }}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  showFilters
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70'
                    : 'bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
                }`}
              >
                {showFilters ? (
                  <>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hidden sm:inline">Hide Filters</span>
                    <span className="sm:hidden">Hide</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hidden sm:inline">Show Filters</span>
                    <span className="sm:hidden">Filter</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="relative w-full">
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {showFilters && (
            <div className="md:w-1/4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
                <ProductFilter
                  categories={categories}
                  onFilterChange={handleFilterChange}
                  initialFilters={initialFilters}
                  isVisible={true}
                />
              </div>
            </div>
          )}

          <div className={showFilters ? "md:w-3/4" : "w-full"}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <>
                {/* Search Results Info */}
                {(searchValue || filters.category) && (
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold mb-4">
                      {searchValue ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-800 dark:text-white inline-flex items-center gap-2 flex-wrap">
                            <span className="whitespace-nowrap">
                              Search results for "
                              <span className="text-blue-600 dark:text-blue-400">{searchValue}</span>
                              "
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              ({filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'})
                            </span>
                            <button
                              onClick={() => clearSearch(router, setSearchValue)}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-800 dark:text-white inline-flex items-center gap-2 flex-wrap">
                            <span className="whitespace-nowrap">
                              All Products
                            </span>
                          </span>
                        </div>
                      )}
                    </h2>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
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
                          priority={true} // Load all images immediately
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

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">No products found matching your criteria.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, sortOrder } = query as QueryParams;
    
    // Build the API URL with query parameters
    let productsUrl = 'https://api.escuelajs.co/api/v1/products';
    if (search) {
      productsUrl += `?title=${search}`;
    }
    if (category) {
      productsUrl += `${search ? '&' : '?'}categoryId=${category}`;
    }
    
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(productsUrl),
      fetch('https://api.escuelajs.co/api/v1/categories')
    ]);
    
    if (!productsRes.ok || !categoriesRes.ok) {
      throw new Error('Failed to fetch data');
    }

    const [products, categories] = await Promise.all([
      productsRes.json(),
      categoriesRes.json()
    ]);

    // Server-side filtering for price range
    let filteredProducts = products as Product[];
    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter((product: Product) => {
        const price = Number(product.price);
        const min = minPrice ? Number(minPrice) : 0;
        const max = maxPrice ? Number(maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Server-side sorting
    if (sortBy) {
      filteredProducts.sort((a: Product, b: Product) => {
        const order = sortOrder === 'desc' ? -1 : 1;
        switch (sortBy) {
          case 'price':
            return (a.price - b.price) * order;
          case 'title':
            return a.title.localeCompare(b.title) * order;
          case 'createdAt':
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
          default:
            return 0;
        }
      });
    }

    const appliedFilters: FilterState = {
      category: category ? category : null,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      sortBy: sortBy || '',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
    };

    return {
      props: {
        initialProducts: filteredProducts,
        initialCategories: categories,
        appliedFilters
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        initialProducts: [],
        initialCategories: [],
        appliedFilters: {
          category: null,
          minPrice: null,
          maxPrice: null,
          sortBy: '',
          sortOrder: 'desc'
        },
        error: 'Failed to fetch data'
      },
    };
  }
};

export default Products;
