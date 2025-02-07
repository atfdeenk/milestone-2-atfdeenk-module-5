import { useState, useEffect } from 'react';
import DiscountCode from '../components/DiscountCode';
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
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const isLoggedIn = typeof window !== 'undefined' ? 
    (localStorage.getItem('token') !== null || localStorage.getItem('adminToken') !== null) : false;

  useEffect(() => {
    setIsNavigating(false);
  }, [router.asPath]);

  useEffect(() => {
    const loadCart = () => {
      try {
        if (typeof window === 'undefined') return;
        
        // First try user-specific cart
        const userEmail = localStorage.getItem('userEmail');
        const isAdmin = localStorage.getItem('adminToken') !== null;
        let cartData = null;
        
        if (userEmail && !isAdmin) {
          cartData = localStorage.getItem(`cart_${userEmail}`);
        }
        
        // For admin users or as fallback, use the general cart
        if (!cartData || isAdmin) {
          cartData = localStorage.getItem('cart');
        }

        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          console.log('Cart data:', JSON.stringify(parsedCart, null, 2));
          if (parsedCart.length > 0) {
            console.log('First item images:', parsedCart[0].images);
            console.log('First item images type:', typeof parsedCart[0].images);
            if (Array.isArray(parsedCart[0].images)) {
              console.log('First image in array:', parsedCart[0].images[0]);
              console.log('First image type:', typeof parsedCart[0].images[0]);
            }
          }
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
      const adminToken = localStorage.getItem('adminToken');
      if (!token && !adminToken) {
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
      // Ensure all items have a selected property
      const cartWithSelection = newCart.map(item => ({
        ...item,
        selected: item.selected !== undefined ? item.selected : false
      }));

      setCart(cartWithSelection);
      
      const userEmail = localStorage.getItem('userEmail');
      const isAdmin = localStorage.getItem('adminToken') !== null;

      // For admin users, always use the general cart
      if (userEmail && !isAdmin) {
        localStorage.setItem(`cart_${userEmail}`, JSON.stringify(cartWithSelection));
      }
      // Always update the general cart for admins or as backup
      localStorage.setItem('cart', JSON.stringify(cartWithSelection));
      
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
      const selectedItems = cart.filter(item => item.selected);
      const unselectedItems = cart.filter(item => !item.selected);
      
      if (selectedItems.length === 0) {
        setNotificationType('error');
        setNotificationMessage('Please select at least one item to checkout');
        setShowNotification(true);
        setLoading(false);
        return;
      }

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const orderDate = new Date().toLocaleString();

      const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discountAmount = (subtotal * discountPercentage) / 100;
      const totalPrice = subtotal - discountAmount;

      const receiptData = {
        items: selectedItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal,
        discountPercentage,
        discountAmount,
        totalPrice,
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

      // Only remove selected items from cart, keep unselected items
      updateCart(unselectedItems);
      setShowCheckoutConfirm(false);

      // Show success message
      setNotificationType('success');
      setNotificationMessage(`Successfully checked out ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''}`);
      setShowNotification(true);

      // Navigate to receipt page
      handleNavigateToReceipt();
    } catch (error) {
      console.error('Error processing checkout:', error);
      setNotificationType('error');
      setNotificationMessage('Error processing checkout');
      setShowNotification(true);
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Main Cart Content */}
        <div className="flex-grow w-full md:w-2/3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">({cart.length} items)</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cart.length > 0 && cart.every(item => item.selected)}
                    onChange={(e) => {
                      const newCart = cart.map(item => ({
                        ...item,
                        selected: e.target.checked
                      }));
                      updateCart(newCart);
                    }}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Select All</span>
                </label>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={loading || cart.length === 0}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Cart
                </button>
              </div>
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
              <p className="text-gray-600 dark:text-gray-400">You are about to purchase {cart.filter(item => item.selected).reduce((sum, item) => sum + item.quantity, 0)} items:</p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                {cart.filter(item => item.selected).map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm text-gray-800 dark:text-gray-200">
                    <span>{item.title} × {item.quantity}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {discountPercentage > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                    <span>Discount ({discountPercentage}%)</span>
                    <span>-${((cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0) * discountPercentage) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                  <span>Total ({cart.filter(item => item.selected).length} items)</span>
                  <span className="text-blue-500 dark:text-blue-400">
                    ${(cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0) * (1 - discountPercentage / 100)).toFixed(2)}
                  </span>
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

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => {
                        const newCart = cart.map(cartItem =>
                          cartItem.id === item.id
                            ? { ...cartItem, selected: e.target.checked }
                            : cartItem
                        );
                        updateCart(newCart);
                      }}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="relative w-24 h-24 flex-shrink-0">
                      {/* Image container */}
                      {(() => {
                        let imageUrl = 'https://i.imgur.com/QkIa5tT.jpeg';
                        if (Array.isArray(item.images) && item.images.length > 0) {
                          const firstImage = item.images[0];
                          try {
                            // If it's a stringified array/object, parse it
                            if (typeof firstImage === 'string' && (firstImage.startsWith('[') || firstImage.startsWith('{'))) {
                              const parsed = JSON.parse(firstImage);
                              imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
                            } else {
                              imageUrl = firstImage;
                            }
                          } catch (e) {
                            console.error('Error parsing image:', e);
                            imageUrl = 'https://i.imgur.com/QkIa5tT.jpeg';
                          }
                        }
                        console.log('Final image URL:', imageUrl);
                        return (
                          <Image
                            src={imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover rounded-lg shadow-sm"
                          />
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex-grow min-w-0 sm:ml-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Unit Price: ${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-12 text-center bg-transparent border-none text-gray-900 dark:text-white focus:outline-none focus:ring-0"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={loading || item.quantity >= 99}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loading}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 disabled:opacity-50"
                          title="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Continue Shopping Button */}
          <div className="md:hidden mt-6">
            <button
              onClick={handleContinueShopping}
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Continue Shopping
            </button>
          </div>

          {/* Mobile Order Summary */}
          <div className="md:hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Selected Items ({cart.filter(item => item.selected).length})</span>
                <span>${cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>-${((cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0) * discountPercentage) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${(cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0) * (1 - discountPercentage / 100)).toFixed(2)}</span>
                </div>
              </div>
              <DiscountCode onApplyDiscount={setDiscountPercentage} />
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={handleCheckout}
                disabled={loading || cart.filter(item => item.selected).length === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Proceed to Checkout
              </button>
              <button
                onClick={handleContinueShopping}
                disabled={loading}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Order Summary */}
        <div className="hidden md:block w-1/3 sticky top-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Selected Items ({cart.filter(item => item.selected).length})</span>
                  <span>${cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-3 pt-3 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    ${cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>
                
                {discountPercentage > 0 && (
                  <div className="flex justify-between items-baseline text-green-600 dark:text-green-400">
                    <span>Discount ({discountPercentage}%)</span>
                    <span>-${((cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0) * discountPercentage) / 100).toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <div className="text-right">
                      {discountPercentage > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ${cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                        </div>
                      )}
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${(cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0) * (1 - discountPercentage / 100)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Free shipping on all orders</p>
              <DiscountCode onApplyDiscount={setDiscountPercentage} />
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={handleCheckout}
                disabled={loading || cart.filter(item => item.selected).length === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Proceed to Checkout
              </button>
              <button
                onClick={handleContinueShopping}
                disabled={loading}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
