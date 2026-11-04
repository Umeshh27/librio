import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-white border-border text-foreground';
          let Icon = Info;
          let iconColor = 'text-primary';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            iconColor = 'text-success';
            bg = 'bg-white border-emerald-200 text-foreground shadow-lg shadow-emerald-50/50';
          } else if (toast.type === 'error' || toast.type === 'danger') {
            Icon = AlertCircle;
            iconColor = 'text-danger';
            bg = 'bg-white border-rose-200 text-foreground shadow-lg shadow-rose-50/50';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-warning';
            bg = 'bg-white border-amber-200 text-foreground shadow-lg shadow-amber-50/50';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${bg} shadow-dropdown transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="text-sm font-medium leading-relaxed pr-2 flex-1">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-secondary hover:text-foreground p-0.5 rounded transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

