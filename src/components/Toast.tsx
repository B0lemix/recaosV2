import { ToastItem } from '../types';

interface Props {
   toasts: ToastItem[];
   onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: Props) {
   if (toasts.length === 0) return null;

   return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[92%] max-w-[460px]">
         {toasts.map((toast) => (
            <div
               key={toast.id}
               className="flex items-center justify-between bg-gray-900 text-white rounded-xl px-4 py-3 shadow-xl font-['letter'] animate-slide-up"
            >
               <span className="text-sm truncate">{toast.message}</span>
               <div className="flex gap-4 ml-4 shrink-0">
                  {toast.onUndo && (
                     <button
                        onClick={() => {
                           toast.onUndo?.();
                           onRemove(toast.id);
                        }}
                        className="text-amber-400 font-bold text-sm hover:text-amber-300 transition-colors"
                     >
                        Deshacer
                     </button>
                  )}
                  <button
                     onClick={() => onRemove(toast.id)}
                     className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
                  >
                     ✕
                  </button>
               </div>
            </div>
         ))}
      </div>
   );
}
