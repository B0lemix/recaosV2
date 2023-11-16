/* eslint-disable react/prop-types */
import { FaRegTrashAlt, FaRegEdit } from 'react-icons/fa';

const List = ({ dataList, toggleComplete, deleteToDo, editToDo, inputElement }) => {
   const style = {
      li: "flex justify-between    mx-2 my-4 capitalize  text-xl md:text-3xl font-['letter'] uppercase",
      liCompleted:
         "flex justify-between my-1 capitalize  text-lg md:text-2xl  font-['letter'] uppercase",
      row: 'flex group  ',
      text: ' mx-8 cursor-pointer break-all transform  transition duration-500 hover:scale-110  ',
      textCompleted:
         'ml-2 cursor-pointer  transition-all text-2xl decoration-red-500/60 decoration-2 duration-500 ease-out',
      button: ' cursor-pointer flex items-center',
   };

   return (
      <li className={dataList.completed ? style.liCompleted : style.li}>
         <div className={style.row}>
            <input
               onChange={() => toggleComplete(dataList)}
               type="checkbox"
               checked={dataList.completed ? true : false}
            />
            <p
               onClick={() => toggleComplete(dataList)}
               className={dataList.completed ? style.textCompleted : style.text}
            >
               {dataList.text}
            </p>
         </div>
         <div className="flex gap-6 mr-10 text-xl">
            <button
               onClick={() => {
                  editToDo(dataList);
                  inputElement.current.focus();
               }}
            >
               <FaRegEdit className="transform transition duration-200 hover:scale-125" />
            </button>
            <button onClick={() => deleteToDo(dataList.id)}>
               <FaRegTrashAlt className="transform transition duration-200 hover:scale-125" />
            </button>
         </div>
      </li>
   );
};

export default List;
