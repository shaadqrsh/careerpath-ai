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
        className={`w-full bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper/70 py-3 pl-4 pr-10 text-left font-medium text-ink dark:text-paper focus:outline-none transition-all duration-150 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${isOpen ? 'border-vermillion shadow-stamp-sm dark:shadow-stamp-light -translate-x-[1px] -translate-y-[1px]' : ''}`}
      >
        <span className={`block truncate ${!value && value !== 0 ? 'text-ink/40 dark:text-paper/40 font-normal' : ''}`}>
          {value || value === 0 ? selectedLabel : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
          <ChevronDown className={`w-5 h-5 text-ink/50 dark:text-paper/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper/70 shadow-stamp dark:shadow-stamp-light max-h-60 overflow-y-auto focus:outline-none animate-fade-in origin-top touch-pan-y overscroll-contain">
          <ul className="py-0" ref={listRef}>
            {normalizedOptions.map((option, index) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`group relative cursor-pointer select-none py-2.5 pl-4 pr-9 text-ink dark:text-paper transition-colors border-b border-ink/10 dark:border-paper/10 last:border-b-0 hover:bg-vermillion hover:text-paper ${value === option.value ? 'bg-ink/5 dark:bg-paper/10 font-bold text-vermillion-600 dark:text-vermillion' : ''} ${highlightedIndex === index ? 'bg-vermillion text-paper' : ''}`}
              >
                <span className="block truncate">{option.label}</span>
                {value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 group-hover:text-paper">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </li>
            ))}
            {normalizedOptions.length === 0 && (
                <li className="py-2.5 pl-4 pr-4 text-ink/50 dark:text-paper/50 text-sm">No options available</li>
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