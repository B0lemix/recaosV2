export interface List {
   id: string;
   name: string;
   createdAt: number;
   order: string[];
}

export const CATEGORIES = [
   { id: 'frutas',    label: 'Frutas',     emoji: '🍎', border: 'border-l-red-400',    badge: 'bg-red-50 text-red-600',      pill: 'bg-red-500'    },
   { id: 'pasta',    label: 'Pasta',      emoji: '🍝', border: 'border-l-amber-500',    badge: 'bg-amber-50 text-amber-600',  pill: 'bg-amber-500'    },
   { id: 'verduras',  label: 'Verduras',   emoji: '🥦', border: 'border-l-green-500',  badge: 'bg-green-50 text-green-700',  pill: 'bg-green-500'  },
   { id: 'carnes',    label: 'Carnes',     emoji: '🥩', border: 'border-l-rose-500',   badge: 'bg-rose-50 text-rose-700',    pill: 'bg-rose-500'   },
   { id: 'pescado',   label: 'Pescado',    emoji: '🐟', border: 'border-l-blue-400',   badge: 'bg-blue-50 text-blue-700',    pill: 'bg-blue-500'   },
   { id: 'lacteos',   label: 'Lácteos',   emoji: '🥛', border: 'border-l-cyan-400',   badge: 'bg-cyan-50 text-cyan-700',    pill: 'bg-cyan-500'   },
   { id: 'panaderia', label: 'Panadería', emoji: '🍞', border: 'border-l-amber-400',  badge: 'bg-amber-50 text-amber-700',  pill: 'bg-amber-500'  },
   { id: 'bebidas',   label: 'Bebidas',    emoji: '🧃', border: 'border-l-purple-400', badge: 'bg-purple-50 text-purple-700',pill: 'bg-purple-500' },
   { id: 'congelados',label: 'Congelados', emoji: '🧊', border: 'border-l-sky-400',    badge: 'bg-sky-50 text-sky-700',      pill: 'bg-sky-500'    },
   { id: 'conservas', label: 'Conservas',  emoji: '🥫', border: 'border-l-orange-400', badge: 'bg-orange-50 text-orange-700',pill: 'bg-orange-500' },
   { id: 'limpieza',  label: 'Limpieza',   emoji: '🧹', border: 'border-l-teal-500',   badge: 'bg-teal-50 text-teal-700',    pill: 'bg-teal-500'   },
   { id: 'higiene',   label: 'Higiene',    emoji: '🧴', border: 'border-l-pink-400',   badge: 'bg-pink-50 text-pink-700',    pill: 'bg-pink-500'   },
   { id: 'otros',     label: 'Otros',      emoji: '📦', border: 'border-l-gray-400',   badge: 'bg-gray-50 text-gray-600',    pill: 'bg-gray-500'   },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export interface Todo {
   id: string;
   text: string;
   completed: boolean;
   quantity?: number;
   unit?: string;
   category?: CategoryId;
   price?: number;
   notes?: string;
   createdAt: number;
}

export interface ToastItem {
   id: string;
   message: string;
   onUndo?: () => void;
}

export const UNITS = ['ud', 'kg', 'g', 'L', 'mL', 'pack'] as const;
export type Unit = (typeof UNITS)[number];

export const NONE_CATEGORY = '__none__';

// ── Plantillas ──────────────────────────────────────────────────────────────

export interface TemplateItem {
   text: string;
   category?: CategoryId;
   quantity?: number;
   unit?: string;
   price?: number;
   notes?: string;
}

export interface Template {
   id: string;
   name: string;
   createdAt: number;
   items: TemplateItem[];
}

// ── Historial ───────────────────────────────────────────────────────────────

export interface HistoryItem extends TemplateItem {
   completed: boolean;
}

export interface HistoryRecord {
   id: string;
   date: number;
   listName: string;
   itemCount: number;
   completedCount: number;
   totalPrice: number;
   items: HistoryItem[];
}
