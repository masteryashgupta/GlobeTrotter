import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Container — bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
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

/* ── Per-type config ── */
const toastConfig: Record<ToastType, { leftBorder: string; iconBg: string; iconColor: string; icon: React.ReactNode }> = {
  success: {
    leftBorder: 'border-l-4 border-l-[#22C55E]',
    iconBg:     'bg-[#22C55E]/10',
    iconColor:  'text-[#16A34A]',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    leftBorder: 'border-l-4 border-l-[#EF4444]',
    iconBg:     'bg-[#EF4444]/10',
    iconColor:  'text-[#DC2626]',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    leftBorder: 'border-l-4 border-l-[#F59E0B]',
    iconBg:     'bg-[#F59E0B]/10',
    iconColor:  'text-[#D97706]',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  info: {
    leftBorder: 'border-l-4 border-l-[#7C3AED]',
    iconBg:     'bg-[#7C3AED]/10',
    iconColor:  'text-[#5B21B6]',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
  const cfg = toastConfig[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-xl border border-[#E9E4F5] shadow-[0_8px_24px_rgba(124,58,237,0.12)] backdrop-blur-md animate-toast-in ${cfg.leftBorder}`}
    >
      {/* Colored icon */}
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${cfg.iconBg} ${cfg.iconColor}`}>
        {cfg.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#1A1523]">{toast.title}</h4>
        {toast.message && <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="shrink-0 text-[#9CA3AF] hover:text-[#1A1523] p-0.5 rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C3AED]"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
