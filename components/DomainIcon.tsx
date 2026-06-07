import React from 'react';
import { Beaker, Briefcase, Palette, Compass } from 'lucide-react';
import { CareerDomain } from '../types';

interface DomainIconProps {
  domain: CareerDomain;
  className?: string;
  size?: 'md' | 'lg';
}

// Flat riso-ink plates with a hard ink border and offset shadow.
export const DomainIcon: React.FC<DomainIconProps> = ({
  domain,
  className = '',
  size = 'lg',
}) => {
  const config = {
    science: { icon: Beaker, bg: 'bg-cobalt text-paper' },
    commerce: { icon: Briefcase, bg: 'bg-pine text-paper' },
    arts: { icon: Palette, bg: 'bg-orchid text-paper' },
    general: { icon: Compass, bg: 'bg-marigold text-ink' },
  };

  const { icon: Icon, bg } = config[domain];

  const sizeClasses =
    size === 'lg'
      ? 'w-14 h-14 md:w-16 md:h-16'
      : 'w-10 h-10';

  const iconSize = size === 'lg' ? 30 : 20;

  return (
    <div
      className={`${sizeClasses} ${bg} flex items-center justify-center border-2 border-ink dark:border-paper shadow-stamp-sm dark:shadow-stamp-light shrink-0 ${className}`}
    >
      <Icon size={iconSize} strokeWidth={2.25} />
    </div>
  );
};
