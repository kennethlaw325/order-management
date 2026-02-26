import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
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
        success: (message) => addToast(message, 'success'),
        error: (message) => addToast(message, 'error'),
        warning: (message) => addToast(message, 'warning'),
    }), [addToast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }}>
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const typeStyles = {
    success: {
        background: 'rgba(0, 212, 255, 0.9)',
        color: '#000',
    },
    error: {
        background: 'rgba(239, 68, 68, 0.9)',
        color: '#fff',
    },
    warning: {
        background: 'rgba(245, 158, 11, 0.9)',
        color: '#000',
    },
};

function ToastItem({ toast, onClose }) {
    return (
        <div
            style={{
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                minWidth: '240px',
                maxWidth: '400px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                animation: 'slideUp 0.3s ease',
                ...typeStyles[toast.type],
            }}
        >
            <span>{toast.message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0 2px',
                    opacity: 0.7,
                }}
            >
                x
            </button>
        </div>
    );
}
