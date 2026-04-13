import { useState, useCallback, useRef } from 'react';
import { ToastItem } from '../types';

export function useToast() {
   const [toasts, setToasts] = useState<ToastItem[]>([]);
   const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

   const removeToast = useCallback((id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
   }, []);

   const addToast = useCallback(
      (message: string, onUndo?: () => void, duration = 5000) => {
         const id = Date.now().toString();
         setToasts((prev) => [...prev, { id, message, onUndo }]);
         const timer = setTimeout(() => removeToast(id), duration);
         timers.current.set(id, timer);
         return id;
      },
      [removeToast],
   );

   return { toasts, addToast, removeToast };
}
