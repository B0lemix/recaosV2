import { CATEGORIES, CategoryId, Todo, NONE_CATEGORY } from '../types';
import TodoItem from './TodoItem';
import { cn } from '../lib/cn';

interface Props {
   categoryId: CategoryId | typeof NONE_CATEGORY;
   items: Todo[];
   onToggle: (todo: Todo) => void;
   onEdit: (todo: Todo) => void;
   onDelete: (todo: Todo) => void;
}

function getCategoryMeta(id: string) {
   if (id === NONE_CATEGORY) return { label: 'Sin categoría', emoji: '📋', border: 'border-l-gray-300', badge: 'bg-gray-50 text-gray-500' };
   return CATEGORIES.find((c) => c.id === id) ?? { label: id, emoji: '📦', border: 'border-l-gray-400', badge: 'bg-gray-50 text-gray-600' };
}

export default function CategorySection({ categoryId, items, onToggle, onEdit, onDelete }: Props) {
   const meta = getCategoryMeta(categoryId);
   const pending = items.filter((t) => !t.completed).length;
   const total = items.length;

   // Pending first, then completed
   const sorted = [
      ...items.filter((t) => !t.completed),
      ...items.filter((t) => t.completed),
   ];

   return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
         {/* Section header */}
         <div className={cn('flex items-center gap-2 px-4 py-2.5 border-l-4', meta.border)}>
            <span className="text-lg leading-none">{meta.emoji}</span>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex-1">
               {meta.label}
            </h3>
            <span
               className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  pending > 0
                     ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                     : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
               )}
            >
               {pending === 0 ? '✓ Todo' : `${pending}/${total}`}
            </span>
         </div>

         {/* Items */}
         <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {sorted.map((todo) => (
               <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
               />
            ))}
         </div>
      </div>
   );
}
