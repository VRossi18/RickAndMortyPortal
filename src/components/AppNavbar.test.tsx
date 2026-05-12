import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell';
import { AboutPage } from '../pages/AboutPage';
import { HomePage } from '../pages/HomePage';

function renderShell(initialPath: string) {
   return render(
      <MemoryRouter initialEntries={[initialPath]}>
         <Routes>
            <Route path="/" element={<AppShell />}>
               <Route path="characters" element={<HomePage />} />
               <Route path="about" element={<AboutPage />} />
            </Route>
         </Routes>
      </MemoryRouter>,
   );
}

describe('AppNavbar', () => {
   it('renders both tabs', () => {
      renderShell('/characters');
      expect(screen.getByRole('link', { name: 'Sobre mim' })).toHaveAttribute('href', '/about');
      expect(screen.getByRole('link', { name: 'Rick & Morty personagens' })).toHaveAttribute(
         'href',
         '/characters',
      );
   });

   it('marks the characters tab active on /characters', () => {
      renderShell('/characters');
      const chars = screen.getByRole('link', { name: 'Rick & Morty personagens' });
      expect(chars.className).toMatch(/border-primary/);
   });

   it('marks the about tab active on /about', () => {
      renderShell('/about');
      const about = screen.getByRole('link', { name: 'Sobre mim' });
      expect(about.className).toMatch(/border-primary/);
   });
});
