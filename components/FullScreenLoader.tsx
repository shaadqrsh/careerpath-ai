import React from 'react';

interface FullScreenLoaderProps {
  text?: string;
  className?: string;
}

// A slowly rotating compass rose: the almanac's "finding bearings" mark.
export const CompassMark: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={`animate-spin-slow ${className}`}
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
    {/* North/South needle */}
    <path d="M24 5 L28 24 L24 43 L20 24 Z" fill="currentColor" />
    {/* East/West needle */}
    <path d="M5 24 L24 21 L43 24 L24 27 Z" fill="currentColor" opacity="0.35" />
    <circle cx="24" cy="24" r="2.5" fill="currentColor" />
  </svg>
);

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  text,
  className = '',
}) => {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-paper dark:bg-[#14130f] text-ink dark:text-paper transition-colors ${className}`}>
      <CompassMark className="text-vermillion" />
      {text && (
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-ink/60 dark:text-paper/60 animate-ticker">
          {text}
        </p>
      )}
    </div>
  );
};
