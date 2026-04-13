import { useState } from 'react';
import { Clipboard, Trash2, Download, Plus, FileText } from 'lucide-react';
import { CATEGORIES, CategoryId, Template, TemplateItem } from '../types';
import { cn } from '../lib/cn';

interface Props {
   templates: Template[];
   currentItemCount: number;
   onSaveAsTemplate: (name: string) => Promise<void>;
   onApplyTemplate: (template: Template) => Promise<{ added: number }>;
   onDeleteTemplate: (id: string) => Promise<void>;
}

function getCategoryEmoji(cat?: CategoryId | string) {
   if (!cat) return '';
   return CATEGORIES.find((c) => c.id === cat)?.emoji ?? '';
}

function formatDate(ts: number) {
   return new Date(ts).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
   });
}

function previewItems(items: TemplateItem[]) {
   const byCategory = new Map<string, string[]>();
   for (const item of items) {
      const key = item.category ?? '__none__';
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key)!.push(item.text);
   }
   return byCategory;
}

export default function TemplatesSheet({
   templates,
   currentItemCount,
   onSaveAsTemplate,
   onApplyTemplate,
   onDeleteTemplate,
}: Props) {
   const [newName, setNewName] = useState('');
   const [saving, setSaving] = useState(false);
   const [applying, setApplying] = useState<string | null>(null);
   const [expanded, setExpanded] = useState<Record<string, boolean>>({});
   const [feedback, setFeedback] = useState<string | null>(null);

   const handleSave = async () => {
      if (!newName.trim() || currentItemCount === 0) return;
      setSaving(true);
      await onSaveAsTemplate(newName.trim());
      setNewName('');
      setSaving(false);
      showFeedback('Plantilla guardada');
   };

   const handleApply = async (template: Template) => {
      setApplying(template.id);
      const result = await onApplyTemplate(template);
      setApplying(null);
      if (result.added === 0) {
         showFeedback('Todos los items ya están en la lista');
      } else {
         showFeedback(`${result.added} item${result.added > 1 ? 's' : ''} añadido${result.added > 1 ? 's' : ''}`);
      }
   };

   const showFeedback = (msg: string) => {
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 3000);
   };

   return (
      <div className="px-5 pb-6 space-y-6">
         {/* Feedback */}
         {feedback && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm px-4 py-2 rounded-lg text-center font-medium">
               {feedback}
            </div>
         )}

         {/* Save current list */}
         <section>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-3">
               Guardar lista actual como plantilla
            </p>
            {currentItemCount === 0 ? (
               <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                  La lista está vacía — añade items primero
               </p>
            ) : (
               <div className="flex gap-2">
                  <input
                     value={newName}
                     onChange={(e) => setNewName(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                     placeholder="Nombre de la plantilla..."
                     className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                     onClick={handleSave}
                     disabled={!newName.trim() || saving}
                     className={cn(
                        'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                        newName.trim()
                           ? 'bg-amber-500 hover:bg-amber-600 text-white'
                           : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed',
                     )}
                  >
                     <Plus size={15} />
                     {saving ? '...' : 'Guardar'}
                  </button>
               </div>
            )}
         </section>

         {/* Templates list */}
         <section>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-3">
               Mis plantillas ({templates.length})
            </p>

            {templates.length === 0 && (
               <div className="flex flex-col items-center py-10 gap-3 text-center">
                  <FileText size={36} className="text-gray-200 dark:text-gray-700" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                     Aún no tienes plantillas.
                     <br />Guarda la lista actual para empezar.
                  </p>
               </div>
            )}

            <div className="space-y-3">
               {templates.map((tpl) => {
                  const isExpanded = expanded[tpl.id];
                  const preview = previewItems(tpl.items);

                  return (
                     <div
                        key={tpl.id}
                        className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden"
                     >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800">
                           <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                                 {tpl.name}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                 {tpl.items.length} items · {formatDate(tpl.createdAt)}
                              </p>
                           </div>
                           <button
                              onClick={() => onDeleteTemplate(tpl.id)}
                              className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-red-500 active:text-red-500 transition-colors ml-2 shrink-0"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>

                        {/* Preview toggle */}
                        <button
                           onClick={() => setExpanded((p) => ({ ...p, [tpl.id]: !p[tpl.id] }))}
                           className="w-full px-4 py-3 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-left transition-colors border-t border-gray-100 dark:border-gray-700 min-h-[44px] flex items-center"
                        >
                           {isExpanded ? '▲ Ocultar items' : '▼ Ver items'}
                        </button>

                        {isExpanded && (
                           <div className="px-4 py-3 space-y-2 border-t border-gray-50 dark:border-gray-700/50 bg-white dark:bg-gray-900">
                              {[...preview.entries()].map(([cat, items]) => (
                                 <div key={cat}>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                                       {getCategoryEmoji(cat)} {items.length} items
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                       {items.map((item, i) => (
                                          <span
                                             key={i}
                                             className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                                          >
                                             {item}
                                          </span>
                                       ))}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}

                        {/* Apply button */}
                        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                           <button
                              onClick={() => handleApply(tpl)}
                              disabled={applying === tpl.id}
                              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 active:bg-amber-600 text-white text-sm font-medium transition-colors active:scale-95"
                           >
                              <Download size={15} />
                              {applying === tpl.id ? 'Cargando...' : 'Cargar en lista actual'}
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         </section>
      </div>
   );
}
