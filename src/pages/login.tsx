import type { NextPage } from 'next';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from '../components/Logo';
import { FaQuestionCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { removeAuthToken } from '../utils/auth';

const Login: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [showHelp, setShowHelp] = useState(false);
  const [showUserHelp, setShowUserHelp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ exists: boolean; message: string } | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [availableAccounts, setAvailableAccounts] = useState<Array<{ email: string; role: string; password: string }>>([]);

  const fetchAvailableAccounts = async () => {
    try {
      const response = await fetch('https://api.escuelajs.co/api/v1/users');
      const users = await response.json();
      setAvailableAccounts(users.map((user: any) => ({
        email: user.email,
        role: user.role,
        password: user.password || 'changeme'
      })));
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    // Fetch available accounts when help dialog opens
    if (showUserHelp) {
      fetchAvailableAccounts();
    }
  }, [showUserHelp]);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/products');
    }
  }, [router]);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;

    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const verifyEmail = async (email: string) => {
    try {
      if (!email || !email.includes('@')) {
        setEmailStatus(null);
        return false;
      }

      setIsCheckingEmail(true);
      const response = await fetch('https://api.escuelajs.co/api/v1/users');
      const users = await response.json();
      const exists = users.some((user: any) => user.email === email);
      
      setEmailStatus({
        exists,
        message: exists ? 'Email is registered' : 'Email not found. Please sign up.'
      });
      setIsCheckingEmail(false);
      return exists;
    } catch (error) {
      console.error('Error verifying email:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Verify if email exists
    const emailExists = await verifyEmail(email.trim());
    if (!emailExists) {
      setError('Email not registered. Please check your email or sign up.');
      setIsLoading(false);
      return;
    }

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

      // Clear all existing tokens first
      removeAuthToken('all');

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
                  {/* {loginType === 'admin' && (
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
                  )} */}
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
                      onChange={(e) => {
                        const newEmail = e.target.value;
                        setEmail(newEmail);
                        debounce(() => verifyEmail(newEmail), 500)();
                      }}
                      className="appearance-none block w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-sm sm:text-base"
                      placeholder="Enter your email"
                    />
                    {isCheckingEmail && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Checking email...
                      </p>
                    )}
                    {emailStatus && !isCheckingEmail && (
                      <p className={`mt-1 text-sm ${emailStatus.exists ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {emailStatus.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-sm sm:text-base pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
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

                <div className="flex justify-between items-center text-sm">
                  <div>
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
                  <button
                    type="button"
                    onClick={() => setShowUserHelp(true)}
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                  >
                    <FaQuestionCircle className="h-4 w-4 mr-1" />
                    <span>Help</span>
                  </button>
                </div>

                {/* User Help Dialog */}
                {showUserHelp && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available Accounts</h3>
                        <button
                          onClick={() => setShowUserHelp(false)}
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-4">
                        {/* Admin Section */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Admin Accounts</h4>
                          <div className="space-y-2">
                            {availableAccounts
                              .filter(account => account.role === 'admin')
                              .slice(0, 3)
                              .map((account, index) => (
                                <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                                  <div className="text-gray-900 dark:text-white truncate">{account.email}</div>
                                  <div className="text-gray-500 dark:text-gray-400 font-mono mt-1">
                                    Password: {account.password}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                        {/* Customer Section */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Customer Accounts</h4>
                          <div className="space-y-2">
                            {availableAccounts
                              .filter(account => account.role === 'customer')
                              .slice(0, 3)
                              .map((account, index) => (
                                <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                                  <div className="text-gray-900 dark:text-white truncate">{account.email}</div>
                                  <div className="text-gray-500 dark:text-gray-400 font-mono mt-1">
                                    Password: {account.password}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setShowUserHelp(false)}
                          className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
