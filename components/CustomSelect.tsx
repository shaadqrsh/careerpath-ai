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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const normalizedOptions: Option[] = options.map(opt =>
    (typeof opt === 'string' || typeof opt === 'number')
      ? { label: String(opt), value: opt }
      : opt
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current) {
        const selectedIndex = normalizedOptions.findIndex(o => o.value === value);
        const targetIndex = highlightedIndex >= 0 ? highlightedIndex : (selectedIndex >= 0 ? selectedIndex : 0);
        setHighlightedIndex(targetIndex);

        const listItem = listRef.current.children[targetIndex] as HTMLElement;
        if (listItem) {
            listItem.scrollIntoView({ block: 'nearest' });
        }
    }
  }, [isOpen]);

  const handleSelect = (optionValue: any) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0) {
        handleSelect(normalizedOptions[highlightedIndex].value);
      } else {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
          setIsOpen(true);
      } else {
          setHighlightedIndex(prev => Math.min(prev + 1, normalizedOptions.length - 1));
          scrollHighlightedIntoView(highlightedIndex + 1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
          setIsOpen(true);
      } else {
          setHighlightedIndex(prev => Math.max(prev - 1, 0));
          scrollHighlightedIntoView(highlightedIndex - 1);
      }
    } else if (e.key.length === 1) {
      if (!isOpen) setIsOpen(true);
      const char = e.key.toLowerCase();
      const index = normalizedOptions.findIndex(opt => opt.label.toLowerCase().startsWith(char));
      if (index >= 0) {
          setHighlightedIndex(index);
          scrollHighlightedIntoView(index);
      }
    }
  };

  const scrollHighlightedIntoView = (index: number) => {
      if (listRef.current && listRef.current.children[index]) {
          (listRef.current.children[index] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
  };

  const selectedLabel = normalizedOptions.find(o => o.value === value)?.label || value;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onKeyDown={handleKeyDown}
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
        <div className="absolute z-[100] mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto focus:outline-none animate-in fade-in zoom-in-95 duration-100 origin-top touch-pan-y overscroll-contain">
          <ul className="py-1" ref={listRef}>
            {normalizedOptions.map((option, index) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`group relative cursor-pointer select-none py-2.5 pl-4 pr-9 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors ${value === option.value ? 'bg-blue-50 dark:bg-slate-800/50 font-medium text-blue-600 dark:text-blue-400' : ''} ${highlightedIndex === index ? 'bg-blue-50 dark:bg-slate-800/50' : ''}`}
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

      {required && (
        <input 
            type="text" 
            className="sr-only" 
            value={value || ''} 
            onChange={() => {}} 
            required 
            tabIndex={-1}
        />
      )}
    </div>
  );
};