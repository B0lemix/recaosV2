import { useState, useEffect, useRef, useMemo, useCallback, FormEvent } from 'react';
import './App.css';
import {
   Plus,
   ShoppingCart,
   ChevronDown,
   ArrowUpAZ,
   Trash2,
   Moon,
   Sun,
   Clipboard,
   History,
   Share2,
   WifiOff,
} from 'lucide-react';
import {
   collection,
   query,
   onSnapshot,
   addDoc,
   updateDoc,
   deleteDoc,
   doc,
   orderBy,
   arrayUnion,
   writeBatch,
   getDocs,
   limit,
} from 'firebase/firestore';
import db from './firebase';
import {
   CATEGORIES, CategoryId, HistoryRecord, List,
   NONE_CATEGORY, Template, TemplateItem, Todo,
} from './types';
import CategorySection from './components/CategorySection';
import AddTodoForm from './components/AddTodoForm';
import BottomSheet from './components/BottomSheet';
import ListSelector from './components/ListSelector';
import ShoppingMode from './components/ShoppingMode';
import TemplatesSheet from './components/TemplatesSheet';
import HistorySheet from './components/HistorySheet';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import useDarkMode from './hooks/useDarkMode';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { cn } from './lib/cn';

interface TodoFormData {
   text: string;
   quantity?: number;
   unit?: string;
   category?: CategoryId;
   price?: number;
}

const LAST_LIST_KEY = 'recaos_last_list';

