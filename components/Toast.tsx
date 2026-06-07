import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ show, message, type }) => {
  if (!show) return null;

  const bgColor = type === 'error' ? 'bg-vermillion' : 'bg-pine';

  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 ${bgColor} text-paper px-5 py-3.5 border-2 border-ink dark:border-paper shadow-stamp dark:shadow-stamp-light flex items-center gap-3 animate-fade-in-up z-[150]`}>
      {type === 'error' ? (
        <XCircle className="text-paper shrink-0" strokeWidth={2.25} />
      ) : (
        <CheckCircle className="text-paper shrink-0" strokeWidth={2.25} />
      )}
      <p className="font-bold uppercase tracking-wide text-sm">{message}</p>
    </div>
  );
};