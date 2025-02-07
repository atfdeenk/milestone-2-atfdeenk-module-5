import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Product } from '../types';
import Rating from './Rating';
import { generateRandomRating } from '../utils/rating';

interface ProductCardProps {
  product: Product;
  onFavoriteToggle?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onFavoriteToggle }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [productRating] = useState(generateRandomRating());

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setIsLoggedIn(true);
      const favoritesData = localStorage.getItem(`favorites_${email}`);
      if (favoritesData) {
        const favorites = JSON.parse(favoritesData);
        setIsFavorite(favorites.some((fav: Product) => fav.id === product.id));
      }
    }
  }, [product.id]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onFavoriteToggle) {
      onFavoriteToggle(product);
      setIsFavorite(!isFavorite);
    }
  };

  const fallbackImage = 'https://i.imgur.com/QkIa5tT.jpeg';
  let imageUrl = fallbackImage;
  
  const extractUrl = (urlString: string): string => {
    try {
      // Remove escaped quotes and parse
      const cleaned = urlString.replace(/\\"|"/g, '');
      return cleaned.startsWith('http') ? cleaned : fallbackImage;
    } catch {
      return fallbackImage;
    }
  };

  if (!imageError && product.images && product.images.length > 0) {
    try {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        if (firstImage.startsWith('[')) {
          // Handle array format: ["https://example.com/image.jpg"]
          const urlMatch = firstImage.match(/\["(.+?)"\]/); 
          if (urlMatch && urlMatch[1]) {
            imageUrl = extractUrl(urlMatch[1]);
          }
        } else if (firstImage.startsWith('http')) {
          // Direct URL
          imageUrl = firstImage;
        }
      }
    } catch (error) {
      console.error('Error parsing image URL:', error);
    }
  }

  return (
    <Link 
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-in-out"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isLoggedIn && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
          >
            {isFavorite ? (
              <FaHeart className="h-4 w-4 text-red-500" />
            ) : (
              <FaRegHeart className="h-4 w-4 text-gray-600 hover:text-red-500" />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <Rating rating={productRating.rating} reviews={productRating.reviews} size="sm" />
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
              {product.category.name}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className='flex flex-row items-center space-x-2'>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${product.price.toLocaleString()}
              </p>
              {product.price > 50 && (
                <p className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded-full font-medium">
                  Free Shipping
                </p>
              )}
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
