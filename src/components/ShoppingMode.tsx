import { useState, useMemo, useRef } from 'react';
import { X, CheckCircle2, Circle, Plus } from 'lucide-react';
import { CATEGORIES, CategoryId, Todo, NONE_CATEGORY } from '../types';
import { HAPTIC } from '../lib/haptic';

interface Props {
   todos: Todo[];
   listName: string;
   onToggle: (todo: Todo) => void;
   onExit: () => void;
   onAdd: (text: string) => Promise<void>;
}

function getCategoryMeta(id: string | typeof NONE_CATEGORY) {
   if (id === NONE_CATEGORY) return { label: 'Sin categoría', emoji: '📋' };
   return CATEGORIES.find((c) => c.id === id) ?? { label: id, emoji: '📦' };
}

export default function ShoppingMode({ todos, listName, onToggle, onExit, onAdd }: Props) {
   const pending = todos.filter((t) => !t.completed).length;
   const [quickText, setQuickText] = useState('');
   const [adding, setAdding] = useState(false);
   const inputRef = useRef<HTMLInputElement>(null);

   // Group by category, pending first within each
   const sections = useMemo(() => {
      const grouped = new Map<string, Todo[]>();
      for (const todo of todos) {
         const key = todo.category ?? NONE_CATEGORY;
         if (!grouped.has(key)) grouped.set(key, []);
         grouped.get(key)!.push(todo);
      }
      const order = [...CATEGORIES.map((c) => c.id), NONE_CATEGORY];
      return order
         .filter((id) => grouped.has(id))
         .map((id) => ({
            id,
            meta: getCategoryMeta(id),
            items: [
               ...grouped.get(id)!.filter((t) => !t.completed),
               ...grouped.get(id)!.filter((t) => t.completed),
            ],
         }));
   }, [todos]);

   const handleQuickAdd = async () => {
      const text = quickText.trim();
      if (!text) return;
      setAdding(true);
      await onAdd(text);
      setQuickText('');
      setAdding(false);
      HAPTIC.add();
      inputRef.current?.focus();
   };

   return (
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 flex flex-col">
         {/* Header */}
         <div className="bg-amber-500 text-white px-4 pt-safe pb-4 flex items-center justify-between shadow-md shrink-0">
            <div>
               <p className="text-xs opacity-75 uppercase tracking-wider font-medium">Modo compra</p>
               <p className="text-lg font-bold">{listName}</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right">
                  <p className="text-2xl font-bold">{pending}</p>
                  <p className="text-xs opacity-75">pendiente{pending !== 1 ? 's' : ''}</p>
               </div>
               <button
                  onClick={onExit}
                  className="bg-white/20 active:bg-white/40 rounded-full p-3 transition-colors"
               >
                  <X size={22} />
               </button>
            </div>
         </div>

         {/* List by category */}
         <div className="flex-1 overflow-y-auto">
            {sections.map((section) => (
               <div key={section.id}>
                  {/* Sticky category header */}
                  <div className="sticky top-0 bg-gray-100 dark:bg-gray-900 px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 z-10">
                     <span>{section.meta.emoji}</span>
                     <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        {section.meta.label}
                     </span>
                  </div>

                  {/* Items */}
                  {section.items.map((todo) => (
                     <button
                        key={todo.id}
                        onClick={() => { HAPTIC.done(); onToggle(todo); }}
                        className={`w-full flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-gray-800 transition-colors text-left ${
                           todo.completed
                              ? 'bg-gray-50 dark:bg-gray-900/50 opacity-50'
                              : 'bg-white dark:bg-gray-900 active:bg-amber-50 dark:active:bg-amber-900/20'
                        }`}
                     >
                        {todo.completed ? (
                           <CheckCircle2 size={28} className="text-green-500 shrink-0" />
                        ) : (
                           <Circle size={28} className="text-gray-300 dark:text-gray-600 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                           <p className={`text-xl font-light break-words ${
                              todo.completed
                                 ? 'line-through text-gray-400'
                                 : 'text-gray-800 dark:text-gray-100'
                           }`}>
                              {todo.text}
                           </p>
                           {(todo.quantity !== undefined || todo.price !== undefined) && (
                              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                                 {todo.quantity !== undefined && `${todo.quantity} ${todo.unit ?? 'ud'}`}
                                 {todo.quantity !== undefined && todo.price !== undefined && ' · '}
                                 {todo.price !== undefined && `${todo.price.toFixed(2)} €`}
                              </p>
                           )}
                           {todo.notes && (
                              <p className="text-sm text-gray-400 dark:text-gray-500 italic mt-0.5">
                                 {todo.notes}
                              </p>
                           )}
                        </div>
                     </button>
                  ))}
               </div>
            ))}

            {/* All done */}
            {pending === 0 && todos.length > 0 && (
               <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <span className="text-6xl">🎉</span>
                  <p className="text-2xl text-gray-500 dark:text-gray-400 font-light">¡Todo comprado!</p>
                  <button
                     onClick={onExit}
                     className="mt-4 bg-amber-500 text-white rounded-xl px-6 py-3 font-medium active:bg-amber-600 transition-colors"
                  >
                     Volver
                  </button>
               </div>
            )}
         </div>

         {/* Quick-add bar */}
         <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-3 pb-safe-6 flex gap-3">
            <input
               ref={inputRef}
               value={quickText}
               onChange={(e) => setQuickText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
               placeholder="Añadir algo que falta..."
               className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
            <button
               onClick={handleQuickAdd}
               disabled={!quickText.trim() || adding}
               className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                  quickText.trim()
                     ? 'bg-amber-500 active:bg-amber-600 text-white'
                     : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
               }`}
            >
               <Plus size={22} />
            </button>
         </div>
      </div>
   );
}
