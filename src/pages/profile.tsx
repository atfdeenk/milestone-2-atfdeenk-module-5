import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../components/LoadingSpinner';
import Link from 'next/link';
import Image from 'next/image';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { CartItem } from '../types';

interface OrderHistoryItem {
  orderNumber: string;
  orderDate: string;
  totalPrice: number;
  items: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
}

interface FavoriteProduct {
  id: number;
  title: string;
  price: number;
  images: string[];
}

const getTabButtonClass = (isActive: boolean) => {
  return `px-6 py-3 text-sm font-medium ${isActive
    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
  }`;
};

const getToggleButtonClass = (isActive: boolean) => {
  return `relative inline-flex items-center h-6 rounded-full w-11 ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`;
};

const getToggleKnobClass = (isActive: boolean) => {
  return `inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${isActive ? 'translate-x-6' : 'translate-x-1'}`;
};

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders');
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      loadUserData(email);
    }

    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);

    const notifications = localStorage.getItem('emailNotifications') !== 'false';
    setEmailNotifications(notifications);
  }, [router]);

  const loadUserData = (email: string) => {
    // Load order history from receipts
    const orderHistoryKey = `orderHistory_${email}`;
    let orderHistory = [];
    try {
      const savedHistory = localStorage.getItem(orderHistoryKey);
      if (savedHistory) {
        orderHistory = JSON.parse(savedHistory);
      }
      setOrderHistory(orderHistory);
    } catch (error) {
      console.error('Error loading order history:', error);
    }

    // Load favorites
    const favoritesKey = `favorites_${email}`;
    let favorites = [];
    try {
      const savedFavorites = localStorage.getItem(favoritesKey);
      if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
      }
      setFavorites(favorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }

    setIsLoading(false);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    document.documentElement.classList.toggle('dark');
  };

  const handleEmailNotificationsToggle = () => {
    const newEmailNotifications = !emailNotifications;
    setEmailNotifications(newEmailNotifications);
    localStorage.setItem('emailNotifications', String(newEmailNotifications));
  };

  const handleRemoveFavorite = (productId: number) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== productId);
    setFavorites(updatedFavorites);
    localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(updatedFavorites));
  };

  const handleAddToCart = (product: FavoriteProduct) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    const cartKey = `cart_${userEmail}`;
    let cart = [];
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }

    const existingItem = cart.find((item: CartItem) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="p-6 bg-blue-600 text-white">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="mt-2">{userEmail}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('orders')}
                className={getTabButtonClass(activeTab === 'orders')}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={getTabButtonClass(activeTab === 'favorites')}
              >
                Favorites
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={getTabButtonClass(activeTab === 'settings')}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Order History */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {orderHistory.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No orders yet. Start shopping!
                  </p>
                ) : (
                  orderHistory.map((order) => (
                    <div
                      key={order.orderNumber}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.orderDate}
                          </p>
                        </div>
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          ${order.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm text-gray-600 dark:text-gray-300"
                          >
                            <span>{item.title} × {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Favorites */}
            {activeTab === 'favorites' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8 col-span-full">
                    No favorite products yet. Start adding some!
                  </p>
                ) : (
                  favorites.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="relative w-full h-48 mb-4">
                        {(() => {
                          let imageUrl = 'https://i.imgur.com/QkIa5tT.jpeg';
                          try {
                            // If images is a string array
                            if (Array.isArray(product.images) && product.images.length > 0) {
                              const firstImage = product.images[0];
                              // If the first image is a stringified array/object
                              if (typeof firstImage === 'string' && firstImage.startsWith('[')) {
                                const parsed = JSON.parse(firstImage);
                                imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
                              } else {
                                imageUrl = firstImage;
                              }
                            }
                          } catch (e) {
                            console.error('Error parsing image:', e);
                          }
                          return (
                            <Image
                              src={imageUrl}
                              alt={product.title}
                              fill
                              className="object-cover rounded-lg"
                            />
                          );
                        })()}
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {product.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                            title="Add to Cart"
                          >
                            <FaShoppingCart className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite(product.id)}
                            className="text-red-500 hover:text-red-600 transition-colors duration-200"
                            title="Remove from Favorites"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Toggle dark mode for a better viewing experience at night
                    </p>
                  </div>
                  <button
                    onClick={handleDarkModeToggle}
                    className={getToggleButtonClass(darkMode)}
                  >
                    <span className={getToggleKnobClass(darkMode)} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive email updates about your orders and promotions
                    </p>
                  </div>
                  <button
                    onClick={handleEmailNotificationsToggle}
                    className={getToggleButtonClass(emailNotifications)}
                  >
                    <span className={getToggleKnobClass(emailNotifications)} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
