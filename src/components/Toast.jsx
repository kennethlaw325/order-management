import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const toast = useMemo(() => ({
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        warning: (msg) => addToast(msg, 'warning'),
    }), [addToast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const config = {
    success: { icon: CheckCircle, cls: 'bg-green-600 dark:bg-green-700' },
    error: { icon: XCircle, cls: 'bg-destructive' },
    warning: { icon: AlertTriangle, cls: 'bg-yellow-500 dark:bg-yellow-600' },
};

function ToastItem({ toast, onClose }) {
    const [visible, setVisible] = useState(false);
    const { icon: Icon, cls } = config[toast.type] || config.success;

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white min-w-[260px] max-w-[400px] shadow-lg ${cls}`}
            style={{
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
        >
            <Icon className="w-4.5 h-4.5" />
            <span className="flex-1">{toast.message}</span>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 cursor-pointer bg-transparent border-none text-inherit">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
