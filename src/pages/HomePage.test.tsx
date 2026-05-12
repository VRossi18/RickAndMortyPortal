import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiResponse, Character } from '../types/api';
import { CharacterService } from '../services/characters';
import { HomePage } from './HomePage';

vi.mock('../services/characters', () => ({
   CharacterService: {
      getCharacters: vi.fn(),
   },
}));

const mockedGetCharacters = vi.mocked(CharacterService.getCharacters);

const sampleCharacter: Character = {
   id: 1,
   name: 'Rick Sanchez',
   status: 'Alive',
   species: 'Human',
   type: '',
   gender: 'Male',
   origin: { name: 'Earth', url: '' },
   location: { name: 'Earth', url: '' },
   image: 'https://example.com/rick.png',
   episode: [],
   url: '',
   created: '',
};

const listPayload: ApiResponse<Character> = {
   info: { count: 1, pages: 1, next: null, prev: null },
   results: [sampleCharacter],
};

function renderHome() {
   return render(
      <MemoryRouter>
         <HomePage />
      </MemoryRouter>,
   );
}

describe('HomePage', () => {
   beforeEach(() => {
      mockedGetCharacters.mockReset();
      mockedGetCharacters.mockResolvedValue(listPayload);
   });

   afterEach(() => {
      vi.useRealTimers();
   });

   it('loads characters on mount with page 1 and no filters', async () => {
      renderHome();
      await waitFor(() => {
         expect(mockedGetCharacters).toHaveBeenCalledWith(1, {});
      });
      expect(await screen.findByRole('heading', { name: /Rick Sanchez/i })).toBeInTheDocument();
   });

   it('renders search field and status filter', () => {
      renderHome();
      expect(screen.getByPlaceholderText(/Buscar por nome/i)).toBeInTheDocument();
      const statusSelect = screen.getByLabelText(/Status/i);
      expect(within(statusSelect).getByRole('option', { name: /Status \(todos\)/i })).toBeInTheDocument();
   });

   it('requests list with status when status filter changes', async () => {
      renderHome();
      await waitFor(() => expect(mockedGetCharacters).toHaveBeenCalled());

      mockedGetCharacters.mockClear();
      const statusSelect = screen.getByLabelText(/Status/i);
      fireEvent.change(statusSelect, { target: { value: 'alive' } });

      await waitFor(() => {
         expect(mockedGetCharacters).toHaveBeenCalledWith(1, { status: 'alive' });
      });
   });

   it('debounces name filter before calling the API', async () => {
      vi.useFakeTimers();
      renderHome();

      await act(async () => {
         await Promise.resolve();
      });

      expect(mockedGetCharacters).toHaveBeenCalled();
      mockedGetCharacters.mockClear();

      const input = screen.getByPlaceholderText(/Buscar por nome/i);
      fireEvent.change(input, { target: { value: 'Morty' } });

      expect(mockedGetCharacters).not.toHaveBeenCalled();

      await act(() => {
         vi.advanceTimersByTime(400);
      });
      await act(async () => {
         await Promise.resolve();
      });

      expect(mockedGetCharacters).toHaveBeenCalledWith(1, { name: 'Morty' });
   });

   it('clears all filters and refetches without params', async () => {
      renderHome();
      await waitFor(() => expect(mockedGetCharacters).toHaveBeenCalled());

      const clearBtn = screen.getByRole('button', { name: /Limpar filtros/i });
      expect(clearBtn).toBeDisabled();

      const statusSelect = screen.getByLabelText(/Status/i);
      fireEvent.change(statusSelect, { target: { value: 'alive' } });
      await waitFor(() => {
         expect(mockedGetCharacters).toHaveBeenCalledWith(1, { status: 'alive' });
      });

      mockedGetCharacters.mockClear();
      expect(clearBtn).not.toBeDisabled();
      fireEvent.click(clearBtn);

      await waitFor(() => {
         expect(mockedGetCharacters).toHaveBeenCalledWith(1, {});
      });
      expect(statusSelect).toHaveValue('');
   });
});
