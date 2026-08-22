import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />,
  error:   <AlertCircle  className="w-4 h-4 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
  info:    <Info          className="w-4 h-4 text-sky-500 shrink-0" />,
};

const COLORS = {
  success: 'border-green-200 bg-green-50',
  error:   'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info:    'border-sky-200 bg-sky-50',
};

const TEXT_COLORS = {
  success: 'text-green-800',
  error:   'text-red-700',
  warning: 'text-amber-700',
  info:    'text-sky-700',
};

/* Single Toast item */
const ToastItem = ({ toast, onRemove }) => {
  const [leaving, setLeaving] = React.useState(false);

  const handleRemove = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 220);
  };

  React.useEffect(() => {
    const timer = setTimeout(handleRemove, toast.duration ?? 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 w-80 px-4 py-3 rounded-2xl border shadow-lg text-xs font-semibold pointer-events-auto
        ${COLORS[toast.type] ?? COLORS.info}
        ${leaving ? 'animate-toast-out' : 'animate-toast-in'}`}
    >
      {ICONS[toast.type] ?? ICONS.info}
      <span className={`flex-1 leading-relaxed ${TEXT_COLORS[toast.type] ?? TEXT_COLORS.info}`}>
        {toast.message}
      </span>
      <button
        onClick={handleRemove}
        className="text-slate-400 hover:text-slate-600 mt-0.5 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

/* Provider */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'info', duration = 3200) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, d)  => add(msg, 'success', d),
    error:   (msg, d)  => add(msg, 'error',   d),
    warning: (msg, d)  => add(msg, 'warning', d),
    info:    (msg, d)  => add(msg, 'info',    d),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Stack — top-right fixed */}
      <div
        className="fixed top-20 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
