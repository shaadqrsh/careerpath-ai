import React from 'react';

interface GeminiBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'glass';
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

  const variantClasses = {
    default: "bg-slate-100 dark:bg-slate-800",
    glass: "bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-sm"
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 ${variantClasses[variant]} ${currentSize.px} ${currentSize.py} ${className}`}>
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