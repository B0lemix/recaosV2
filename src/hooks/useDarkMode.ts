import { useEffect, useState } from 'react';

export default function useDarkMode(): [string, () => void] {
   const [theme, setTheme] = useState<string>(() => {
      return localStorage.getItem('theme') || 'light';
   });

   useEffect(() => {
      const root = window.document.documentElement;
      root.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
   }, [theme]);

   const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

   return [theme, toggleTheme];
}
