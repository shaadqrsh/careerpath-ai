import React from 'react';

interface GeminiBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'glass' | 'banana';
}

// Press credit, almanac style: a small ink-outlined stamp with mono caps.
export const GeminiBadge: React.FC<GeminiBadgeProps> = ({
  size = 'md',
  className = '',
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: { text: 'text-[9px]', icon: 11, px: 'px-2', py: 'py-0.5' },
    md: { text: 'text-[10px]', icon: 13, px: 'px-2.5', py: 'py-1' },
    lg: { text: 'text-xs', icon: 15, px: 'px-3', py: 'py-1.5' },
  };

  const s = sizeClasses[size];

  if (variant === 'banana') {
    return (
      <div className={`inline-flex items-center gap-1.5 border-2 border-marigold-600 bg-marigold/15 ${s.px} ${s.py} ${className}`}>
        <svg width={s.icon + 1} height={s.icon + 1} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-marigold-700 shrink-0">
          <path d="M8.61603 3.5C8.61603 3.5 12.3381 2.5 14.8195 4.9814C17.3009 7.46279 16.0598 11.1849 16.0598 11.1849" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.0598 11.1849C16.0598 11.1849 17.3009 19.8685 9.85671 22.35C2.41253 24.8314 1.17144 18.6279 1.17144 18.6279C1.17144 18.6279 5.51329 19.2483 9.23637 12.4255C12.9594 5.60271 8.61603 3.5 8.61603 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={`${s.text} font-mono font-bold text-marigold-700 uppercase tracking-widest whitespace-nowrap`}>
          Imagery / Nano Banana
        </span>
      </div>
    );
  }

  const tone =
    variant === 'glass'
      ? "border-paper/40 bg-ink/30 text-paper backdrop-blur-sm"
      : "border-ink dark:border-paper/60 bg-paper dark:bg-transparent text-ink dark:text-paper";

  return (
    <div className={`inline-flex items-center gap-1.5 border-2 ${tone} ${s.px} ${s.py} ${className}`}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-vermillion shrink-0">
        <path d="M12 24C12 24 10 14 0 12C10 10 12 0 12 0C12 0 14 10 24 12C14 14 12 24 12 24Z" />
      </svg>
      <span className={`${s.text} font-mono font-bold uppercase tracking-widest whitespace-nowrap`}>
        Reasoning / Gemini
      </span>
    </div>
  );
};
