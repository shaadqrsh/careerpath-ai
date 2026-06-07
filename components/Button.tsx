import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

// "Stamp" buttons: flat ink-bordered blocks with a hard offset shadow that
// presses down on click. The almanac signature interaction.
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold uppercase tracking-wide " +
    "border-2 border-ink dark:border-paper transition-[transform,box-shadow,background-color] duration-150 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-vermillion focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-paper dark:focus-visible:ring-offset-[#14130f] " +
    "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0";

  const variants = {
    primary:
      "bg-vermillion text-paper shadow-stamp dark:shadow-stamp-light hover:bg-vermillion-600 " +
      "hover:-translate-x-[1px] hover:-translate-y-[1px]",
    secondary:
      "bg-ink text-paper dark:bg-paper dark:text-ink shadow-stamp dark:shadow-stamp-light " +
      "hover:-translate-x-[1px] hover:-translate-y-[1px]",
    outline:
      "bg-paper text-ink dark:bg-transparent dark:text-paper shadow-stamp dark:shadow-stamp-light " +
      "hover:bg-paper2 dark:hover:bg-paper/10 hover:-translate-x-[1px] hover:-translate-y-[1px]",
    ghost:
      "border-ink/30 dark:border-paper/30 shadow-none text-ink/70 dark:text-paper/70 " +
      "hover:text-ink dark:hover:text-paper hover:border-ink dark:hover:border-paper hover:bg-ink/10 dark:hover:bg-paper/10 " +
      "active:translate-x-0 active:translate-y-0",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-2",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
