
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: (string | Option)[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className = "",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: any) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const normalizedOptions: Option[] = options.map(opt =>
    (typeof opt === 'string' || typeof opt === 'number')
      ? { label: String(opt), value: opt }
      : opt
  );

  const selectedLabel = normalizedOptions.find(o => o.value === value)?.label || value;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl py-3 pl-4 pr-10 text-left text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
      >
        <span className={`block truncate ${!value && value !== 0 ? 'text-slate-500' : ''}`}>
          {value || value === 0 ? selectedLabel : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-auto focus:outline-none animate-in fade-in zoom-in-95 duration-100 origin-top">
          <ul className="py-1">
            {normalizedOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`group relative cursor-pointer select-none py-2.5 pl-4 pr-9 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors ${value === option.value ? 'bg-blue-50 dark:bg-slate-700/50 font-medium text-blue-600 dark:text-blue-400' : ''}`}
              >
                <span className="block truncate">{option.label}</span>
                {value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600 dark:text-blue-400">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </li>
            ))}
            {normalizedOptions.length === 0 && (
                <li className="py-2.5 pl-4 pr-4 text-slate-500 text-sm">No options available</li>
            )}
          </ul>
        </div>
      )}
      {/* Hidden input for HTML5 form validation if needed */}
      {required && (
        <input 
            type="text" 
            className="sr-only" 
            value={value || ''} 
            onChange={() => {}} 
            required 
        />
      )}
    </div>
  );
};
