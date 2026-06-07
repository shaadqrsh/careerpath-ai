import React, { InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  type = 'text',
  className = '',
  fullWidth = true,
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-ink/60 dark:text-paper/60 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 dark:text-paper/40 w-5 h-5 pointer-events-none [&>svg]:w-5 [&>svg]:h-5">
            {icon}
          </div>
        )}

        <input
          type={inputType}
          disabled={disabled}
          className={`
            w-full bg-paper dark:bg-[#1c1a17]
            border-2 border-ink dark:border-paper/70
            py-3
            ${icon ? 'pl-11' : 'px-4'}
            ${isPassword ? 'pr-12' : 'pr-4'}
            text-ink dark:text-paper font-medium
            placeholder:text-ink/35 dark:placeholder:text-paper/35 placeholder:font-normal
            focus:outline-none focus:ring-0 focus:border-vermillion focus:shadow-stamp-sm dark:focus:shadow-stamp-light
            focus:-translate-x-[1px] focus:-translate-y-[1px]
            transition-all
            disabled:opacity-60 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-vermillion dark:text-paper/40 dark:hover:text-vermillion hover:scale-110 transition-all p-0.5"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};
