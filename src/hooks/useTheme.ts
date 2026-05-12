import { useEffect, useState } from 'react';

export const useTheme = () => {
   const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

   useEffect(() => {
      const html = document.documentElement;
      const isDark = theme === 'dark';

      // FlyonUI / Daisy-style hook (optional consumers)
      html.setAttribute('data-theme', theme);

      // Tailwind @custom-variant dark (&:is(.dark *)) + bloco .dark em index.css
      html.classList.toggle('dark', isDark);

      localStorage.setItem('theme', theme);
   }, [theme]);

   const toggleTheme = () => {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
   };

   return { theme, toggleTheme };
};
