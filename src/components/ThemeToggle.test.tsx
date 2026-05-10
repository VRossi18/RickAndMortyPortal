import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
   beforeEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute('data-theme');
   });

   it('toggles data-theme on the document when clicked', async () => {
      render(<ThemeToggle />);
      await waitFor(() => {
         expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });

      fireEvent.click(screen.getByRole('button', { name: /trocar tema/i }));

      await waitFor(() => {
         expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
   });
});
