import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CartItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { BsSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { getAuthToken, removeAuthToken } from '../utils/auth';

const Navbar = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const adminToken = localStorage.getItem('adminToken');
      const storedUserName = localStorage.getItem('userName');
      const storedEmail = localStorage.getItem('userEmail');
      const storedAdminEmail = localStorage.getItem('adminEmail');
      
      setIsLoggedIn(!!token || !!adminToken);
      setIsAdmin(!!adminToken);
      if (storedUserName) {
        setUserName(storedUserName);
      }

      if ((token || adminToken) && !storedUserName) {
        try {
          const response = await fetch('https://api.escuelajs.co/api/v1/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token || adminToken}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('userName', userData.name);
            if (adminToken) {
              localStorage.setItem('adminEmail', userData.email);
            } else {
              localStorage.setItem('userEmail', userData.email);
            }
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
      const adminToken = localStorage.getItem('adminToken');
      
      // For admin, use admin-specific cart
      if (adminToken) {
        const adminEmail = localStorage.getItem('userEmail');
        if (adminEmail) {
          const cartKey = `cart_admin_${adminEmail}`;
          const cart = JSON.parse(localStorage.getItem(cartKey) || '[]') as CartItem[];
          setCartItems(cart);
          return;
        }
      }

      // For regular users, use their specific cart
      if (userEmail) {
        const cartKey = `cart_${userEmail}`;
        const cart = JSON.parse(localStorage.getItem(cartKey) || '[]') as CartItem[];
        setCartItems(cart);
        return;
      }

      // If no user is logged in, show empty cart
      setCartItems([]);
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
    removeAuthToken();
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  const handleCartClick = () => {
    router.push('/cart');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                ShopSmart
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">

            {/* User Actions */}
            <div className="flex items-center space-x-6">
              {/* Add theme toggle button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <BsSunFill className="h-6 w-6 text-yellow-400" />
                ) : (
                  <BsMoonStarsFill className="h-6 w-6 text-blue-500" />
                )}
              </button>
              {/* Admin Dashboard Link */}
              {/* {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Admin
                </Link>
              )} */}

              {/* Cart and Profile buttons */}
              {(isLoggedIn || isAdmin) && (
                <Link
                  href="/cart"
                  onClick={handleCartClick}
                  data-testid="cart-link"
                  className="relative p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200"
                >
                  <FaShoppingCart className="h-6 w-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                      <span data-testid="cart-count">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </span>
                  )}
                </Link>
              )}

              {(isLoggedIn || isAdmin) ? (
                <div className="relative group">
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white">
                      <span className="text-sm font-medium">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {isAdmin ? 'Admin' : 'Welcome back,'}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{userName}</span>
                    </div>
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700/50 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin/dashboard"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          Dashboard
                        </Link>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      </>
                    )}
                    <Link
                      href="/profile?tab=orders"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Order History
                    </Link>
                    <Link
                      href="/profile?tab=favorites"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Favorites
                    </Link>
                    <Link
                      href="/profile?tab=account"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      data-testid="sign-out-button"
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <FaBars className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 right-0 left-0 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-700/30 md:hidden">
              <div className="px-4 pt-2 pb-3 space-y-1">
                <Link
                  href="/products"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Products
                </Link>

                {isLoggedIn ? (
                  <>
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <span>{userName.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-200">{userName}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Logout
                      </button>
                    </div>

                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Sign up
                    </Link>
                  </div>
                )}

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span>Theme</span>
                  {theme === 'dark' ? (
                    <BsSunFill className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <BsMoonStarsFill className="h-5 w-5 text-blue-500" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
