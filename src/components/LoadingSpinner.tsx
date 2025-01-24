import { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  delay?: number; // Delay in milliseconds before showing the spinner
  message?: string; // Optional custom loading message
}

const LoadingSpinner = ({ delay = 400, message = 'Loading products...' }: LoadingSpinnerProps) => {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!showSpinner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
        <div className="absolute left-2/4 top-1/4 -translate-x-2/4 -translate-y-1/4 mt-4 text-center text-gray-600 dark:text-gray-300 font-medium">
          {message}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
