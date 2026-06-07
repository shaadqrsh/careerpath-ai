import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'slate' | 'green' | 'amber';
  className?: string;
}

// Almanac index tags: flat, ink-outlined, mono caps.
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  className = '',
}) => {
  const variants = {
    slate: "bg-paper dark:bg-transparent text-ink dark:text-paper border-ink dark:border-paper/60",
    blue: "bg-cobalt/10 dark:bg-cobalt/20 text-cobalt-600 dark:text-cobalt border-cobalt",
    green: "bg-pine/10 dark:bg-pine/20 text-pine dark:text-pine border-pine",
    amber: "bg-marigold/15 dark:bg-marigold/20 text-marigold-700 dark:text-marigold border-marigold-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider border-2 ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
