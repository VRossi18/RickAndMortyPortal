import { AxiosError } from 'axios';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import { CharacterService } from '../services/characters';
import type { Character } from '../types/api';
import { CharacterDetailPage } from './CharacterDetailPage';

vi.mock('../services/characters', () => ({
   CharacterService: {
      getCharacterById: vi.fn(),
   },
}));

const mockCharacter: Character = {
   id: 2,
   name: 'Morty Smith',
   status: 'Alive',
   species: 'Human',
   type: '',
   gender: 'Male',
   origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
   location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/20' },
   image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
   episode: ['https://rickandmortyapi.com/api/episode/1'],
   url: 'https://rickandmortyapi.com/api/character/2',
   created: '2017-11-04T18:50:21.651Z',
};

function renderAt(path: string) {
   return render(
      <MemoryRouter initialEntries={[path]}>
         <Routes>
            <Route path="/character/:id" element={<CharacterDetailPage />} />
         </Routes>
      </MemoryRouter>,
   );
}

describe('CharacterDetailPage', () => {
   beforeEach(() => {
      vi.mocked(CharacterService.getCharacterById).mockReset();
   });

   it('shows invalid id message without calling the API', () => {
      renderAt('/character/abc');

      expect(CharacterService.getCharacterById).not.toHaveBeenCalled();
      expect(screen.getByText(i18n.t('characterDetail.errorInvalidId'))).toBeInTheDocument();
   });

   it('loads character and shows fields', async () => {
      vi.mocked(CharacterService.getCharacterById).mockResolvedValue(mockCharacter);

      renderAt('/character/2');

      expect(await screen.findByRole('heading', { name: 'Morty Smith' })).toBeInTheDocument();
      expect(
         screen.getByText(i18n.t('characterDetail.episodeCount', { count: 1 })),
      ).toBeInTheDocument();
      expect(CharacterService.getCharacterById).toHaveBeenCalledWith(2);
   });

   it('shows not found when API returns 404', async () => {
      const err = new AxiosError('Not Found');
      err.response = {
         status: 404,
         data: {},
         statusText: 'Not Found',
         headers: {},
         config: {} as never,
      };
      vi.mocked(CharacterService.getCharacterById).mockRejectedValue(err);

      renderAt('/character/999');

      expect(await screen.findByText(i18n.t('characterDetail.errorNotFound'))).toBeInTheDocument();
   });
});
