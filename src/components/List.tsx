import { FaRegTrashAlt, FaRegEdit } from 'react-icons/fa';

interface Todo {
   id: string;
   text: string;
   completed: boolean;
}

interface ListProps {
   todo: Todo;
   toggleComplete: (todo: Todo) => void;
   deleteTodo: (id: string) => void;
   startEdit: (todo: Todo) => void;
}

const List = ({ todo, toggleComplete, deleteTodo, startEdit }: ListProps) => {
   return (
      <li
         className={`flex justify-between items-center my-3 mx-2 font-['letter'] transition-opacity duration-300 ${
            todo.completed ? 'opacity-50' : ''
         }`}
      >
         <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
               onChange={() => toggleComplete(todo)}
               type="checkbox"
               checked={todo.completed}
               className="w-5 h-5 shrink-0 cursor-pointer accent-amber-600"
            />
            <p
               onClick={() => toggleComplete(todo)}
               className={`cursor-pointer break-all transition-all duration-300 uppercase ${
                  todo.completed
                     ? 'line-through text-gray-400 text-xl decoration-red-400 decoration-2'
                     : 'text-xl md:text-3xl font-thin hover:scale-105 transform'
               }`}
            >
               {todo.text}
            </p>
         </div>

         <div className="flex gap-4 ml-4 shrink-0">
            <button
               onClick={() => startEdit(todo)}
               className="text-gray-600 hover:text-black transition-colors duration-200"
               title="Editar"
            >
               <FaRegEdit className="transform transition duration-200 hover:scale-125" size={20} />
            </button>
            <button
               onClick={() => deleteTodo(todo.id)}
               className="text-gray-600 hover:text-red-500 transition-colors duration-200"
               title="Eliminar"
            >
               <FaRegTrashAlt
                  className="transform transition duration-200 hover:scale-125"
                  size={20}
               />
            </button>
         </div>
      </li>
   );
};

export default List;
