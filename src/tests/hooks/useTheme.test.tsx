import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTheme } from '../../hooks/useTheme';

describe('useTheme', () => {
   beforeEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
   });

   it('syncs theme to document, localStorage, and html.dark when toggled', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
         expect(document.documentElement.getAttribute('data-theme')).toBe('light');
         expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
      expect(localStorage.getItem('theme')).toBe('light');

      act(() => {
         result.current.toggleTheme();
      });

      await waitFor(() => {
         expect(result.current.theme).toBe('dark');
         expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
         expect(document.documentElement.classList.contains('dark')).toBe(true);
         expect(localStorage.getItem('theme')).toBe('dark');
      });
   });
});
