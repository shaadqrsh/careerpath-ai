import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const accent = variant === 'danger' ? 'text-vermillion' : 'text-cobalt';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-[2px] transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />
      <div className="bg-paper dark:bg-[#1c1a17] border-2 border-ink dark:border-paper shadow-stamp-lg dark:shadow-stamp-light max-w-md w-full p-7 relative z-10 animate-fade-in-up">

        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50 dark:text-paper/50">
            {variant === 'danger' ? 'Notice / Caution' : 'Notice / Confirm'}
          </span>
          <span className={accent}>
            {variant === 'danger' ? <AlertTriangle size={22} strokeWidth={2.25} /> : <HelpCircle size={22} strokeWidth={2.25} />}
          </span>
        </div>

        <h3 className="font-display text-2xl text-ink dark:text-paper mb-3 leading-tight">{title}</h3>

        <div className="text-ink/70 dark:text-paper/70 mb-7 leading-relaxed font-serif text-[1.05rem]">
          {description}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'primary' : 'secondary'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};