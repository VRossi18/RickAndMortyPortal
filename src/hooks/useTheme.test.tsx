import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTheme } from './useTheme';

describe('useTheme', () => {
   beforeEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute('data-theme');
   });

   it('syncs theme to document and localStorage when toggled', async () => {
      const { result } = renderHook(() => useTheme());

      await waitFor(() => {
         expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });
      expect(localStorage.getItem('theme')).toBe('light');

      act(() => {
         result.current.toggleTheme();
      });

      await waitFor(() => {
         expect(result.current.theme).toBe('dark');
         expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
         expect(localStorage.getItem('theme')).toBe('dark');
      });
   });
});
