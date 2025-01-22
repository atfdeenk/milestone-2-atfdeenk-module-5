import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CartItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const storedUserName = localStorage.getItem('userName');
      const storedEmail = localStorage.getItem('userEmail');
      
      setIsLoggedIn(!!token);
      if (storedUserName) {
        setUserName(storedUserName);
      }

      if (token && !storedUserName) {
        try {
          const response = await fetch('https://api.escuelajs.co/api/v1/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('userEmail', userData.email);
            setUserName(userData.name);
            
            // Load user's cart data
            const userCartKey = `cart_${userData.email}`;
            const savedCart = localStorage.getItem(userCartKey);
            if (savedCart) {
              localStorage.setItem('cart', savedCart);
              window.dispatchEvent(new Event('cartUpdated'));
            }
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      }
    }
  }, []);

  const updateCartCount = useCallback(() => {
    if (typeof window !== 'undefined') {
      const userEmail = localStorage.getItem('userEmail');
      const cartKey = userEmail ? `cart_${userEmail}` : 'cart';
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]') as CartItem[];
      setCartItems(cart);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    updateCartCount();

    const handleProfileUpdate = () => {
      fetchProfile();
      updateCartCount();
    };

    const handleCartUpdate = () => {
      updateCartCount();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'userName' || e.key === 'userEmail') {
        fetchProfile();
      }
      if (e.key === 'cart' || e.key?.startsWith('cart_')) {
        updateCartCount();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchProfile, updateCartCount]);

  const handleLogout = () => {
    // Save current cart for the user before logging out
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const currentCart = localStorage.getItem('cart');
      if (currentCart) {
        localStorage.setItem(`cart_${userEmail}`, currentCart);
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('cart');
    setIsLoggedIn(false);
    setUserName('');
    setCartItems([]);
    router.push('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery) {
      const formattedQuery = trimmedQuery
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
      
      if (formattedQuery) {
        router.push(`/products?search=${encodeURIComponent(formattedQuery)}`);
        
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value.replace(/[^a-zA-Z0-9\s]/g, ''));
    
    if (!value.trim()) {
      router.push('/products');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    router.push('/products');
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e as unknown as React.FormEvent);
    }
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      const message = document.createElement('div');
      message.className = 'fixed bottom-4 right-4 bg-red-500 dark:bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Please login to view cart';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
      router.push('/login');
      return;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                ShopSmart
              </span>
            </Link>
          </div>

          {/* Mobile menu button and menu */}
          <div className="md:hidden flex items-center gap-2">
            {/* Dark mode toggle - visible on mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Cart button - visible on mobile */}
            <button
              onClick={() => router.push('/cart')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 relative"
              aria-label="Shopping cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Hamburger menu button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Menu"
            >
              <svg
                className="h-6 w-6 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 right-0 left-0 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-700/30 md:hidden">
              <div className="px-4 pt-2 pb-3 space-y-1">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyPress={handleSearchKeyPress}
                      placeholder="Search products..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:placeholder-gray-400"
                      aria-label="Search products"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                        title="Clear search"
                        aria-label="Clear search"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200"
                      disabled={!searchQuery.trim()}
                      aria-label="Search"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>

                {/* Profile Section */}
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{userName}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search products..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:placeholder-gray-400"
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200"
                disabled={!searchQuery.trim()}
                aria-label="Search"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* User Actions */}
            <div className="flex items-center space-x-6">
              {/* Add theme toggle button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {/* Cart and Profile buttons */}
              <Link
                href="/cart"
                onClick={handleCartClick}
                className="relative p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>

              {isLoggedIn ? (
                <div className="relative group">
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white">
                      <span className="text-sm font-medium">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Welcome back,</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{userName}</span>
                    </div>
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700/50 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/register"
                    className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200 text-sm font-medium"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
