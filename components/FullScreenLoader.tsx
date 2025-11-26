import React from 'react';
import { Loader2 } from 'lucide-react';

interface FullScreenLoaderProps {
  text?: string;
  className?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ 
  text, 
  className = "" 
}) => {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors ${className}`}>
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      {text && (
        <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};