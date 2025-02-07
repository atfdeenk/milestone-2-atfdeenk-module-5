import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

import { Product } from '../types';

const recommendedProducts: Product[] = [
  {
    id: 108,
    title: "Electronics Pro Kit",
    price: 999,
    description: "Professional electronics kit with advanced components",
    category: {
      id: 1,
      name: "Electronics",
      image: "https://i.imgur.com/ZANVnHE.jpeg"
    },
    images: ["https://i.imgur.com/ZANVnHE.jpeg"],
    createdAt: new Date().toISOString()
  },
  {
    id: 103,
    title: "Modern Furniture Set",
    price: 499,
    description: "Contemporary furniture set for modern homes",
    category: {
      id: 2,
      name: "Furniture",
      image: "https://i.imgur.com/Qphac99.jpeg"
    },
    images: ["https://i.imgur.com/Qphac99.jpeg"],
    createdAt: new Date().toISOString()
  },
  {
    id: 104,
    title: "Casual Sneakers",
    price: 119.99,
    description: "Comfortable casual sneakers for everyday wear",
    category: {
      id: 3,
      name: "Shoes",
      image: "https://i.imgur.com/qNOjJje.jpeg"
    },
    images: ["https://i.imgur.com/qNOjJje.jpeg"],
    createdAt: new Date().toISOString()
  },
  {
    id: 107,
    title: "Premium Collection",
    price: 123,
    description: "Premium clothing collection for fashion enthusiasts",
    category: {
      id: 4,
      name: "Clothes",
      image: "https://i.imgur.com/QkIa5tT.jpeg"
    },
    images: ["https://i.imgur.com/QkIa5tT.jpeg"],
    createdAt: new Date().toISOString()
  }
];

export default function RecommendedProducts() {
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

  const toggleFavorite = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent navigation
    if (!userEmail) return;

    const isFavorite = favorites.some(fav => fav.id === product.id);
    let updatedFavorites;

    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav.id !== product.id);
    } else {
      // Process images before adding to favorites
      const processedProduct = {
        ...product,
        images: Array.isArray(product.images) 
          ? product.images.map(img => {
              try {
                let processedUrl = img;
                let attempts = 0;
                const maxAttempts = 3;

                // Keep trying to parse JSON until we get a clean URL
                while (attempts < maxAttempts && 
                       (processedUrl.includes('\\"') || 
                        processedUrl.trim().startsWith('[') || 
                        processedUrl.trim().startsWith('{') || 
                        processedUrl.trim().startsWith('"'))) {
                  try {
                    const parsed = JSON.parse(processedUrl);
                    if (Array.isArray(parsed)) {
                      processedUrl = parsed[0];
                    } else if (typeof parsed === 'string') {
                      processedUrl = parsed;
                    } else if (parsed && typeof parsed === 'object' && parsed.url) {
                      processedUrl = parsed.url;
                    } else {
                      throw new Error('Invalid JSON format');
                    }
                    attempts++;
                  } catch (jsonError) {
                    processedUrl = processedUrl.replace(/\\"|\\/g, '').replace(/[\[\]"]/g, '').trim();
                    break;
                  }
                }

                // Final cleanup
                processedUrl = processedUrl.replace(/\\"|\\/g, '').replace(/[\[\]"]/g, '').trim();
                
                // Handle URLs that start with // or don't have protocol
                if (processedUrl.startsWith('//')) {
                  processedUrl = 'https:' + processedUrl;
                } else if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
                  processedUrl = 'https://' + processedUrl;
                }

                return processedUrl;
              } catch (error) {
                console.error('Error processing image URL:', error);
                return 'https://i.imgur.com/QkIa5tT.jpeg';
              }
            })
          : ['https://i.imgur.com/QkIa5tT.jpeg']
      };
      updatedFavorites = [...favorites, processedProduct];
    }

    setFavorites(updatedFavorites);
    localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(updatedFavorites));
  };
  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Recommended for You
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Handpicked products based on the latest trends and your interests
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {recommendedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-4 relative">
                {userEmail && (
                  <button
                    onClick={(e) => toggleFavorite(e, product)}
                    className="absolute top-0 right-0 p-2 text-red-500 hover:text-red-600 transition-colors duration-200"
                  >
                    {favorites.some(fav => fav.id === product.id) ? (
                      <FaHeart className="h-6 w-6" />
                    ) : (
                      <FaRegHeart className="h-6 w-6" />
                    )}
                  </button>
                )}
                <h3 className="text-sm text-gray-500 dark:text-gray-400">{product.category.name}</h3>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">{product.title}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    ${product.price}
                  </p>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
