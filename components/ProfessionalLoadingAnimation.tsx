import React, { useState, useEffect } from 'react';

interface ProfessionalLoadingAnimationProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export default function ProfessionalLoadingAnimation({ 
  text = "LOADING", 
  size = 'md',
  color = 'blue'
}: ProfessionalLoadingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Letter animation
    const letterInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % text.length);
    }, 200);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 8;
      });
    }, 300);

    return () => {
      clearInterval(letterInterval);
      clearInterval(progressInterval);
    };
  }, [text.length]);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    red: 'text-red-500'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Letters */}
        <div className="flex items-center gap-1">
          {text.split('').map((letter, index) => (
            <div
              key={index}
              className={`
                ${sizeClasses[size]} font-semibold transition-all duration-300
                ${index === currentIndex 
                  ? `${colorClasses[color]} opacity-100` 
                  : 'text-gray-400 opacity-60'
                }
              `}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Simple Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-2 border-gray-600 rounded-full"></div>
          <div className={`absolute top-0 left-0 w-12 h-12 border-2 ${colorClasses[color]} rounded-full animate-spin border-t-transparent`}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClasses[color]} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress Text */}
        <div className="text-gray-400 text-sm font-medium">
          {Math.round(progress)}% Complete
        </div>

        {/* Loading Message */}
        <div className="text-gray-500 text-center">
          <div className="text-sm">
            Preparing your dashboard...
          </div>
        </div>
      </div>
    </div>
  );
} 