import React, { useState, useEffect } from 'react';

interface LoadingAnimationProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingAnimation({ text = "LOADING", size = 'md' }: LoadingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % text.length);
    }, 150);

    return () => clearInterval(interval);
  }, [text.length]);

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-8">
        {/* Animated Letters */}
        <div className="flex items-center gap-2">
          {text.split('').map((letter, index) => (
            <div
              key={index}
              className={`
                ${sizeClasses[size]} font-bold transition-all duration-300 transform
                ${index === currentIndex 
                  ? 'text-blue-400 scale-125 animate-pulse' 
                  : 'text-gray-400 scale-100'
                }
                ${isVisible ? 'opacity-100' : 'opacity-0'}
              `}
              style={{
                animationDelay: `${index * 100}ms`,
                transform: index === currentIndex ? 'translateY(-10px)' : 'translateY(0)'
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Spinning Dots */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
        </div>

        {/* Loading Text */}
        <div className="text-gray-400 text-lg animate-pulse">
          Please wait while we prepare your dashboard...
        </div>
      </div>
    </div>
  );
} 