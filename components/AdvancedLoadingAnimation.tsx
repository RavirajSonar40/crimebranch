import React, { useState, useEffect } from 'react';

interface AdvancedLoadingAnimationProps {
  text?: string;
  style?: 'typewriter' | 'wave' | 'pulse' | 'slide';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export default function AdvancedLoadingAnimation({ 
  text = "LOADING", 
  style = 'wave',
  size = 'md',
  color = 'blue'
}: AdvancedLoadingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Letter animation interval
    const letterInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % text.length);
    }, 150);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => {
      clearInterval(letterInterval);
      clearInterval(progressInterval);
    };
  }, [text.length]);

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  const colorClasses = {
    blue: 'text-blue-400 bg-blue-400',
    green: 'text-green-400 bg-green-400',
    purple: 'text-purple-400 bg-purple-400',
    orange: 'text-orange-400 bg-orange-400',
    red: 'text-red-400 bg-red-400'
  };

  const renderLetters = () => {
    return text.split('').map((letter, index) => {
      let animationClass = '';
      
      switch (style) {
        case 'typewriter':
          animationClass = index <= currentIndex 
            ? `${colorClasses[color].split(' ')[0]} animate-pulse` 
            : 'text-gray-600';
          break;
        case 'wave':
          const waveDelay = (index - currentIndex + text.length) % text.length;
          animationClass = waveDelay === 0 
            ? `${colorClasses[color].split(' ')[0]} scale-125 animate-bounce` 
            : 'text-gray-400';
          break;
        case 'pulse':
          animationClass = index === currentIndex 
            ? `${colorClasses[color].split(' ')[0]} animate-pulse scale-110` 
            : 'text-gray-400';
          break;
        case 'slide':
          animationClass = index === currentIndex 
            ? `${colorClasses[color].split(' ')[0]} animate-pulse transform translate-y-[-8px]` 
            : 'text-gray-400';
          break;
      }

      return (
        <div
          key={index}
          className={`
            ${sizeClasses[size]} font-bold transition-all duration-300 transform
            ${animationClass}
            ${isVisible ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          {letter}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 backdrop-blur-md flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-8">
        {/* Animated Letters */}
        <div className="flex items-center gap-1">
          {renderLetters()}
        </div>

        {/* Animated Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
          <div className={`absolute top-0 left-0 w-16 h-16 border-4 ${colorClasses[color].split(' ')[1]} rounded-full animate-spin border-t-transparent`}></div>
          <div className={`absolute top-0 left-0 w-16 h-16 border-4 ${colorClasses[color].split(' ')[1]} rounded-full animate-spin border-b-transparent`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-80 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div 
            className={`h-full ${colorClasses[color].split(' ')[1]} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress Text */}
        <div className="text-gray-400 text-lg font-medium">
          {Math.round(progress)}% Complete
        </div>

        {/* Loading Message */}
        <div className="text-gray-500 text-center max-w-md">
          <div className="animate-pulse">
            Preparing your dashboard...
          </div>
          <div className="text-sm mt-2 text-gray-600">
            Loading charts, statistics, and real-time data
          </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 ${colorClasses[color].split(' ')[1]} rounded-full animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
} 