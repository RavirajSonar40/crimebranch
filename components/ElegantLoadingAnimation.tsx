import React, { useState, useEffect } from 'react';

interface ElegantLoadingAnimationProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ElegantLoadingAnimation({ 
  text = "Loading", 
  size = 'md'
}: ElegantLoadingAnimationProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 5;
      });
    }, 400);

    return () => clearInterval(progressInterval);
  }, []);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-8">
        {/* Simple Text */}
        <div className={`${sizeClasses[size]} font-light text-gray-300 tracking-wide`}>
          {text}
        </div>

        {/* Elegant Spinner */}
        <div className="relative">
          <div className="w-8 h-8 border border-gray-600 rounded-full"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border border-gray-300 rounded-full animate-spin border-t-transparent"></div>
        </div>

        {/* Minimal Progress */}
        <div className="w-48 h-px bg-gray-700">
          <div 
            className="h-full bg-gray-300 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress Text */}
        <div className="text-gray-500 text-sm font-light">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
} 