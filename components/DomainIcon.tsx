import React from 'react';
import { Beaker, Briefcase, Palette, HelpCircle } from 'lucide-react';
import { CareerDomain } from '../types';

interface DomainIconProps {
  domain: CareerDomain;
  className?: string;
  size?: 'md' | 'lg';
}

export const DomainIcon: React.FC<DomainIconProps> = ({ 
  domain, 
  className = '',
  size = 'lg'
}) => {
  const config = {
    science: {
      icon: Beaker,
      bg: "bg-gradient-to-br from-cyan-500 to-blue-600"
    },
    commerce: {
      icon: Briefcase,
      bg: "bg-gradient-to-br from-emerald-500 to-green-600"
    },
    arts: {
      icon: Palette,
      bg: "bg-gradient-to-br from-pink-500 to-rose-600"
    },
    general: {
      icon: HelpCircle,
      bg: "bg-gradient-to-br from-indigo-500 to-purple-600"
    }
  };

  const { icon: Icon, bg } = config[domain];

  const sizeClasses = size === 'lg' 
    ? "w-14 h-14 md:w-16 md:h-16 rounded-2xl" 
    : "w-10 h-10 rounded-xl";

  const iconSize = size === 'lg' ? 32 : 20;

  return (
    <div className={`${sizeClasses} ${bg} flex items-center justify-center text-white shadow-lg shrink-0 ${className}`}>
      <Icon size={iconSize} />
    </div>
  );
};