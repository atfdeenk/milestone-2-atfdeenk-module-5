import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from '../components/Logo';
import { FaQuestionCircle } from 'react-icons/fa';

const Login: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/products');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Same API endpoint for both user and admin
      const response = await fetch('https://api.escuelajs.co/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(),
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      if (!data.access_token) {
        throw new Error('No access token received');
      }

      // Store token based on login type
      if (loginType === 'admin') {
        localStorage.setItem('adminToken', data.access_token);
        document.cookie = `adminToken=${data.access_token}; path=/; max-age=86400; samesite=strict`;
      } else {
        localStorage.setItem('token', data.access_token);
        document.cookie = `token=${data.access_token}; path=/; max-age=86400; samesite=strict`;
      }

      // Fetch user profile
      const profileResponse = await fetch('https://api.escuelajs.co/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });

      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userEmail', userData.email);
        
        // Load user's cart data
        const userCartKey = `cart_${userData.email}`;
        const savedCart = localStorage.getItem(userCartKey);
        if (savedCart) {
          localStorage.setItem('cart', savedCart);
          window.dispatchEvent(new Event('cartUpdated'));
        }

        // Show success message and redirect based on login type
        setSuccess('Sign in successful! Redirecting...');
        setTimeout(() => {
          if (loginType === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/products');
          }
        }, 1500); // Redirect after 1.5 seconds
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Card Container */}
        <div className="relative">
          {/* Decorative Background */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 transform -rotate-6 rounded-3xl shadow-2xl md:block hidden"
          ></div>
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl shadow-2xl md:hidden"
          ></div>
          
          {/* Content Container */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="px-6 sm:px-8 pt-8 pb-6 text-center">
              <div className="mb-4 flex justify-center">
                <Logo />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                Welcome Back!
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {loginType === 'admin' 
                  ? 'Sign in to access the admin dashboard'
                  : 'Sign in to your account to continue shopping'}
              </p>
            </div>

            {/* Login Type Selector */}
            <div className="px-6 sm:px-8 pb-4">
              <div className="flex justify-center space-x-4 relative">
                <button
                  type="button"
                  onClick={() => setLoginType('user')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${loginType === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  User Login
                </button>
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setLoginType('admin')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${loginType === 'admin' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    Admin Login
                  </button>
                  {loginType === 'admin' && (
                    <button
                      type="button"
                      onClick={() => setShowHelp(!showHelp)}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
                      aria-label="Show admin credentials"
                    >
                      <FaQuestionCircle className="w-4 h-4" />
                    </button>
                  )}
                  {showHelp && loginType === 'admin' && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
                      <div className="text-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Admin Credentials</h3>
                        <div className="space-y-2 text-gray-600 dark:text-gray-300">
                          <p><span className="font-medium">Email:</span> admin@mail.com</p>
                          <p><span className="font-medium">Password:</span> admin123</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="px-6 sm:px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {error && (
                  <div className="p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="p-3 sm:p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-sm sm:text-base"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-sm sm:text-base"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>

                <div className="text-sm text-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Don't have an account?{' '}
                  </span>
                  <Link 
                    href="/register" 
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign up here
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
