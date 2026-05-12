import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';

const tabClass = ({ isActive }: { isActive: boolean }) =>
   clsx(
      'inline-flex items-center border-b-2 border-transparent px-3 py-3 text-sm font-semibold transition-colors md:px-4',
      isActive
         ? 'border-primary text-primary'
         : 'text-muted-foreground hover:text-foreground',
   );

export function AppNavbar() {
   const { t } = useTranslation('common');

   return (
      <header
         className="sticky top-0 z-40 border-b border-border bg-[var(--bg-color)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-color)]/80"
         role="navigation"
         aria-label={t('nav.ariaMain')}
      >
         <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4">
            <div className="flex min-w-0 flex-1 items-center gap-1 md:gap-2">
               <NavLink to="/about" className={tabClass}>
                  {t('nav.about')}
               </NavLink>
               <NavLink to="/characters" className={tabClass}>
                  {t('nav.characters')}
               </NavLink>
            </div>
            <LanguageSwitcher />
         </div>
      </header>
   );
}
