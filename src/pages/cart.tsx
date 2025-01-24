import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem } from '../types';
import { getAuthToken } from '../utils/auth';
import Notification from '../components/Notification';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');
  const [isNavigating, setIsNavigating] = useState(false);
  const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('token') !== null : false;

  useEffect(() => {
    setIsNavigating(false);
  }, [router.asPath]);

  useEffect(() => {
    const loadCart = () => {
      try {
        if (typeof window === 'undefined') return;
        
        // First try user-specific cart
        const userEmail = localStorage.getItem('userEmail');
        let cartData = null;
        
        if (userEmail) {
          cartData = localStorage.getItem(`cart_${userEmail}`);
        }
        
        // Fallback to general cart
        if (!cartData) {
          cartData = localStorage.getItem('cart');
        }

        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };

    loadCart();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' || e.key?.startsWith('cart_')) {
        loadCart();
      }
    };

    // Listen for custom cart update event
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
      }
    };

    checkAuth();
    
    // Check auth status when storage changes
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  const updateCart = (newCart: CartItem[]) => {
    try {
      setCart(newCart);
      
      // Always update both storage locations
      localStorage.setItem('cart', JSON.stringify(newCart));
      
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        localStorage.setItem(`cart_${userEmail}`, JSON.stringify(newCart));
      }
      
      // Notify other components
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleRemoveItem = (productId: number) => {
    const newCart = cart.filter(item => item.id !== productId);
    updateCart(newCart);
  };

  const clearCart = () => {
    setLoading(true);
    updateCart([]);
    setShowClearConfirm(false);
    
    setNotificationType('success');
    setNotificationMessage('Cart cleared successfully');
    setShowNotification(true);
    
    setLoading(false);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setNotificationType('error');
      setNotificationMessage('Please login to checkout');
      setShowNotification(true);
      return;
    }

    setShowCheckoutConfirm(true);
  };

  const handleContinueShopping = async () => {
    setIsNavigating(true);
    await router.push('/products');
  };

  const handleNavigateToReceipt = async () => {
    setIsNavigating(true);
    await router.push('/receipt');
  };

  const processCheckout = () => {
    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const orderDate = new Date().toLocaleString();

      const receiptData = {
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        orderDate,
        orderNumber
      };

      // Store order in history if user is logged in
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        const orderHistoryKey = `orders_${userEmail}`;
        const existingOrders = JSON.parse(localStorage.getItem(orderHistoryKey) || '[]');
        existingOrders.push(receiptData);
        localStorage.setItem(orderHistoryKey, JSON.stringify(existingOrders));
      }

      // Store receipt data in localStorage for immediate access
      localStorage.setItem('lastReceipt', JSON.stringify(receiptData));

      // Store cart data temporarily for clearing after navigation
      localStorage.setItem('pendingClearCart', 'true');

      // Navigate to receipt page
      handleNavigateToReceipt();
      
      // Clear the cart after navigation
      updateCart([]);
      setShowCheckoutConfirm(false);
      localStorage.removeItem('pendingClearCart');
    } catch (error) {
      console.error('Error processing checkout:', error);
      setNotificationType('error');
      setNotificationMessage('Error processing checkout');
      setShowNotification(true);
      localStorage.removeItem('pendingClearCart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > 99) return;
    
    setLoading(true);
    const newCart = cart.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    updateCart(newCart);
    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Cart is Empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Start shopping to add items to your cart!</p>
          <Link
            href="/products"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {showNotification && (
        <Notification
          message={notificationMessage}
          type={notificationType}
          onClose={() => setShowNotification(false)}
        />
      )}
      {(loading || isNavigating) && (
        <LoadingSpinner 
          delay={300} 
          message={isNavigating ? "Loading page..." : "Processing..."} 
        />
      )}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
        <button
          onClick={() => setShowClearConfirm(true)}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
        >
          Clear Cart
        </button>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Clear Cart?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={clearCart}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Confirm Purchase</h3>
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400">You are about to purchase {cart.reduce((sum, item) => sum + item.quantity, 0)} items:</p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm text-gray-800 dark:text-gray-200">
                    <span>{item.title} × {item.quantity}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-blue-500 dark:text-blue-400">${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                By confirming, you agree to proceed with the purchase of these items.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={processCheckout}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Confirm Purchase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <img
              src={(item.images && Array.isArray(item.images) && item.images.length > 0) ? item.images[0] : 'https://i.imgur.com/QkIa5tT.jpeg'}
              alt={item.title}
              className="w-24 h-24 object-cover rounded"
            />
            
            <div className="flex-grow">
              <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">{item.title}</h3>
              <div className="text-blue-600 dark:text-blue-400 font-medium">${item.price.toFixed(2)} each</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={loading || item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                className="w-16 text-center border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={loading || item.quantity >= 99}
                className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                +
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                disabled={loading}
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center text-xl font-semibold mb-6">
          <span className="text-gray-800 dark:text-gray-200">Total:</span>
          <span className="text-gray-900 dark:text-white">${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/products"
            onClick={(e) => {
              e.preventDefault();
              handleContinueShopping();
            }}
            className="flex-1 px-6 py-3 text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoggedIn ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Proceed to Checkout</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Login to Checkout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
