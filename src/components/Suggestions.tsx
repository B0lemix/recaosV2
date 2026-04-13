import { CATEGORIES, CategoryId } from '../types';

interface FrequentItem {
   text: string;
   count: number;
   category?: CategoryId;
}

interface Props {
   items: FrequentItem[];
   onSelect: (item: FrequentItem) => void;
}

function getCategoryEmoji(cat?: CategoryId) {
   if (!cat) return '';
   return CATEGORIES.find((c) => c.id === cat)?.emoji ?? '';
}

export default function Suggestions({ items, onSelect }: Props) {
   if (items.length === 0) return null;

   return (
      <div className="flex flex-wrap gap-1 py-1">
         {items.map((item) => (
            <button
               key={item.text}
               type="button"
               onClick={() => onSelect(item)}
               className="flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-amber-100 border border-stone-300 rounded-full text-sm font-['letter'] text-gray-700 transition-colors duration-150"
            >
               {getCategoryEmoji(item.category)} {item.text}
            </button>
         ))}
      </div>
   );
}
