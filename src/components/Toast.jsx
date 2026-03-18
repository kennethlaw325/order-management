// src/components/Toast.jsx — complete replacement
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}

let toastId = 0;

const DURATIONS = { success: 3000, warning: 5000, error: null }; // null = manual dismiss only

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'success') => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        const duration = DURATIONS[type];
        if (duration !== null) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const toast = useMemo(() => ({
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        warning: (msg) => addToast(msg, 'warning'),
    }), [addToast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const TOAST_CONFIG = {
    success: {
        icon: CheckCircle,
        cls: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200',
        border: 'border-l-emerald-500 dark:border-l-emerald-400',
    },
    error: {
        icon: XCircle,
        cls: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
        border: 'border-l-red-500 dark:border-l-red-400',
    },
    warning: {
        icon: AlertTriangle,
        cls: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200',
        border: 'border-l-amber-500 dark:border-l-amber-400',
    },
};

function ToastItem({ toast, onClose }) {
    const [visible, setVisible] = useState(false);
    const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.success;
    const Icon = config.icon;

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm font-medium min-w-[280px] max-w-[400px] shadow-lg border border-l-4 ${config.cls} ${config.border}`}
            style={{
                transform: visible ? 'translateY(0)' : 'translateY(-12px)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
        >
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button onClick={onClose} className="opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none text-inherit flex-shrink-0">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
