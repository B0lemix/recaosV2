import { useState, FormEvent } from 'react';
import { AiOutlinePlus, AiOutlineDelete } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';
import { List } from '../types';

interface Props {
   lists: List[];
   currentListId: string | null;
   onSelect: (id: string) => void;
   onCreate: (name: string) => void;
   onDelete: (list: List) => void;
   onClose: () => void;
}

export default function ListSelector({
   lists,
   currentListId,
   onSelect,
   onCreate,
   onDelete,
   onClose,
}: Props) {
   const [newName, setNewName] = useState('');

   const handleCreate = (e: FormEvent) => {
      e.preventDefault();
      if (!newName.trim()) return;
      onCreate(newName.trim());
      setNewName('');
   };

   return (
      <div className="fixed inset-0 z-40 flex flex-col bg-black/40">
         <div
            className="bg-[url('/bg-paper.jpg')] bg-center bg-[length:500px] lg:max-w-[500px] max-w-[500px] w-full m-auto rounded-md shadow-2xl flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
         >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-300">
               <h2 className="text-2xl font-['letter'] font-bold text-gray-800">Mis listas</h2>
               <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors">
                  <MdClose size={28} />
               </button>
            </div>

            {/* Lists */}
            <ul className="flex-1 overflow-y-auto p-3 space-y-2">
               {lists.length === 0 && (
                  <p className="text-center text-gray-500 font-['letter'] py-8">
                     No hay listas todavía. ¡Crea una!
                  </p>
               )}
               {lists.map((list) => (
                  <li key={list.id}>
                     <div
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                           list.id === currentListId
                              ? 'bg-amber-100 border-2 border-amber-400'
                              : 'bg-white/60 border border-stone-300 hover:bg-white/90'
                        }`}
                        onClick={() => {
                           onSelect(list.id);
                           onClose();
                        }}
                     >
                        <div>
                           <p className="font-['letter'] text-xl font-semibold text-gray-800">
                              {list.name}
                           </p>
                           <p className="font-['letter'] text-xs text-gray-400">
                              Creada el{' '}
                              {new Date(list.createdAt).toLocaleDateString('es-ES', {
                                 day: 'numeric',
                                 month: 'short',
                              })}
                           </p>
                        </div>
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`¿Eliminar "${list.name}"?`)) onDelete(list);
                           }}
                           className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2"
                           title="Eliminar lista"
                        >
                           <AiOutlineDelete size={20} />
                        </button>
                     </div>
                  </li>
               ))}
            </ul>

            {/* Create new list */}
            <form onSubmit={handleCreate} className="p-4 border-t border-stone-300 flex gap-2">
               <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre de la nueva lista..."
                  className="flex-1 border border-stone-300 rounded-lg px-3 py-2 font-['letter'] text-gray-800 bg-white/80 outline-0 focus:border-amber-400"
               />
               <button
                  type="submit"
                  className="bg-amber-500 text-white rounded-lg px-3 py-2 hover:bg-amber-600 transition-colors flex items-center gap-1 font-['letter'] shrink-0"
               >
                  <AiOutlinePlus size={20} /> Crear
               </button>
            </form>
         </div>
      </div>
   );
}
