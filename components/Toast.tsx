import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ show, message, type }) => {
  if (!show) return null;

  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-emerald-600';

  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-[fadeIn_0.3s_ease-out] z-[150]`}>
      {type === 'error' ? (
        <XCircle className="text-white shrink-0" />
      ) : (
        <CheckCircle className="text-white shrink-0" />
      )}
      <div>
        <p className="font-bold">{message}</p>
      </div>
    </div>
  );
};