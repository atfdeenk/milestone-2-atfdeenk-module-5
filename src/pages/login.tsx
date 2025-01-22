import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from '../components/Logo';

const Login: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/products');
    }
  }, [router.isReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
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

      localStorage.setItem('token', data.access_token);
      
      // Fetch user data
      const userResponse = await fetch('https://api.escuelajs.co/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await userResponse.json();
      localStorage.setItem('userName', userData.name);
      localStorage.setItem('userEmail', userData.email);
      
      // Save current cart data for this user if any
      const currentCart = localStorage.getItem('cart');
      if (currentCart) {
        localStorage.setItem(`cart_${userData.email}`, currentCart);
      }
      
      // Restore user's cart data
      const userCartKey = `cart_${userData.email}`;
      const savedCart = localStorage.getItem(userCartKey);
      if (savedCart) {
        localStorage.setItem('cart', savedCart);
        window.dispatchEvent(new Event('cartUpdated'));
      }

      // Update profile in navbar
      window.dispatchEvent(new Event('profileUpdated'));

      // Navigate after a short delay
      setTimeout(() => {
        router.push('/products');
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 sm:p-6 md:p-8 flex justify-center">
        <Logo />
      </div>
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Welcome Back!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Sign in to your account to continue shopping
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="space-y-4">
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
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 focus:z-10 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your email"
                    disabled={isLoading}
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
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 focus:z-10 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <div className="mt-4 text-center">
                <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                <Link href="/register" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">
                  Register here
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
