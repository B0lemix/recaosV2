import { useEffect, ReactNode } from 'react';

interface Props {
   open: boolean;
   onClose: () => void;
   children: ReactNode;
   title?: string;
}

export default function BottomSheet({ open, onClose, children, title }: Props) {
   // Lock body scroll when open
   useEffect(() => {
      document.body.style.overflow = open ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
   }, [open]);

   return (
      <div
         className={`fixed inset-0 z-50 flex flex-col justify-end transition-all duration-300 ${
            open ? 'visible' : 'invisible'
         }`}
      >
         {/* Backdrop */}
         <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
               open ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={onClose}
         />

         {/* Sheet */}
         <div
            className={`relative bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col transition-transform duration-300 ease-out ${
               open ? 'translate-y-0' : 'translate-y-full'
            }`}
         >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
               <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {title && (
               <div className="px-5 pb-3 shrink-0 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
               </div>
            )}

            <div className="overflow-y-auto flex-1 pb-safe">{children}</div>
         </div>
      </div>
   );
}
