import { useState, useCallback } from 'react';

/**
 * useToast — provides addToast / removeToast helpers + the toasts array.
 *
 * Usage:
 *   const { toasts, addToast, removeToast } = useToast();
 *   addToast('Done!', 'success');
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
