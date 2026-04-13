import useDarkMode from '../hooks/useDarkMode';

const MoonIcon = () => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
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
);

const SunIcon = () => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
   >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
      <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
   </svg>
);

export default function DarkModeButton() {
   const [theme, toggleTheme] = useDarkMode() as [string, () => void];
   const isDark = theme === 'dark';

   return (
      <button
         type="button"
         onClick={toggleTheme}
         className="rounded-lg p-2 text-black hover:scale-125 transition-all duration-300 ease-in-out font-['letter'] flex flex-row items-center gap-1.5"
         title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
         {isDark ? <SunIcon /> : <MoonIcon />}
         <div className="flex flex-col items-center text-base leading-tight">
            <span>Modo</span>
            <span>{isDark ? 'Claro' : 'Oscuro'}</span>
         </div>
      </button>
   );
}
