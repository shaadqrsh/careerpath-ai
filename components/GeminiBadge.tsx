import React from 'react';

interface GeminiBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'glass' | 'banana';
}

export const GeminiBadge: React.FC<GeminiBadgeProps> = ({ 
  size = 'md', 
  className = '',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: { text: 'text-[10px]', icon: 10, px: 'px-2', py: 'py-0.5' },
    md: { text: 'text-xs', icon: 12, px: 'px-3', py: 'py-1' },
    lg: { text: 'text-sm', icon: 16, px: 'px-3', py: 'py-1.5' }
  };

  const currentSize = sizeClasses[size];

  if (variant === 'banana') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 backdrop-blur-md ${currentSize.px} ${currentSize.py} ${className}`}>
        <svg 
            width={currentSize.icon + 2} 
            height={currentSize.icon + 2} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-yellow-400 shrink-0"
        >
            <path d="M8.61603 3.5C8.61603 3.5 12.3381 2.5 14.8195 4.9814C17.3009 7.46279 16.0598 11.1849 16.0598 11.1849" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.0598 11.1849C16.0598 11.1849 17.3009 19.8685 9.85671 22.35C2.41253 24.8314 1.17144 18.6279 1.17144 18.6279C1.17144 18.6279 5.51329 19.2483 9.23637 12.4255C12.9594 5.60271 8.61603 3.5 8.61603 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className={`${currentSize.text} font-bold text-yellow-400 tracking-wide whitespace-nowrap`}>
            Powered by Nano Banana
        </span>
      </div>
    );
  }

  const variantClasses = {
    default: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    glass: "bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-sm border-slate-200 dark:border-slate-700",
    banana: ""
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border ${variantClasses[variant]} ${currentSize.px} ${currentSize.py} ${className}`}>
      <svg 
        width={currentSize.icon} 
        height={currentSize.icon} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        xmlns="http://www.w3.org/2000/svg" 
        className="text-blue-500 shrink-0"
      >
        <path d="M12 24C12 24 10 14 0 12C10 10 12 0 12 0C12 0 14 10 24 12C14 14 12 24 12 24Z" />
      </svg>
      <span className={`${currentSize.text} font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent whitespace-nowrap`}>
        Powered by Gemini
      </span>
    </div>
  );
};