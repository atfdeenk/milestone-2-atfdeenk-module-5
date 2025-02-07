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
  const { tab } = router.query;
  const [activeTab, setActiveTab] = useState(typeof tab === 'string' ? tab : 'account');
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Sync tab state with URL query
  useEffect(() => {
    if (tab && typeof tab === 'string' && ['account', 'orders', 'favorites'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    
    // Check if either user or admin is logged in
    if (!token && !adminToken) {
      router.push('/login');
      return;
    }

    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      loadUserData(email);
    } else if (adminToken) {
      // If admin is logged in but no email is set, try to get admin profile
      fetchAdminProfile(adminToken);
    }

    // Load user-specific settings
    if (email) {
      const userSettingsKey = `userSettings_${email}`;
      const savedSettings = localStorage.getItem(userSettingsKey);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setDarkMode(settings.darkMode ?? false);
        setEmailNotifications(settings.emailNotifications ?? true);
      } else {
        // Default settings for new users
        const defaultSettings = {
          darkMode: false,
          emailNotifications: true
        };
        localStorage.setItem(userSettingsKey, JSON.stringify(defaultSettings));
        setDarkMode(false);
        setEmailNotifications(true);
      }
    }
  }, [router]);

  const fetchAdminProfile = async (adminToken: string) => {
    try {
      const response = await fetch('https://api.escuelajs.co/api/v1/auth/profile', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserEmail(userData.email);
        localStorage.setItem('userEmail', userData.email);
        loadUserData(userData.email);
      }
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
    }
  };

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

    // Save user-specific settings
    if (userEmail) {
      const userSettingsKey = `userSettings_${userEmail}`;
      const currentSettings = localStorage.getItem(userSettingsKey);
      const settings = currentSettings ? JSON.parse(currentSettings) : {};
      settings.darkMode = newDarkMode;
      localStorage.setItem(userSettingsKey, JSON.stringify(settings));
    }

    // Update document class for dark mode
    document.documentElement.classList.toggle('dark');
  };

  const handleEmailNotificationsToggle = () => {
    const newEmailNotifications = !emailNotifications;
    setEmailNotifications(newEmailNotifications);

    // Save user-specific settings
    const userSettingsKey = `userSettings_${userEmail}`;
    const currentSettings = localStorage.getItem(userSettingsKey);
    const settings = currentSettings ? JSON.parse(currentSettings) : {};
    settings.emailNotifications = newEmailNotifications;
    localStorage.setItem(userSettingsKey, JSON.stringify(settings));
  };

  const handlePrintReceipt = (order: OrderHistoryItem) => {
    // Create a new window for the receipt
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items th, .items td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .total { text-align: right; font-weight: bold; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ShopSmart</h1>
          <p>Order Receipt</p>
        </div>
        <div class="order-info">
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${order.orderDate}</p>
          <p><strong>Customer:</strong> ${userEmail}</p>
        </div>
        <table class="items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Total: $${order.totalPrice.toFixed(2)}</p>
        </div>
        <button onclick="window.print()" style="padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
          Print Receipt
        </button>
      </body>
      </html>
    `;

    // Write the receipt HTML to the new window
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
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
                onClick={() => {
                  setActiveTab('account');
                  router.push('/profile?tab=account', undefined, { shallow: true });
                }}
                className={getTabButtonClass(activeTab === 'account')}
              >
                Account
              </button>
              <button
                onClick={() => {
                  setActiveTab('orders');
                  router.push('/profile?tab=orders', undefined, { shallow: true });
                }}
                className={getTabButtonClass(activeTab === 'orders')}
              >
                Order History
              </button>
              <button
                onClick={() => {
                  setActiveTab('favorites');
                  router.push('/profile?tab=favorites', undefined, { shallow: true });
                }}
                className={getTabButtonClass(activeTab === 'favorites')}
              >
                Favorites
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode appearance</p>
                  </div>
                  <button
                    onClick={handleDarkModeToggle}
                    className={getToggleButtonClass(darkMode)}
                  >
                    <span className={getToggleKnobClass(darkMode)} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive order updates and promotions</p>
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
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-medium text-gray-900 dark:text-white">
                            ${order.totalPrice.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handlePrintReceipt(order)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Print</span>
                          </button>
                        </div>
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
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
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
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product);
                            }}
                            className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                            title="Add to Cart"
                          >
                            <FaShoppingCart className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveFavorite(product.id);
                            }}
                            className="text-red-500 hover:text-red-600 transition-colors duration-200"
                            title="Remove from Favorites"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </Link>
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
