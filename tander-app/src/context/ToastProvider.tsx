import React, { useState, useCallback, ReactNode, useRef } from 'react';
import { ToastContext, ToastOptions, ToastType } from './ToastContext';
import Toast from '../components/common/Toast';

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState<ToastOptions | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const hideToast = useCallback(() => {
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToastConfig(options);
      setIsVisible(true);

      // Auto-hide after duration (default 4000ms)
      const duration = options.duration ?? 4000;
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    },
    [hideToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'success', message, duration });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'error', message, duration });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'info', message, duration });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'warning', message, duration });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        info,
        warning,
        hideToast,
      }}
    >
      {children}
      {toastConfig && (
        <Toast
          type={toastConfig.type}
          message={toastConfig.message}
          visible={isVisible}
          onHide={hideToast}
          action={toastConfig.action}
        />
      )}
    </ToastContext.Provider>
  );
};
