import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from './AppNavbar';
import { ThemeToggle } from './ThemeToggle';

export function AppShell() {
   const { t, i18n } = useTranslation('common');

   useEffect(() => {
      document.title = t('meta.appTitle');
   }, [t, i18n.language]);

   return (
      <div className="flex min-h-screen flex-col">
         <AppNavbar />
         <div className="flex-1">
            <Outlet />
         </div>
         <ThemeToggle />
      </div>
   );
}
