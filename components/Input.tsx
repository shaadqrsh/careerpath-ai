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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          type={inputType}
          disabled={disabled}
          className={`
            w-full bg-slate-50 dark:bg-slate-900/50 
            border border-slate-300 dark:border-slate-600 
            rounded-xl py-3 
            ${icon ? 'pl-10' : 'px-4'} 
            ${isPassword ? 'pr-12' : 'pr-4'} 
            text-slate-900 dark:text-white 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none 
            transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500
            disabled:opacity-75 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};