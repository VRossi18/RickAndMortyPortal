import clsx from 'clsx';
import { NavLink } from 'react-router-dom';

const tabClass = ({ isActive }: { isActive: boolean }) =>
   clsx(
      'inline-flex items-center border-b-2 border-transparent px-3 py-3 text-sm font-semibold transition-colors md:px-4',
      isActive
         ? 'border-primary text-primary'
         : 'text-muted-foreground hover:text-foreground',
   );

export function AppNavbar() {
   return (
      <header
         className="sticky top-0 z-40 border-b border-border bg-[var(--bg-color)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-color)]/80"
         role="navigation"
         aria-label="Principal"
      >
         <div className="mx-auto flex max-w-[1400px] items-center gap-1 px-4 md:gap-2">
            <NavLink to="/about" className={tabClass}>
               Sobre mim
            </NavLink>
            <NavLink to="/characters" className={tabClass}>
               Rick & Morty personagens
            </NavLink>
         </div>
      </header>
   );
}
