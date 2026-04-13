import { useRef, useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { Todo } from '../types';
import { cn } from '../lib/cn';
import { HAPTIC } from '../lib/haptic';

interface Props {
   todo: Todo;
   onToggle: (todo: Todo) => void;
   onEdit: (todo: Todo) => void;
   onDelete: (todo: Todo) => void;
}

const SWIPE_THRESHOLD = 72;

export default function TodoItem({ todo, onToggle, onEdit, onDelete }: Props) {
   const [swipeX, setSwipeX] = useState(0);
   const touchStartX = useRef(0);
   const touchStartY = useRef(0);
   const touchStartTime = useRef(0);
   const isSwiping = useRef(false);

   const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      isSwiping.current = false;
   };

   const handleTouchMove = (e: React.TouchEvent) => {
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (Math.abs(dy) > Math.abs(dx) + 10) return;
      isSwiping.current = true;
      setSwipeX(Math.max(-SWIPE_THRESHOLD * 1.5, Math.min(SWIPE_THRESHOLD * 1.5, dx)));
   };

   const handleTouchEnd = () => {
      if (Date.now() - touchStartTime.current > 350 || !isSwiping.current) {
         setSwipeX(0);
         return;
      }
      if (swipeX > SWIPE_THRESHOLD) { HAPTIC.done(); onToggle(todo); }
      else if (swipeX < -SWIPE_THRESHOLD) { HAPTIC.delete(); onDelete(todo); }
      setSwipeX(0);
      isSwiping.current = false;
   };

   const bgColor =
      swipeX > 30 ? 'bg-green-50 dark:bg-green-900/20' : swipeX < -30 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800';

   return (
      <div className="relative overflow-hidden">
         {/* Swipe reveal hints */}
         <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none select-none">
            <Check size={20} className="text-green-500" />
            <Trash2 size={20} className="text-red-400" />
         </div>

         {/* Row */}
         <div
            style={{
               transform: `translateX(${swipeX}px)`,
               transition: swipeX === 0 && !isSwiping.current ? 'transform 0.2s ease' : 'none',
            }}
            className={cn(
               'relative flex items-center gap-3 px-4 py-3.5 min-h-[52px] transition-colors duration-150',
               bgColor,
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
         >
            {/* Checkbox — negative margin extends tap target to ~44px */}
            <button
               onClick={() => { HAPTIC.done(); onToggle(todo); }}
               className="-m-1 p-1 shrink-0 rounded-full transition-all duration-200"
               aria-label={todo.completed ? 'Marcar pendiente' : 'Marcar completado'}
            >
               <span className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                  todo.completed
                     ? 'bg-green-500 border-green-500'
                     : 'border-gray-300 dark:border-gray-600',
               )}>
                  {todo.completed && <Check size={13} className="text-white" strokeWidth={3} />}
               </span>
            </button>

            {/* Text + meta */}
            <div
               className="flex-1 min-w-0 py-1 cursor-pointer"
               onClick={() => { HAPTIC.done(); onToggle(todo); }}
            >
               <p className={cn(
                  'text-sm font-medium break-words transition-all duration-300',
                  todo.completed
                     ? 'line-through text-gray-300 dark:text-gray-600'
                     : 'text-gray-800 dark:text-gray-200',
               )}>
                  {todo.text}
               </p>

               {(todo.quantity !== undefined || todo.price !== undefined) && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                     {todo.quantity !== undefined && `${todo.quantity} ${todo.unit ?? 'ud'}`}
                     {todo.quantity !== undefined && todo.price !== undefined && ' · '}
                     {todo.price !== undefined && `${todo.price.toFixed(2)} €`}
                  </p>
               )}

               {todo.notes && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5 truncate">
                     {todo.notes}
                  </p>
               )}
            </div>

            {/* Action buttons — p-2.5 → ~38px tap area */}
            <div className="flex shrink-0">
               <button
                  onClick={() => onEdit(todo)}
                  className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 active:text-gray-600 transition-colors rounded-lg"
               >
                  <Pencil size={16} />
               </button>
               <button
                  onClick={() => { HAPTIC.delete(); onDelete(todo); }}
                  className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-red-500 active:text-red-500 transition-colors rounded-lg"
               >
                  <Trash2 size={16} />
               </button>
            </div>
         </div>
      </div>
   );
}
