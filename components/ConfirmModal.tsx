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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/95 transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative z-10 animate-fade-in-up border border-slate-200 dark:border-slate-700">
        
        <div className={`flex items-center gap-3 mb-4 ${variant === 'danger' ? 'text-amber-600 dark:text-amber-500' : 'text-blue-600 dark:text-blue-500'}`}>
          {variant === 'danger' ? <AlertTriangle size={28} /> : <HelpCircle size={28} />}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        
        <div className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {description}
        </div>
        
        <div className="flex gap-3 justify-end">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            className={`${
              variant === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
            } disabled:opacity-50`}
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