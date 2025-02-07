import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
  operation: string;
}

export default function ProgressBar({ progress, total, operation }: ProgressBarProps) {
  const percentage = Math.round((progress / total) * 100);

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="bg-blue-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-700">
            {operation} Progress: {progress} of {total} ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