export default function App() {
   // Theme
   const [theme, toggleTheme] = useDarkMode() as [string, () => void];
   const isDark = theme === 'dark';

   // Lists
   const [lists, setLists] = useState<List[]>([]);
   const [currentListId, setCurrentListId] = useState<string | null>(null);
   const [showListSelector, setShowListSelector] = useState(false);

   // Todos
   const [rawTodos, setRawTodos] = useState<Todo[]>([]);
   const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
   const pendingDeletes = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

   // UI
   const [sheetOpen, setSheetOpen] = useState(false);
   const [editTodo, setEditTodo] = useState<Todo | null>(null);
   const [shoppingMode, setShoppingMode] = useState(false);

   // Plantillas e Historial
   const [showTemplates, setShowTemplates] = useState(false);
   const [showHistory, setShowHistory] = useState(false);
   const [templates, setTemplates] = useState<Template[]>([]);
   const [history, setHistory] = useState<HistoryRecord[]>([]);

   // Filtro de categoría
   const [activeFilter, setActiveFilter] = useState<string | null>(null);

   const { toasts, addToast, removeToast } = useToast();
   const isOnline = useOnlineStatus();

   // Load lists
   useEffect(() => {
      const q = query(collection(db, 'lists'), orderBy('createdAt'));
      return onSnapshot(q, (snap) => {
         const arr = snap.docs.map((d) => ({ ...d.data(), id: d.id } as List));
         setLists(arr);
         setCurrentListId((prev) => {
            if (prev && arr.find((l) => l.id === prev)) return prev;
            const saved = localStorage.getItem(LAST_LIST_KEY);
            return arr.find((l) => l.id === saved)?.id ?? arr[0]?.id ?? null;
         });
      });
   }, []);

   useEffect(() => {
      if (currentListId) localStorage.setItem(LAST_LIST_KEY, currentListId);
   }, [currentListId]);

   // Load todos
   useEffect(() => {
      if (!currentListId) { setRawTodos([]); return; }
      const q = query(collection(db, 'lists', currentListId, 'todos'));
      return onSnapshot(q, (snap) => {
         setRawTodos(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Todo)));
      });
   }, [currentListId]);

   // Ordered + visible todos
   const currentList = useMemo(() => lists.find((l) => l.id === currentListId), [lists, currentListId]);

   const todos = useMemo(() => {
      const visible = rawTodos.filter((t) => !hiddenIds.has(t.id));
      const order = currentList?.order ?? [];
      if (!order.length) return [...visible].sort((a, b) => a.createdAt - b.createdAt);
      const idx = new Map(order.map((id, i) => [id, i]));
      return [...visible].sort((a, b) => {
         const ai = idx.get(a.id) ?? order.length + a.createdAt;
         const bi = idx.get(b.id) ?? order.length + b.createdAt;
         return ai - bi;
      });
   }, [rawTodos, hiddenIds, currentList]);

   // Category sections
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
         .map((id) => ({ id, items: grouped.get(id)! }));
   }, [todos]);

   // --- CRUD ---

   const handleAdd = useCallback(async (data: TodoFormData) => {
      if (!currentListId) return;
      const ref = await addDoc(collection(db, 'lists', currentListId, 'todos'), {
         ...data,
         completed: false,
         createdAt: Date.now(),
      });
      await updateDoc(doc(db, 'lists', currentListId), { order: arrayUnion(ref.id) });
      setSheetOpen(false);
   }, [currentListId]);

   const handleUpdate = useCallback(async (data: TodoFormData) => {
      if (!currentListId || !editTodo) return;
      await updateDoc(doc(db, 'lists', currentListId, 'todos', editTodo.id), { ...data });
      setEditTodo(null);
      setSheetOpen(false);
   }, [currentListId, editTodo]);

   const handleToggle = useCallback(async (todo: Todo) => {
      if (!currentListId) return;
      await updateDoc(doc(db, 'lists', currentListId, 'todos', todo.id), {
         completed: !todo.completed,
      });
   }, [currentListId]);

   const handleDelete = useCallback((todo: Todo) => {
      if (!currentListId) return;
      setHiddenIds((prev) => new Set([...prev, todo.id]));
      const listId = currentListId;
      const timer = setTimeout(async () => {
         await deleteDoc(doc(db, 'lists', listId, 'todos', todo.id));
         setHiddenIds((prev) => { const s = new Set(prev); s.delete(todo.id); return s; });
         pendingDeletes.current.delete(todo.id);
      }, 5000);
      pendingDeletes.current.set(todo.id, timer);
      addToast(`"${todo.text}" eliminado`, () => {
         clearTimeout(pendingDeletes.current.get(todo.id));
         pendingDeletes.current.delete(todo.id);
         setHiddenIds((prev) => { const s = new Set(prev); s.delete(todo.id); return s; });
      });
   }, [currentListId, addToast]);

   const handleEdit = useCallback((todo: Todo) => {
      setEditTodo(todo);
      setSheetOpen(true);
   }, []);

   const handleClearCompleted = useCallback(async () => {
      if (!currentListId) return;
      const completed = todos.filter((t) => t.completed);
      const batch = writeBatch(db);
      completed.forEach((t) => batch.delete(doc(db, 'lists', currentListId, 'todos', t.id)));
      await batch.commit();
   }, [currentListId, todos]);

   const handleSortAZ = useCallback(async () => {
      if (!currentListId) return;
      const newOrder: string[] = [];
      for (const section of sections) {
         const sorted = [...section.items].sort((a, b) => a.text.localeCompare(b.text, 'es'));
         newOrder.push(...sorted.map((t) => t.id));
      }
      await updateDoc(doc(db, 'lists', currentListId), { order: newOrder });
   }, [currentListId, sections]);

   // ── PLANTILLAS ──────────────────────────────────────────────────────────

   const loadTemplates = useCallback(async () => {
      const snap = await getDocs(query(collection(db, 'templates'), orderBy('createdAt', 'desc')));
      setTemplates(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Template)));
   }, []);

   const handleOpenTemplates = useCallback(() => {
      loadTemplates();
      setShowTemplates(true);
   }, [loadTemplates]);

   const handleSaveAsTemplate = useCallback(async (name: string) => {
      const items: TemplateItem[] = todos.map((t) => ({
         text: t.text,
         ...(t.category && { category: t.category }),
         ...(t.quantity !== undefined && { quantity: t.quantity }),
         ...(t.unit && { unit: t.unit }),
         ...(t.price !== undefined && { price: t.price }),
      }));
      await addDoc(collection(db, 'templates'), { name, items, createdAt: Date.now() });
      await loadTemplates();
   }, [todos, loadTemplates]);

   const handleApplyTemplate = useCallback(async (template: Template) => {
      if (!currentListId) return { added: 0 };
      const existingLower = new Set(todos.map((t) => t.text.toLowerCase()));
      const newItems = template.items.filter((i) => !existingLower.has(i.text.toLowerCase()));
      if (newItems.length === 0) return { added: 0 };

      const batch = writeBatch(db);
      const newIds: string[] = [];
      const now = Date.now();
      for (const item of newItems) {
         const ref = doc(collection(db, 'lists', currentListId, 'todos'));
         batch.set(ref, { ...item, completed: false, createdAt: now });
         newIds.push(ref.id);
      }
      await batch.commit();
      const newOrder = [...(currentList?.order ?? []), ...newIds];
      await updateDoc(doc(db, 'lists', currentListId), { order: newOrder });
      return { added: newItems.length };
   }, [currentListId, todos, currentList]);

   const handleDeleteTemplate = useCallback(async (id: string) => {
      await deleteDoc(doc(db, 'templates', id));
      setTemplates((prev) => prev.filter((t) => t.id !== id));
   }, []);

   // ── HISTORIAL ────────────────────────────────────────────────────────────

   const loadHistory = useCallback(async () => {
      const snap = await getDocs(
         query(collection(db, 'history'), orderBy('date', 'desc'), limit(30)),
      );
      setHistory(snap.docs.map((d) => ({ ...d.data(), id: d.id } as HistoryRecord)));
   }, []);

   const handleOpenHistory = useCallback(() => {
      loadHistory();
      setShowHistory(true);
   }, [loadHistory]);

   const handleArchive = useCallback(async () => {
      if (!currentListId || todos.length === 0) return;
      const items = todos.map((t) => ({
         text: t.text,
         completed: t.completed,
         ...(t.category && { category: t.category }),
         ...(t.quantity !== undefined && { quantity: t.quantity }),
         ...(t.unit && { unit: t.unit }),
         ...(t.price !== undefined && { price: t.price }),
      }));
      const totalPrice = todos
         .filter((t) => t.completed && t.price !== undefined)
         .reduce((s, t) => s + t.price! * (t.quantity ?? 1), 0);
      await addDoc(collection(db, 'history'), {
         date: Date.now(),
         listName: currentList?.name ?? 'Mi lista',
         itemCount: todos.length,
         completedCount: todos.filter((t) => t.completed).length,
         totalPrice,
         items,
      });
      await loadHistory();
   }, [currentListId, todos, currentList, loadHistory]);

   const handleLoadHistory = useCallback(async (record: HistoryRecord) => {
      if (!currentListId) return { added: 0 };
      const existingLower = new Set(todos.map((t) => t.text.toLowerCase()));
      const newItems = record.items.filter((i) => !existingLower.has(i.text.toLowerCase()));
      if (newItems.length === 0) return { added: 0 };

      const batch = writeBatch(db);
      const newIds: string[] = [];
      const now = Date.now();
      for (const item of newItems) {
         const ref = doc(collection(db, 'lists', currentListId, 'todos'));
         batch.set(ref, { text: item.text, completed: false, createdAt: now,
            ...(item.category && { category: item.category }),
            ...(item.quantity !== undefined && { quantity: item.quantity }),
            ...(item.unit && { unit: item.unit }),
            ...(item.price !== undefined && { price: item.price }),
         });
         newIds.push(ref.id);
      }
      await batch.commit();
      const newOrder = [...(currentList?.order ?? []), ...newIds];
      await updateDoc(doc(db, 'lists', currentListId), { order: newOrder });
      return { added: newItems.length };
   }, [currentListId, todos, currentList]);

   const handleSaveHistoryAsTemplate = useCallback(async (record: HistoryRecord, name: string) => {
      const items: TemplateItem[] = record.items.map((i) => ({
         text: i.text,
         ...(i.category && { category: i.category }),
         ...(i.quantity !== undefined && { quantity: i.quantity }),
         ...(i.unit && { unit: i.unit }),
         ...(i.price !== undefined && { price: i.price }),
      }));
      await addDoc(collection(db, 'templates'), { name, items, createdAt: Date.now() });
   }, []);

   const handleDeleteRecord = useCallback(async (id: string) => {
      await deleteDoc(doc(db, 'history', id));
      setHistory((prev) => prev.filter((r) => r.id !== id));
   }, []);

   // Reset filter when switching lists
   useEffect(() => { setActiveFilter(null); }, [currentListId]);

   // Quick-add from shopping mode (text only, no sheet)
   const handleQuickAdd = useCallback(async (text: string) => {
      if (!currentListId || !text.trim()) return;
      const ref = await addDoc(collection(db, 'lists', currentListId, 'todos'), {
         text: text.trim(),
         completed: false,
         createdAt: Date.now(),
      });
      await updateDoc(doc(db, 'lists', currentListId), { order: arrayUnion(ref.id) });
   }, [currentListId]);

   // Share list via Web Share API (fallback: clipboard)
   const handleShare = useCallback(async () => {
      if (!currentList || todos.length === 0) return;
      const pending = todos.filter((t) => !t.completed);
      if (pending.length === 0) return;

      const lines: string[] = [`🛒 ${currentList.name}\n`];
      const byCategory = new Map<string, typeof pending>();
      for (const t of pending) {
         const key = t.category ?? NONE_CATEGORY;
         if (!byCategory.has(key)) byCategory.set(key, []);
         byCategory.get(key)!.push(t);
      }
      const catOrder = [...CATEGORIES.map((c) => c.id), NONE_CATEGORY];
      for (const catId of catOrder) {
         const items = byCategory.get(catId);
         if (!items) continue;
         const meta = catId === NONE_CATEGORY
            ? { emoji: '📋', label: 'Otros' }
            : CATEGORIES.find((c) => c.id === catId) ?? { emoji: '📦', label: catId };
         lines.push(`${meta.emoji} ${meta.label}`);
         for (const item of items) {
            let line = `• ${item.text}`;
            if (item.quantity !== undefined) line += ` (${item.quantity} ${item.unit ?? 'ud'})`;
            if (item.notes) line += ` — ${item.notes}`;
            lines.push(line);
         }
         lines.push('');
      }
      const text = lines.join('\n');

      if (navigator.share) {
         await navigator.share({ title: currentList.name, text });
      } else {
         await navigator.clipboard.writeText(text);
         addToast('Lista copiada al portapapeles');
      }
   }, [currentList, todos, addToast]);

   // List management
   const handleCreateList = useCallback(async (name: string) => {
      const ref = await addDoc(collection(db, 'lists'), { name, createdAt: Date.now(), order: [] });
      setCurrentListId(ref.id);
   }, []);

   const handleDeleteList = useCallback(async (list: List) => {
      await deleteDoc(doc(db, 'lists', list.id));
      if (currentListId === list.id) setCurrentListId(null);
   }, [currentListId]);

   // New list form inside selector
   const [newListName, setNewListName] = useState('');
   const handleNewListSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (!newListName.trim()) return;
      handleCreateList(newListName.trim());
      setNewListName('');
      setShowListSelector(false);
   };

   const pendingCount = todos.filter((t) => !t.completed).length;
   const completedCount = todos.filter((t) => t.completed).length;
   const priceTotal = todos
      .filter((t) => !t.completed && t.price !== undefined)
      .reduce((s, t) => s + t.price! * (t.quantity ?? 1), 0);

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
         <Toast toasts={toasts} onRemove={removeToast} />

         {shoppingMode && currentList && (
            <ShoppingMode
               todos={todos}
               listName={currentList.name}
               onToggle={handleToggle}
               onExit={() => setShoppingMode(false)}
               onAdd={handleQuickAdd}
            />
         )}

         {showListSelector && (
            <ListSelector
               lists={lists}
               currentListId={currentListId}
               onSelect={setCurrentListId}
               onCreate={handleCreateList}
               onDelete={handleDeleteList}
               onClose={() => setShowListSelector(false)}
            />
         )}

         {/* Add / Edit sheet */}
         <BottomSheet
            open={sheetOpen}
            onClose={() => { setSheetOpen(false); setEditTodo(null); }}
            title={editTodo ? 'Editar recao' : 'Añadir recao'}
         >
            <AddTodoForm
               editTodo={editTodo}
               existingTexts={todos.map((t) => t.text)}
               onSubmit={editTodo ? handleUpdate : handleAdd}
               onCancel={() => { setSheetOpen(false); setEditTodo(null); }}
            />
         </BottomSheet>

         {/* Plantillas sheet */}
         <BottomSheet
            open={showTemplates}
            onClose={() => setShowTemplates(false)}
            title="Plantillas semanales"
         >
            <TemplatesSheet
               templates={templates}
               currentItemCount={todos.length}
               onSaveAsTemplate={handleSaveAsTemplate}
               onApplyTemplate={handleApplyTemplate}
               onDeleteTemplate={handleDeleteTemplate}
            />
         </BottomSheet>

         {/* Historial sheet */}
         <BottomSheet
            open={showHistory}
            onClose={() => setShowHistory(false)}
            title="Historial de compras"
         >
            <HistorySheet
               history={history}
               hasItems={todos.length > 0}
               onArchive={handleArchive}
               onLoadHistory={handleLoadHistory}
               onSaveHistoryAsTemplate={handleSaveHistoryAsTemplate}
               onDeleteRecord={handleDeleteRecord}
            />
         </BottomSheet>

         {/* ── HEADER ── */}
         <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 pt-safe">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
               {/* List selector trigger — min 44px height */}
               <button
                  onClick={() => setShowListSelector(true)}
                  className="flex items-center gap-2.5 min-w-0 py-1"
               >
                  <img src="/logo.svg" className="h-9 w-9 rounded-lg shrink-0" alt="logo" />
                  <div className="text-left min-w-0">
                     <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">Lista</p>
                     <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[150px]">
                        {currentList?.name ?? 'Sin lista'}
                     </p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400 shrink-0" />
               </button>

               {/* Right actions */}
               <div className="flex items-center gap-1">
                  {todos.filter((t) => !t.completed).length > 0 && (
                     <button
                        onClick={handleShare}
                        className="p-2.5 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                        title="Compartir lista"
                     >
                        <Share2 size={20} />
                     </button>
                  )}
                  <button
                     onClick={toggleTheme}
                     className="p-2.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                     title="Cambiar tema"
                  >
                     {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  {currentListId && (
                     <button
                        onClick={() => setShoppingMode(true)}
                        className="flex items-center gap-1.5 bg-amber-500 active:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                     >
                        <ShoppingCart size={16} />
                        Comprar
                     </button>
                  )}
               </div>
            </div>
         </header>

         {/* Offline banner */}
         {!isOnline && (
            <div className="bg-orange-500 text-white text-center text-xs py-2 px-4 flex items-center justify-center gap-2 font-medium">
               <WifiOff size={13} />
               Sin conexión — los cambios se guardarán al reconectar
            </div>
         )}

         {/* ── MAIN ── */}
         <main className="max-w-lg mx-auto px-4 pb-safe-28">

            {/* No list state */}
            {lists.length === 0 && (
               <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
                  <span className="text-6xl">🛒</span>
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Tu primera lista</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Crea una lista para empezar</p>
                  <form onSubmit={handleNewListSubmit} className="flex gap-2 w-full max-w-xs">
                     <input
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Nombre de la lista..."
                        className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-amber-400 transition-colors"
                     />
                     <button
                        type="submit"
                        className="bg-amber-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-amber-600 transition-colors"
                     >
                        Crear
                     </button>
                  </form>
               </div>
            )}

            {/* Stats bar */}
            {currentListId && todos.length > 0 && (
               <div className="flex items-center justify-between py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                     <span className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-1">
                        {pendingCount}
                     </span>
                     pendiente{pendingCount !== 1 ? 's' : ''}
                  </p>
                  {priceTotal > 0 && (
                     <p className="text-sm text-gray-400 dark:text-gray-500">
                        Estimado{' '}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                           {priceTotal.toFixed(2)} €
                        </span>
                     </p>
                  )}
               </div>
            )}

            {/* Action bar */}
            {currentListId && (
               <div className="mb-4 space-y-2">
                  {/* Tools row */}
                  {(todos.length > 0 || completedCount > 0) && (
                     <div className="flex items-center gap-2">
                        {todos.length > 0 && (
                           <button
                              onClick={handleSortAZ}
                              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 transition-colors active:bg-gray-50 dark:active:bg-gray-700"
                           >
                              <ArrowUpAZ size={15} /> A–Z
                           </button>
                        )}
                        {completedCount > 0 && (
                           <button
                              onClick={handleClearCompleted}
                              className="flex items-center gap-1.5 text-sm text-red-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 transition-colors active:bg-red-50 dark:active:bg-red-900/20"
                           >
                              <Trash2 size={15} /> Limpiar {completedCount}
                           </button>
                        )}
                     </div>
                  )}
                  {/* Nav row — full-width split buttons */}
                  <div className="grid grid-cols-2 gap-2">
                     <button
                        onClick={handleOpenTemplates}
                        className="flex items-center justify-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl py-2.5 transition-colors active:bg-amber-100 dark:active:bg-amber-900/40"
                     >
                        <Clipboard size={15} /> Plantillas
                     </button>
                     <button
                        onClick={handleOpenHistory}
                        className="flex items-center justify-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl py-2.5 transition-colors active:bg-amber-100 dark:active:bg-amber-900/40"
                     >
                        <History size={15} /> Historial
                     </button>
                  </div>
               </div>
            )}

            {/* Category filter chips — only when 2+ categories */}
            {currentListId && sections.length > 1 && (
               <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 mb-4 scrollbar-none">
                  <button
                     onClick={() => setActiveFilter(null)}
                     className={cn(
                        'flex-none text-sm px-3.5 py-2 rounded-full font-medium transition-colors whitespace-nowrap',
                        activeFilter === null
                           ? 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900'
                           : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300',
                     )}
                  >
                     Todas
                  </button>
                  {sections.map((s) => {
                     const meta = s.id === NONE_CATEGORY
                        ? { emoji: '📋', label: 'Sin cat.' }
                        : CATEGORIES.find((c) => c.id === s.id) ?? { emoji: '📦', label: s.id };
                     return (
                        <button
                           key={s.id}
                           onClick={() => setActiveFilter(s.id === activeFilter ? null : s.id)}
                           className={cn(
                              'flex-none flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-full font-medium transition-colors whitespace-nowrap',
                              activeFilter === s.id
                                 ? 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900'
                                 : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300',
                           )}
                        >
                           {meta.emoji} {meta.label}
                        </button>
                     );
                  })}
               </div>
            )}

            {/* Empty state */}
            {currentListId && todos.length === 0 && (
               <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
                  <span className="text-5xl">📝</span>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                     Lista vacía — toca + para añadir
                  </p>
               </div>
            )}

            {/* Category sections */}
            <div className="space-y-3">
               {(activeFilter ? sections.filter((s) => s.id === activeFilter) : sections).map((section) => (
                  <CategorySection
                     key={section.id}
                     categoryId={section.id as CategoryId | typeof NONE_CATEGORY}
                     items={section.items}
                     onToggle={handleToggle}
                     onEdit={handleEdit}
                     onDelete={handleDelete}
                  />
               ))}
            </div>
         </main>

         {/* ── FAB ── */}
         {currentListId && (
            <button
               onClick={() => { setEditTodo(null); setSheetOpen(true); }}
               style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
               className={cn(
                  'fixed right-5 w-16 h-16 rounded-full bg-amber-500 text-white shadow-xl shadow-amber-300/50 dark:shadow-amber-900/50',
                  'flex items-center justify-center transition-all duration-200 active:scale-90 z-40',
               )}
               aria-label="Añadir recao"
            >
               <Plus size={30} strokeWidth={2.5} />
            </button>
         )}
      </div>
   );
}
