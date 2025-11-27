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
    danger: {
      icon: <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-6" />,
      border: 'border-red-900/50'
    },
    warning: {
      icon: <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />,
      border: 'border-amber-900/50'
    },
    success: {
      icon: <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />,
      border: 'border-emerald-900/50'
    },
    info: {
      icon: <Info className="w-16 h-16 text-blue-500 mx-auto mb-6" />,
      border: 'border-blue-900/50'
    }
  };

  const currentStyle = styles[variant];

  return (
    <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center text-white p-4 text-center animate-fade-in">
      <div className={`bg-slate-900 p-8 rounded-2xl border ${currentStyle.border} max-w-md shadow-2xl animate-fade-in-up`}>
        {currentStyle.icon}
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <div className="text-slate-400 mb-8 leading-relaxed">
          {description}
        </div>
        <Button 
          onClick={onButtonClick} 
          className="px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-xl transition-colors font-bold"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};