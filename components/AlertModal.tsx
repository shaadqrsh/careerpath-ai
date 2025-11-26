import React from 'react';
import { Button } from './Button';

export interface AlertModalProps {
  isOpen: boolean;
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  icon,
  title,
  description,
  buttonText,
  onButtonClick
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center text-white p-4 text-center animate-fade-in">
      <div className="bg-slate-900 p-8 rounded-2xl border border-red-900/50 max-w-md shadow-2xl animate-fade-in-up">
        {icon}
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