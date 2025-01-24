import { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const Notification = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300); // Duration of fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const baseClasses = "fixed z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 flex items-center top-auto right-4";
  const positionClasses = "top-14 right-4";
  const typeClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white"
  };
  const animationClasses = isExiting 
    ? "opacity-0 translate-y-[-10px]" 
    : "opacity-100 translate-y-0";

  return (
    <div className={`${baseClasses} ${positionClasses} ${typeClasses[type]} ${animationClasses}`}>
      <span className="text-sm font-medium">{message}</span>
      <button 
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
          }, 300);
        }}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
