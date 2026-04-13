import { CATEGORIES, CategoryId } from '../types';

interface Props {
   value?: CategoryId;
   onChange: (cat: CategoryId | undefined) => void;
}

export default function CategoryPicker({ value, onChange }: Props) {
   return (
      <div className="flex flex-wrap gap-1 py-2">
         {CATEGORIES.map((cat) => (
            <button
               key={cat.id}
               type="button"
               onClick={() => onChange(value === cat.id ? undefined : (cat.id as CategoryId))}
               className={`px-2 py-1 rounded-full text-xs font-['letter'] transition-all duration-200 ${
                  value === cat.id
                     ? 'bg-amber-500 text-white scale-110 shadow-sm'
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
               }`}
            >
               {cat.emoji} {cat.label}
            </button>
         ))}
      </div>
   );
}
