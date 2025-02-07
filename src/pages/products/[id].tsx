import type { GetServerSideProps, NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '../../types';
import Notification from '../../components/Notification';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface ProductDetailProps {
  initialProduct: Product | null;
  relatedProducts?: Product[];
  error?: string | null;
}

const ProductDetail: NextPage<ProductDetailProps> = ({ initialProduct, relatedProducts = [], error: serverError }) => {
  const router = useRouter();
  const { id } = router.query;
  
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [selectedImage, setSelectedImage] = useState<string>('https://i.imgur.com/QkIa5tT.jpeg');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState(serverError || '');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [success, setSuccess] = useState('');
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);

    if (email) {
      const favoritesData = localStorage.getItem(`favorites_${email}`);
      if (favoritesData) {
        setFavorites(JSON.parse(favoritesData));
      }
    }
  }, []);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userEmail || !product) return;

    const isFavorite = favorites.some(fav => fav.id === product.id);
    let updatedFavorites;

    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav.id !== product.id);
      setNotificationMessage('Removed from favorites');
    } else {
      updatedFavorites = [...favorites, product];
      setNotificationMessage('Added to favorites');
    }

    setFavorites(updatedFavorites);
    localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(updatedFavorites));
    setNotificationType('success');
    setShowNotification(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const adminToken = localStorage.getItem('adminToken');
      setIsLoggedIn(token !== null || adminToken !== null);
    }
  }, []);

  const parseImageUrl = (rawUrl: string): string => {
    console.log('Parsing image URL:', rawUrl);
    try {
      // Try to parse as JSON first
      let parsed = rawUrl;
      while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
        console.log('Attempting to parse:', parsed);
        parsed = JSON.parse(parsed);
      }
      
      // If we got an array, take the first item
      if (Array.isArray(parsed)) {
        parsed = parsed[0];
      }
      
      // Clean up the URL
      const cleanUrl = String(parsed).replace(/[\[\]"]/g, '').trim();
      console.log('Cleaned URL:', cleanUrl);
      
      // Validate URL
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        throw new Error('Invalid URL protocol');
      }
      
      // Check for unreliable image sources and replace with reliable fallbacks
      const unreliableSources = ['placeimg.com', 'pravatar.cc', 'example.com'];
      if (unreliableSources.some(source => cleanUrl.includes(source))) {
        console.log('Found unreliable image source, using fallback');
        return 'https://picsum.photos/400/300';
      }

      // Validate the hostname is in our allowed list
      const allowedHosts = [
        'i.imgur.com',
      'api.escuelajs.co',
      'picsum.photos',
      'images.unsplash.com',
      'via.placeholder.com',
      'fastly.picsum.photos',
      'loremflickr.com',
      'cloudflare-ipfs.com',
      'raw.githubusercontent.com',
      'avatars.githubusercontent.com',
      'robohash.org',
      'carshow.id',
      'storage.googleapis.com',
      'storage.cloud.google.com',
      'api.escuelajs.co',
      'img.lazcdn.com',
      'i5.walmartimages.com',
      'www.thekooples.com',
      'cdn.shopify.com',
      'i.pravatar.cc',
      'pravatar.cc',
      'sdcdn.io',
      'gravatar.com',
      'image1.jpg',
      'placeimg.com',
      'api.lorem.space',
      'bmw.scene7.com',
      'images.tokopedia.net',
      'lavanilla.id',
      'sosialita.id',
      ];
      
      const url = new URL(cleanUrl);
      if (!allowedHosts.includes(url.hostname)) {
        console.log('URL hostname not in allowed list:', url.hostname);
        return 'https://i.imgur.com/QkIa5tT.jpeg';
      }
      
      return cleanUrl;
    } catch (err) {
      console.error('Error parsing image URL:', err);
      return 'https://i.imgur.com/QkIa5tT.jpeg';
    }
  };

  useEffect(() => {
    if (initialProduct?.images) {
      try {
        let imageUrl: string;
        if (Array.isArray(initialProduct.images) && initialProduct.images.length > 0) {
          console.log('Initial product images:', initialProduct.images);
          imageUrl = parseImageUrl(initialProduct.images[0]);
        } else if (typeof initialProduct.images === 'string') {
          console.log('Initial product images string:', initialProduct.images);
          imageUrl = parseImageUrl(initialProduct.images);
        } else {
          throw new Error('Invalid image format');
        }
        
        setSelectedImage(imageUrl);
        setImageError(false);
      } catch (err) {
        console.error('Error processing initial product image:', err);
        setSelectedImage('https://i.imgur.com/QkIa5tT.jpeg');
        setImageError(false);
      }
    }
  }, [initialProduct]);

  useEffect(() => {
    if (!router.isReady || initialProduct) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(''); // Clear any previous errors
        
        const response = await fetch(`https://api.escuelajs.co/api/v1/products/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found');
            return;
          }
          throw new Error('Failed to load product');
        }
        
        const data = await response.json();
        if (!data || !data.id) {
          throw new Error('Invalid product data received');
        }

        console.log('Fetched product data:', data);
        setProduct(data);
        
        if (Array.isArray(data.images) && data.images.length > 0) {
          try {
            console.log('Processing fetched product images:', data.images);
            const imageUrl = parseImageUrl(data.images[0]);
            setSelectedImage(imageUrl);
            setImageError(false);
          } catch (err) {
            console.error('Error processing fetched product image:', err);
            setSelectedImage('https://i.imgur.com/QkIa5tT.jpeg');
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have initialProduct
    if (!initialProduct && id) {
      fetchProduct();
    }
  }, [id, router.isReady, initialProduct]);

  const addToCart = () => {
    try {
      setIsAddingToCart(true);
      
      if (!product) {
        throw new Error('Product not found');
      }

      let currentCart = [];
      const userEmail = localStorage.getItem('userEmail');
      const isAdmin = localStorage.getItem('adminToken') !== null;
      const cartKey = isAdmin ? 'cart' : (userEmail ? `cart_${userEmail}` : 'cart');
      
      try {
        const savedCart = localStorage.getItem(cartKey);
        currentCart = savedCart ? JSON.parse(savedCart) : [];
      } catch (err) {
        console.error('Error parsing cart:', err);
      }

      const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);

      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        currentCart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          images: product.images,
          quantity: quantity
        });
      }

      localStorage.setItem(cartKey, JSON.stringify(currentCart));
      if (!isAdmin && userEmail) {
        localStorage.setItem('cart', JSON.stringify(currentCart)); // Sync with general cart only for regular users
      }

      // Dispatch events to notify other components
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('cartUpdated'));

      setNotificationType('success');
      setNotificationMessage(`${product.title} added to cart`);
      setShowNotification(true);
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      setNotificationType('error');
      setNotificationMessage('Failed to add item to cart');
      setShowNotification(true);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setShowCheckoutConfirm(true);
  };

  const handleConfirmBuyNow = () => {
    setIsBuyingNow(true);
    try {
      if (!product) return;

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const orderDate = new Date().toLocaleString();

      const receiptData = {
        items: [{
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: quantity
        }],
        totalPrice: product.price * quantity,
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

      // Navigate to receipt page
      router.push('/receipt');
    } catch (err) {
      console.error('Error processing order:', err);
      setError('Error processing order');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsBuyingNow(false);
      setShowCheckoutConfirm(false);
    }
  };

  const handleCheckout = () => {
    setIsBuyingNow(true);
    
    try {
      if (!product) return;
      
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) throw new Error('User email not found');
      
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const orderDate = new Date().toLocaleString();

      const receiptData = {
        items: [{
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: quantity
        }],
        totalPrice: product.price * quantity,
        orderDate,
        orderNumber
      };
      
      // Store order in history
      const orderHistoryKey = `orders_${userEmail}`;
      const existingOrders = JSON.parse(localStorage.getItem(orderHistoryKey) || '[]');
      existingOrders.push(receiptData);
      localStorage.setItem(orderHistoryKey, JSON.stringify(existingOrders));
      
      // Store receipt data in localStorage for immediate access
      localStorage.setItem('lastReceipt', JSON.stringify(receiptData));
      
      // Navigate to receipt page
      router.push('/receipt');
    } catch (err) {
      setError('Failed to process order');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleBackToProducts = () => {
    setIsNavigating(true);
    router.push('/products');
  };

  if (isLoading || isNavigating) {
    return <LoadingSpinner delay={300} message={isNavigating ? "Loading page..." : "Loading product..."} />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
          <Link href="/products" className="text-blue-500 hover:text-blue-600">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Product not found</h1>
          <Link href="/products" className="text-blue-500 hover:text-blue-600">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {showNotification && (
        <Notification
          message={notificationMessage}
          type={notificationType}
          onClose={() => setShowNotification(false)}
        />
      )}
      <div className="max-w-6xl mx-auto">
        {/* Back button - only visible on mobile */}
        <button
          onClick={handleBackToProducts}
          className="md:hidden mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Products
        </button>

        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-4">
            <div className="relative aspect-square w-full bg-gray-100">
              <div className="relative w-full h-full">
                {selectedImage && !imageError ? (
                  <>
                    <Image
                      src={selectedImage}
                      alt={product?.title || 'Product Image'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                      className="object-cover"
                      priority
                      onError={() => {
                        console.error('Image failed to load:', selectedImage);
                        setImageError(true);
                        setSelectedImage('https://i.imgur.com/QkIa5tT.jpeg');
                      }}
                    />
                    {userEmail && (
                      <button
                        onClick={toggleFavorite}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-colors duration-200"
                      >
                        {favorites.some(fav => fav.id === product.id) ? (
                          <FaHeart className="h-6 w-6 text-red-500" />
                        ) : (
                          <FaRegHeart className="h-6 w-6 text-gray-600 hover:text-red-500" />
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">Image not available</span>
                  </div>
                )}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`relative aspect-square w-full rounded-lg border-2 ${
                      selectedImage === image ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - Image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 200px"
                      className="object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col space-y-6">
            <div className="w-full">
              <nav className="flex mb-4 lg:mb-6 text-sm">
                <Link href="/products" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Products</Link>
                <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {product.category.name}
                </span>
              </nav>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 text-gray-900 dark:text-white">{product.title}</h1>
              
              <div className="prose prose-lg mb-6 lg:mb-8">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 lg:p-8 w-full shadow-sm">
              <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6 mb-6">
                <div>
                  <span className="text-3xl lg:text-4xl font-bold text-blue-500 dark:text-blue-400">${product.price}</span>
                  {product.price > 50 && (
                    <span className="block lg:inline-block mt-2 lg:mt-0 lg:ml-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm px-3 py-1.5 rounded-full font-medium">
                      Free Shipping
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 justify-between w-full">
                  <div className="flex items-center gap-4">
                    <label htmlFor="quantity" className="text-gray-700 dark:text-gray-300 font-medium">
                      Quantity:
                    </label>
                  </div>
                  {userEmail && (
                    <button
                      onClick={toggleFavorite}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg text-red-500 hover:text-red-600 transition-colors duration-200"
                      title={favorites.some(fav => fav.id === product?.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.some(fav => fav.id === product?.id) ? (
                        <FaHeart className="h-6 w-6" />
                      ) : (
                        <FaRegHeart className="h-6 w-6" />
                      )}
                    </button>
                  )}
                  <div className="flex items-center rounded-lg bg-white dark:bg-gray-700">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-blue-500 text-white rounded-l-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max="99"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border-x py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      disabled={quantity >= 99}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {!isLoggedIn ? (
                  <Link
                    href="/login"
                    className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 group text-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        clipRule="evenodd"
                      />
                    </svg>
                    Login to Purchase
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleBuyNow}
                      disabled={isLoading || isBuyingNow || isAddingToCart}
                      className="w-full px-6 py-4 bg-green-500 dark:bg-green-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-green-600 dark:hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                    >
                      {isBuyingNow ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Buy Now
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={addToCart}
                      disabled={isLoading || isAddingToCart || isBuyingNow}
                      className="w-full px-6 py-4 bg-blue-500 dark:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Adding to Cart...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex w-full">
              <button
                onClick={handleBackToProducts}
                className="w-full text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Confirmation Modal */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Confirm Purchase</h3>
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 dark:text-gray-300">You are about to purchase:</p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-800 dark:text-gray-200">
                  <span className="break-words flex-1 mr-4">{product?.title} × {quantity}</span>
                  <span className="font-medium whitespace-nowrap">${(product!.price * quantity).toFixed(2)}</span>
                </div>
                <div className="border-t dark:border-gray-600 pt-2 mt-2 flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-blue-500 dark:text-blue-400">${(product!.price * quantity).toFixed(2)}</span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                By confirming, you agree to proceed with the purchase of this item.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckoutConfirm(false)}
                disabled={isBuyingNow}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBuyNow}
                disabled={isBuyingNow}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                {isBuyingNow ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2.5a1 1 0 001-1V4a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1H9a1 1 0 001-1V4a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001-1h2.5a1 1 0 001 1v2M7 10h5a1 1 0 001-1V7a1 1 0 00-1-1H7a1 1 0 00-1 1v1a3 3 0 01-3 3z" clipRule="evenodd" />
                    </svg>
                    <span>Confirm Purchase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ProductDetailProps> = async ({ params }) => {
  if (!params?.id) {
    return {
      notFound: true
    };
  }

  try {
    const response = await fetch(`https://api.escuelajs.co/api/v1/products/${params.id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          notFound: true
        };
      }
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    
    const product = await response.json();
    
    if (!product || !product.id) {
      return {
        notFound: true
      };
    }

    // Fetch related products from the same category
    const relatedResponse = await fetch(
      `https://api.escuelajs.co/api/v1/products?categoryId=${product.category.id}&offset=0&limit=4`
    );
    
    let relatedProducts = [];
    if (relatedResponse.ok) {
      const relatedData = await relatedResponse.json();
      relatedProducts = relatedData.filter((p: Product) => p.id !== Number(params.id));
    }

    return {
      props: {
        initialProduct: product,
        relatedProducts,
        error: null
      }
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      props: {
        initialProduct: null,
        relatedProducts: [],
        error: 'Failed to load product details. Please try again.'
      }
    };
  }
};

export default ProductDetail;
