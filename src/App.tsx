import { useState, useEffect, useRef } from 'react';
import './App.css';
import { AiOutlinePlus, AiOutlineUnorderedList } from 'react-icons/ai';
import List from 'components/List';
import db from './firebase';
import {
   query,
   collection,
   onSnapshot,
   updateDoc,
   doc,
   addDoc,
   deleteDoc,
} from 'firebase/firestore';
import DarkModeButton from 'components/DarkModeButton';

const style = {
   bg: ' w-full h-screen p-4 bg-slate-200 dark:bg-neutral-800 ',
   img: 'object-cover h-36 w-full rounded-lg  ',
   container:
      "bg-[url('/bg-paper.jpg')] bg-center bg-[length:500px]  max-w-[500px] min-w-[450px]  m-auto rounded-md shadow-2xl p-4 font-semibold",
   heading: 'text-3xl font-bold text-center  text-gray-800 ',
   form: 'flex mb-2 justify-between ',
   input: 'border p-2 w-full text-xl shadow-md',
   button: 'border p-4 ml-2 bg-[#776b53] text-slate-100 hover:bg-[#8a8a72]',
   buttonOrder:
      'flex flex-row gap-4 items-center border p-2 ml-2 bg-[#776b53] text-slate-100 hover:bg-[#8a8a72]',
   count: "text-center p-2 mb-2 flex justify-center items-center text-3xl  font-['letter']",
   actions: 'flex flex-row justify-between mx-8',
};

function App() {
   const [data, setData] = useState([]);
   const [input, setInput] = useState('');
   const [editMode, setEditMode] = useState(false);
   const [editID, setEditID] = useState('');

   const inputElement = useRef();

   /*    const [scrollPosition, setScrollPosition] = useState(0);

    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
   };


   
   useEffect(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      console.log(scrollPosition);
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
   }, [scrollPosition]);

 */

   const [scrollPosition, setScrollPosition] = useState(0);

   function handleOnScroll() {
      const scrollTop = window.scrollY;
      const itemTranslate = Math.min(0, scrollTop / 3 - 80);
      setScrollPosition(itemTranslate);
   }

   useEffect(() => {
      window.addEventListener('scroll', handleOnScroll, { passive: true });
      /*  console.log(scrollPosition); */
      return () => {
         window.removeEventListener('scroll', handleOnScroll);
      };
   }, [scrollPosition]);

   //CREATE TODO

   const createDoc = async (e) => {
      e.preventDefault();
      input === '' ? alert('Entrada vacía') : null;

      if (!editMode) {
         await addDoc(collection(db, 'todos'), {
            text: input,
            completed: false,
         });

         setInput('');
      } else {
         await updateDoc(doc(db, 'todos', editID), {
            text: input,
         });
         console.log('updated');
         console.log(input);
      }
      setEditMode(false);
      setInput('');
   };

   //READ TODO

   useEffect(() => {
      const q = query(collection(db, 'todos'));
      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
         const todosArr = [];
         QuerySnapshot.forEach((doc) => {
            todosArr.push({ ...doc.data(), id: doc.id });
         });
         setData(todosArr);
      });
      return () => unsubscribe();
   }, []);

   //UPDATE TODO

   const toggleComplete = async (data) => {
      await updateDoc(doc(db, 'todos', data.id), {
         completed: !data.completed,
      });
   };

   const editToDo = async (data) => {
      console.log(data);

      setEditMode(true);
      setEditID(data.id);
      setInput(data.text);
   };

   //DELETE TODO

   const deleteToDo = async (id) => {
      await deleteDoc(doc(db, 'todos', id));
   };

   const sortData = () => {
      /*  console.log(data.sort((a,b) => (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0))); */
      const orderAZ = data.sort((a, b) => (a.text > b.text ? 1 : b.text > a.text ? -1 : 0));
      console.log(orderAZ);

      return setData(orderAZ);
   };

   useEffect(() => {
      console.log(data, 'data');
   }, [data]);

   return (
      <div className={style.bg}>
         <div className={style.container} onScroll={handleOnScroll}>
            <h3 className={style.heading}>
               <img className={style.img} src="/logo.svg" alt="logo"></img>{' '}
            </h3>

            {data.length < 1 ? null : (
               <p className={style.count}>
                  {' '}
                  Te quedan
                  <span className="text-6xl font-bold px-4 animate-bounce-slow ">
                     {data.filter((pendientes) => pendientes.completed === false).length}
                  </span>
                  recaos pendientes
               </p>
            )}
            <form onSubmit={createDoc} className={style.form}>
               <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={style.input}
                  ref={inputElement}
                  type="text"
                  placeholder="Añadir recao"
               />
               <button className={style.button}>
                  <AiOutlinePlus size={30} />
               </button>
            </form>

            <ul>
               <div className={style.actions}>
                  <button className={style.buttonOrder} onClick={() => sortData()}>
                     <AiOutlineUnorderedList size={30} /> Ordenar
                  </button>
                  <DarkModeButton />
               </div>

               {data.map((element, index) => (
                  <List
                     key={index}
                     dataList={element}
                     toggleComplete={toggleComplete}
                     deleteToDo={deleteToDo}
                     editToDo={editToDo}
                     inputElement={inputElement}
                  />
               ))}
            </ul>

            <button
               type="button"
               className={
                  !(data.length > 7)
                     ? ''
                     : 'fixed bottom-48 right-3 inline-block rounded-full bg-gray-200 p-2 uppercase leading-normal text-gray-700 shadow-sm shadow-gray-900 hover:scale-150 hover:bg-white transition-all duration-500 scale-125'
               }
               onClick={
                  scrollPosition === 0
                     ? () => window.scrollTo(0, 0)
                     : () => window.scrollTo(0, document.body.scrollHeight)
               }
            >
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  strokeWidth="3"
                  stroke="currentColor"
                  className="h-5 w-5 animate-bounce"
               >
                  {scrollPosition === 0 ? (
                     <path
                        fillRule="evenodd"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"
                        clipRule="evenodd"
                     />
                  ) : (
                     <path
                        fillRule="evenodd"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12.0676 4.5003L11.9324 19.4997ZM11.9324 19.4997L18.743 12.8108ZM11.9324 19.4997L5.24352 12.6892Z"
                        clipRule="evenodd"
                     />
                  )}
               </svg>
            </button>
         </div>
      </div>
   );
}

export default App;
