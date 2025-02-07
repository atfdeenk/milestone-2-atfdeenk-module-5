import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface RatingProps {
  rating: number;
  reviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showReviews?: boolean;
}

const Rating: React.FC<RatingProps> = ({ 
  rating, 
  reviews, 
  size = 'md',
  showReviews = true 
}) => {
  const starSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar 
          key={`full-${i}`} 
          className={`${starSize} text-yellow-400`} 
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt 
          key="half" 
          className={`${starSize} text-yellow-400`} 
        />
      );
    }

    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar 
          key={`empty-${i}`} 
          className={`${starSize} text-yellow-400`} 
        />
      );
    }

    return stars;
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {renderStars()}
      </div>
      {showReviews && reviews !== undefined && (
        <span className={`${textSize} text-gray-600 dark:text-gray-400 ml-1`}>
          ({reviews})
        </span>
      )}
    </div>
  );
};

export default Rating;
