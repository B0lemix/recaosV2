import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, ChevronUp, Mic, MicOff } from 'lucide-react';
import { CATEGORIES, CategoryId, Todo, UNITS } from '../types';
import Suggestions from './Suggestions';
import { useFrequentItems } from '../hooks/useFrequentItems';
import { cn } from '../lib/cn';

interface FormData {
   text: string;
   quantity?: number;
   unit?: string;
   category?: CategoryId;
   price?: number;
   notes?: string;
}

interface Props {
   editTodo?: Todo | null;
   existingTexts: string[];
   onSubmit: (data: FormData) => void;
   onCancel: () => void;
}

const empty: FormData = { text: '', unit: 'ud' };

// Minimal SpeechRecognition interface (not in all TS lib configs)
interface SR {
   lang: string;
   continuous: boolean;
   interimResults: boolean;
   onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
   onend: (() => void) | null;
   onerror: (() => void) | null;
   start(): void;
   stop(): void;
}
type SRCtor = new () => SR;

const SpeechRecognitionCtor: SRCtor | undefined =
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

export default function AddTodoForm({ editTodo, existingTexts, onSubmit, onCancel }: Props) {
   const [form, setForm] = useState<FormData>(empty);
   const [showDetails, setShowDetails] = useState(false);
   const [isListening, setIsListening] = useState(false);
   const inputRef = useRef<HTMLInputElement>(null);
   const recognitionRef = useRef<SR | null>(null);
   const { record, getSuggestions } = useFrequentItems();
   const isEdit = !!editTodo;

   useEffect(() => {
      if (editTodo) {
         setForm({
            text: editTodo.text,
            quantity: editTodo.quantity,
            unit: editTodo.unit ?? 'ud',
            category: editTodo.category,
            price: editTodo.price,
            notes: editTodo.notes,
         });
         setShowDetails(!!(editTodo.quantity || editTodo.category || editTodo.price || editTodo.notes));
      } else {
         setForm(empty);
         setShowDetails(false);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
   }, [editTodo]);

   // Stop recognition when form unmounts
   useEffect(() => {
      return () => { recognitionRef.current?.stop(); };
   }, []);

   const suggestions = getSuggestions(form.text, existingTexts);

   const handleVoice = () => {
      if (!SpeechRecognitionCtor) return;

      if (isListening) {
         recognitionRef.current?.stop();
         setIsListening(false);
         return;
      }

      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (e) => {
         const transcript = e.results[0][0].transcript;
         setForm((p) => ({ ...p, text: p.text ? `${p.text} ${transcript}` : transcript }));
         inputRef.current?.focus();
      };
      recognition.onend  = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.text.trim()) return;
      if (!isEdit) record(form.text.trim(), form.category);
      onSubmit({ ...form, text: form.text.trim(), notes: form.notes?.trim() || undefined });
      setForm(empty);
      setShowDetails(false);
   };

   return (
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
         {/* Text input + mic button */}
         <div className="flex items-end gap-3">
            <input
               ref={inputRef}
               value={form.text}
               onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
               placeholder={isEdit ? 'Editar recao...' : '¿Qué necesitas?'}
               className="flex-1 text-2xl font-light text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 bg-transparent outline-none border-b-2 border-gray-200 dark:border-gray-700 focus:border-amber-400 dark:focus:border-amber-500 pb-2 transition-colors"
            />
            {SpeechRecognitionCtor && (
               <button
                  type="button"
                  onClick={handleVoice}
                  className={cn(
                     'mb-2 p-2.5 rounded-full transition-all duration-200 shrink-0',
                     isListening
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-500 animate-pulse'
                        : 'text-gray-400 dark:text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20',
                  )}
                  title={isListening ? 'Parar escucha' : 'Añadir por voz'}
               >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
               </button>
            )}
         </div>

         {/* Listening indicator */}
         {isListening && (
            <div className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400 animate-pulse">
               <span className="w-2 h-2 bg-red-500 rounded-full" />
               Escuchando... habla ahora
            </div>
         )}

         {/* Suggestions */}
         {!isEdit && suggestions.length > 0 && (
            <Suggestions
               items={suggestions}
               onSelect={(item) =>
                  setForm((p) => ({ ...p, text: item.text, category: item.category ?? p.category }))
               }
            />
         )}

         {/* Category pills */}
         <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 font-medium">
               Categoría
            </p>
            <div className="flex flex-wrap gap-2">
               {CATEGORIES.map((cat) => (
                  <button
                     key={cat.id}
                     type="button"
                     onClick={() =>
                        setForm((p) => ({
                           ...p,
                           category: p.category === cat.id ? undefined : (cat.id as CategoryId),
                        }))
                     }
                     className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95',
                        form.category === cat.id
                           ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                           : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                     )}
                  >
                     <span>{cat.emoji}</span>
                     <span>{cat.label}</span>
                  </button>
               ))}
            </div>
         </div>

         {/* Expandable details */}
         <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="flex items-center gap-2 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
         >
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showDetails ? 'Ocultar detalles' : 'Añadir cantidad, precio y notas'}
         </button>

         {showDetails && (
            <div className="space-y-3">
               {/* Quantity + unit */}
               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="text-xs text-gray-400 dark:text-gray-500 block mb-1.5">
                        Cantidad
                     </label>
                     <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        value={form.quantity ?? ''}
                        onChange={(e) =>
                           setForm((p) => ({
                              ...p,
                              quantity: e.target.value ? Number(e.target.value) : undefined,
                           }))
                        }
                        placeholder="1"
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-base bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors"
                     />
                  </div>
                  <div>
                     <label className="text-xs text-gray-400 dark:text-gray-500 block mb-1.5">
                        Unidad
                     </label>
                     <select
                        value={form.unit ?? 'ud'}
                        onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-base bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors"
                     >
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                     </select>
                  </div>
               </div>

               {/* Price */}
               <div>
                  <label className="text-xs text-gray-400 dark:text-gray-500 block mb-1.5">
                     Precio €
                  </label>
                  <input
                     type="number"
                     inputMode="decimal"
                     min={0}
                     step="0.01"
                     value={form.price ?? ''}
                     onChange={(e) =>
                        setForm((p) => ({
                           ...p,
                           price: e.target.value ? Number(e.target.value) : undefined,
                        }))
                     }
                     placeholder="0.00"
                     className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-base bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors"
                  />
               </div>

               {/* Notes */}
               <div>
                  <label className="text-xs text-gray-400 dark:text-gray-500 block mb-1.5">
                     Nota (marca, variedad...)
                  </label>
                  <textarea
                     value={form.notes ?? ''}
                     onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                     placeholder="Ej: marca Hacendado, sin lactosa, ecológico..."
                     rows={2}
                     className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors resize-none"
                  />
               </div>
            </div>
         )}

         {/* Actions */}
         <div className="flex gap-3 pt-1 pb-2">
            {isEdit && (
               <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
               >
                  Cancelar
               </button>
            )}
            <button
               type="submit"
               disabled={!form.text.trim()}
               className={cn(
                  'flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200',
                  form.text.trim()
                     ? 'bg-amber-500 hover:bg-amber-600 active:scale-95'
                     : 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed text-gray-400 dark:text-gray-500',
               )}
            >
               {isEdit ? (
                  <><Check size={16} /> Guardar cambios</>
               ) : (
                  'Añadir a la lista'
               )}
            </button>
         </div>
      </form>
   );
}
