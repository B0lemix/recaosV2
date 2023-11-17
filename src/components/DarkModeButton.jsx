import useDarkMode from '../hooks/useDarkMode';
import React, { useState } from 'react';

const DarkModeButton = () => {
   const [colorTheme, setTheme] = useDarkMode();
   const [dark, setDark] = useState(colorTheme === 'light' ? true : false);

   const toggleDarkMode = () => {
      setTheme(colorTheme);
      setDark(!dark);
   };

   return (
      <div>
         <button
            id="theme-toggle"
            type="button"
            className="rounded-lg p-2.5  text-black hover:scale-125 transition-all duration-300 ease-in-out  font-['letter']   flex flex-row items-center gap-2"
            onClick={toggleDarkMode}
         >
            {/*   className="rounded-lg p-2.5  text-black hover:bg-gray-100  font-['letter'] focus:outline-none focus:ring-4 focus:ring-gray-200  flex flex-row items-center gap-2" */}
            {!dark ? (
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-moon  "
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
               </svg>
            ) : (
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-sun-filled"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path
                     d="M12 19a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 1 1 -1z"
                     strokeWidth="0"
                     fill="currentColor"
                  />
                  <path
                     d="M18.313 16.91l.094 .083l.7 .7a1 1 0 0 1 -1.32 1.497l-.094 -.083l-.7 -.7a1 1 0 0 1 1.218 -1.567l.102 .07z"
                     strokeWidth="0"
                     fill="currentColor"
                  />
                  <path
                     d="M7.007 16.993a1 1 0 0 1 .083 1.32l-.083 .094l-.7 .7a1 1 0 0 1 -1.497 -1.32l.083 -.094l.7 -.7a1 1 0 0 1 1.414 0z"
                     strokeWidth="0"
                     fill="currentColor"
                  />
                  <path
                     d="M4 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"
                     strokeWidth="0"
                     fill="currentColor"
                  />
                  <path
                     d="M21 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"
                     strokeWidth="0"
                     fill="currentColor"
                  />
                  <path
                     d="M6.213 4.81l.094 .083l.7 .7a1 1 0 0 1 -1.32 1.497l-.094 -.083l-.7 -.7a1 1 0 0 1 1.217 -1.567l.102 .07z"
                     strokeWidth="0"
                     fill="currentColor"
                  />
                  <path
                     d="M19.107 4.893a1 1 0 0 1 .083 1.32l-.083 .094l-.7 .7a1 1 0 0 1 -1.497 -1.32l.083 -.094l.7 -.7a1 1 0 0 1 1.414 0z"
                     strokeWidth="0"
                     fill="currentColor"
                  />
                  <path
                     d="M12 2a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 1 1 -1z"
                     strokeWidth="0"
                     fill="currentColor"
                  />
                  <path
                     d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z"
                     strokeWidth="0"
                     fill="currentColor"
                  />
               </svg>
            )}
            <div className="flex flex-col items-center text-lg md:text-xl">
               <span>Modo</span>
               <span>{dark ? 'Claro' : 'Oscuro'}</span>
            </div>
         </button>
      </div>
   );
};
export default DarkModeButton;
