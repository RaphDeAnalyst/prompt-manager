import { createContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';

export const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };

    setToasts((prevToasts) => [...prevToasts, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message, duration = 5000) => addToast(message, 'success', duration),
    [addToast]
  );

  const showError = useCallback(
    (message, duration = 5000) => addToast(message, 'error', duration),
    [addToast]
  );

  const showWarning = useCallback(
    (message, duration = 5000) => addToast(message, 'warning', duration),
    [addToast]
  );

  const showInfo = useCallback(
    (message, duration = 5000) => addToast(message, 'info', duration),
    [addToast]
  );

  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    toasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
}
