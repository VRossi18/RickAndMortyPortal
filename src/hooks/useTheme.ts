import { useEffect, useState } from 'react';

export const useTheme = () => {
   const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

   useEffect(() => {
      const html = document.documentElement;
      const isDark = theme === 'dark';

      html.setAttribute('data-theme', theme);
      html.classList.toggle('dark', isDark);
      localStorage.setItem('theme', theme);
   }, [theme]);

   const toggleTheme = () => {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
   };

   return { theme, toggleTheme };
};
