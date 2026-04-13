import { useState, useCallback } from 'react';
import { CategoryId } from '../types';

interface FrequentItem {
   text: string;
   count: number;
   category?: CategoryId;
}

const KEY = 'recaos_frequent';
const MAX = 30;

function load(): FrequentItem[] {
   try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
   } catch {
      return [];
   }
}

export function useFrequentItems() {
   const [items, setItems] = useState<FrequentItem[]>(load);

   const record = useCallback((text: string, category?: CategoryId) => {
      setItems((prev) => {
         const lower = text.toLowerCase();
         const existing = prev.find((i) => i.text.toLowerCase() === lower);
         let updated: FrequentItem[];
         if (existing) {
            updated = prev.map((i) =>
               i.text.toLowerCase() === lower
                  ? { ...i, count: i.count + 1, category: category ?? i.category }
                  : i,
            );
         } else {
            updated = [...prev, { text, count: 1, category }];
         }
         updated = updated.sort((a, b) => b.count - a.count).slice(0, MAX);
         localStorage.setItem(KEY, JSON.stringify(updated));
         return updated;
      });
   }, []);

   const getSuggestions = useCallback(
      (input: string, existingTexts: string[], limit = 5): FrequentItem[] => {
         const lower = input.toLowerCase().trim();
         return items
            .filter((i) => {
               const matchesInput = lower ? i.text.toLowerCase().includes(lower) : true;
               const notDuplicate = !existingTexts.some(
                  (t) => t.toLowerCase() === i.text.toLowerCase(),
               );
               return matchesInput && notDuplicate;
            })
            .slice(0, limit);
      },
      [items],
   );

   return { record, getSuggestions };
}
