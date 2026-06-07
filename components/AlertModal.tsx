import React from 'react';
import { Button } from './Button';
import { AlertOctagon, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type AlertVariant = 'success' | 'danger' | 'warning' | 'info';

export interface AlertModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
  variant?: AlertVariant;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  description,
  buttonText,
  onButtonClick,
  variant = 'info'
}) => {
  if (!isOpen) return null;

  const styles = {
    danger: { icon: <AlertOctagon className="w-12 h-12" strokeWidth={2} />, color: 'text-vermillion', label: 'Stop' },
    warning: { icon: <AlertTriangle className="w-12 h-12" strokeWidth={2} />, color: 'text-marigold-700 dark:text-marigold', label: 'Caution' },
    success: { icon: <CheckCircle className="w-12 h-12" strokeWidth={2} />, color: 'text-pine dark:text-pine', label: 'Logged' },
    info: { icon: <Info className="w-12 h-12" strokeWidth={2} />, color: 'text-cobalt', label: 'Notice' },
  };

  const currentStyle = styles[variant];

  return (
    <div className="fixed inset-0 bg-ink/85 backdrop-blur-[2px] z-[200] flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      <div className="bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper shadow-stamp-lg dark:shadow-stamp-light p-9 max-w-md w-full animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className={currentStyle.color}>{currentStyle.icon}</span>
        </div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink/50 dark:text-paper/50 block mb-2">
          {currentStyle.label}
        </span>
        <h3 className="font-display text-2xl md:text-3xl text-ink dark:text-paper mb-4 leading-tight">{title}</h3>
        <div className="text-ink/70 dark:text-paper/70 mb-8 leading-relaxed font-serif text-[1.05rem]">
          {description}
        </div>
        <Button onClick={onButtonClick} variant="primary" fullWidth>
          {buttonText}
        </Button>
      </div>
    </div>
  );
};