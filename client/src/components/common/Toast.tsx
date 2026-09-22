import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
}

interface ToastContextType {
  showToast: (text: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border-l-4 flex items-start gap-3 text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-emerald-900/95 backdrop-blur-lg text-emerald-50 border-emerald-600'
                  : toast.type === 'error'
                  ? 'bg-rose-900/95 backdrop-blur-lg text-rose-50 border-rose-500'
                  : 'bg-slate-900/95 backdrop-blur-lg text-slate-50 border-slate-500'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />}
              <span className="flex-1">{toast.text}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
