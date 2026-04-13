import { useState } from 'react';
import { Archive, History, ShoppingBag, Download, FileText, Trash2, TrendingUp } from 'lucide-react';
import { CATEGORIES, CategoryId, HistoryRecord } from '../types';
import { cn } from '../lib/cn';

interface Props {
   history: HistoryRecord[];
   hasItems: boolean;
   onArchive: () => Promise<void>;
   onLoadHistory: (record: HistoryRecord) => Promise<{ added: number }>;
   onSaveHistoryAsTemplate: (record: HistoryRecord, name: string) => Promise<void>;
   onDeleteRecord: (id: string) => Promise<void>;
}

function getCategoryEmoji(cat?: CategoryId | string) {
   if (!cat) return '';
   return CATEGORIES.find((c) => c.id === cat)?.emoji ?? '';
}

function formatDate(ts: number) {
   const d = new Date(ts);
   const today = new Date();
   const yesterday = new Date(today);
   yesterday.setDate(today.getDate() - 1);

   if (d.toDateString() === today.toDateString()) return 'Hoy';
   if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
   return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HistorySheet({
   history,
   hasItems,
   onArchive,
   onLoadHistory,
   onSaveHistoryAsTemplate,
   onDeleteRecord,
}: Props) {
   const [archiving, setArchiving] = useState(false);
   const [expanded, setExpanded] = useState<Record<string, boolean>>({});
   const [templateNames, setTemplateNames] = useState<Record<string, string>>({});
   const [saving, setSaving] = useState<string | null>(null);
   const [loading, setLoading] = useState<string | null>(null);
   const [feedback, setFeedback] = useState<string | null>(null);

   const showFeedback = (msg: string) => {
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 3000);
   };

   const handleArchive = async () => {
      setArchiving(true);
      await onArchive();
      setArchiving(false);
      showFeedback('Sesión archivada correctamente');
   };

   const handleLoad = async (record: HistoryRecord) => {
      setLoading(record.id);
      const { added } = await onLoadHistory(record);
      setLoading(null);
      if (added === 0) showFeedback('Todos los items ya están en la lista');
      else showFeedback(`${added} item${added > 1 ? 's' : ''} añadido${added > 1 ? 's' : ''}`);
   };

   const handleSaveAsTemplate = async (record: HistoryRecord) => {
      const name = templateNames[record.id]?.trim();
      if (!name) return;
      setSaving(record.id);
      await onSaveHistoryAsTemplate(record, name);
      setTemplateNames((p) => ({ ...p, [record.id]: '' }));
      setSaving(null);
      showFeedback('Guardado como plantilla');
   };

   return (
      <div className="px-5 pb-6 space-y-5">
         {/* Feedback */}
         {feedback && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm px-4 py-2 rounded-lg text-center font-medium">
               {feedback}
            </div>
         )}

         {/* Archive current session */}
         <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
               <Archive size={20} className="text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
               <div className="flex-1">
                  <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                     Archivar sesión actual
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
                     Guarda un snapshot de la lista tal y como está ahora (completados y pendientes)
                  </p>
               </div>
            </div>
            <button
               onClick={handleArchive}
               disabled={!hasItems || archiving}
               className={cn(
                  'mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
                  hasItems
                     ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                     : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed',
               )}
            >
               <Archive size={15} />
               {archiving ? 'Archivando...' : 'Archivar ahora'}
            </button>
         </section>

         {/* Spending chart */}
         {(() => {
            const withPrice = history.filter((r) => r.totalPrice > 0);
            if (withPrice.length < 2) return null;
            const chartData = withPrice.slice(0, 8).reverse();
            const maxPrice = Math.max(...chartData.map((r) => r.totalPrice));
            const total = withPrice.reduce((s, r) => s + r.totalPrice, 0);
            const avg = total / withPrice.length;
            return (
               <section className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-amber-500" />
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                           Gasto histórico
                        </p>
                     </div>
                     <p className="text-xs text-gray-400 dark:text-gray-500">
                        Media <span className="font-semibold text-gray-600 dark:text-gray-300">{avg.toFixed(2)} €</span>
                     </p>
                  </div>

                  <div className="space-y-2">
                     {chartData.map((record) => (
                        <div key={record.id} className="flex items-center gap-2">
                           <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right shrink-0">
                              {record.totalPrice.toFixed(0)}€
                           </span>
                           <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                 className="h-full bg-amber-400 dark:bg-amber-500 rounded-full"
                                 style={{ width: `${Math.max(4, (record.totalPrice / maxPrice) * 100)}%` }}
                              />
                           </div>
                           <span className="text-xs text-gray-400 dark:text-gray-500 w-14 truncate shrink-0">
                              {new Date(record.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                           </span>
                        </div>
                     ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                     <span>{withPrice.length} compras con precio</span>
                     <span className="font-semibold text-gray-700 dark:text-gray-300">{total.toFixed(2)} € total</span>
                  </div>
               </section>
            );
         })()}

         {/* History list */}
         <section>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-3">
               Sesiones archivadas ({history.length})
            </p>

            {history.length === 0 && (
               <div className="flex flex-col items-center py-10 gap-3 text-center">
                  <History size={36} className="text-gray-200 dark:text-gray-700" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                     Aún no hay historial.
                     <br />Archiva la sesión actual para empezar.
                  </p>
               </div>
            )}

            <div className="space-y-3">
               {history.map((record) => {
                  const isExpanded = expanded[record.id];
                  const pendingItems = record.items.filter((i) => !i.completed);
                  const doneItems = record.items.filter((i) => i.completed);

                  return (
                     <div
                        key={record.id}
                        className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden"
                     >
                        {/* Summary header */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                           <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                 <ShoppingBag size={15} className="text-gray-400 shrink-0" />
                                 <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
                                    {record.listName}
                                 </p>
                              </div>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-5">
                                 {formatDate(record.date)} · {record.completedCount}/{record.itemCount} comprados
                                 {record.totalPrice > 0 && ` · ${record.totalPrice.toFixed(2)} €`}
                              </p>
                           </div>
                           <div className="flex items-center gap-1 ml-2 shrink-0">
                              <span className={cn(
                                 'text-xs px-2 py-0.5 rounded-full font-medium',
                                 record.completedCount === record.itemCount
                                    ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
                              )}>
                                 {record.completedCount === record.itemCount ? '✓ Completa' : `${Math.round(record.completedCount / record.itemCount * 100)}%`}
                              </span>
                              <button
                                 onClick={() => onDeleteRecord(record.id)}
                                 className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-red-500 active:text-red-500 transition-colors"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </div>

                        {/* Expand items */}
                        <button
                           onClick={() => setExpanded((p) => ({ ...p, [record.id]: !p[record.id] }))}
                           className="w-full px-4 py-3 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-left transition-colors border-t border-gray-100 dark:border-gray-700 min-h-[44px] flex items-center"
                        >
                           {isExpanded ? '▲ Ocultar items' : `▼ Ver ${record.itemCount} items`}
                        </button>

                        {isExpanded && (
                           <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-700/50 space-y-1 max-h-48 overflow-y-auto">
                              {doneItems.map((item, i) => (
                                 <p key={i} className="text-sm text-gray-400 dark:text-gray-600 line-through">
                                    {getCategoryEmoji(item.category)} {item.text}
                                    {item.quantity && <span className="text-xs ml-1">× {item.quantity}{item.unit}</span>}
                                 </p>
                              ))}
                              {pendingItems.map((item, i) => (
                                 <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                                    {getCategoryEmoji(item.category)} {item.text}
                                    {item.quantity && <span className="text-xs ml-1 text-gray-400">× {item.quantity}{item.unit}</span>}
                                 </p>
                              ))}
                           </div>
                        )}

                        {/* Actions */}
                        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                           {/* Load into current list */}
                           <button
                              onClick={() => handleLoad(record)}
                              disabled={loading === record.id}
                              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors"
                           >
                              <Download size={14} />
                              {loading === record.id ? 'Cargando...' : 'Cargar items en lista actual'}
                           </button>

                           {/* Save as template */}
                           <div className="flex gap-2">
                              <input
                                 value={templateNames[record.id] ?? ''}
                                 onChange={(e) =>
                                    setTemplateNames((p) => ({ ...p, [record.id]: e.target.value }))
                                 }
                                 onKeyDown={(e) => e.key === 'Enter' && handleSaveAsTemplate(record)}
                                 placeholder="Nombre para la plantilla..."
                                 className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-amber-400 transition-colors"
                              />
                              <button
                                 onClick={() => handleSaveAsTemplate(record)}
                                 disabled={!templateNames[record.id]?.trim() || saving === record.id}
                                 className={cn(
                                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                    templateNames[record.id]?.trim()
                                       ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                       : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed',
                                 )}
                              >
                                 <FileText size={12} />
                                 {saving === record.id ? '...' : 'Plantilla'}
                              </button>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </section>
      </div>
   );
}
