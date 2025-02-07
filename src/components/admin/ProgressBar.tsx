import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
  operation: string;
}

export default function ProgressBar({ progress, total, operation }: ProgressBarProps) {
  const percentage = total <= 0 ? 0 : Math.min(100, Math.round((Math.max(0, progress) / total) * 100));

  return (
    <div className="fixed bottom-4 right-20 z-50 w-80">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="relative">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {percentage === 100 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{operation}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Processing {progress} of {total} items
                  </p>
                </div>
              </div>
              <div className="ml-3 flex-shrink-0">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{percentage}%</span>
              </div>
            </div>
          <div className="mt-3">
            <div className="relative w-full h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out transform origin-left"
                style={{
                  width: `${percentage}%`,
                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)'
                }}
              >
                {percentage > 0 && percentage < 100 && (
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
