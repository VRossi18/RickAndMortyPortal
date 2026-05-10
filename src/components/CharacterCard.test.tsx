import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Character } from '../types/api';
import { CharacterCard } from './CharacterCard';

const character: Character = {
   id: 1,
   name: 'Rick Sanchez',
   status: 'Alive',
   species: 'Human',
   type: '',
   gender: 'Male',
   origin: { name: 'Earth (C-137)', url: '' },
   location: { name: 'Citadel of Ricks', url: '' },
   image: 'https://example.com/rick.png',
   episode: [],
   url: '',
   created: '',
};

describe('CharacterCard', () => {
   it('renders name, image alt, origin and location', () => {
      render(<CharacterCard character={character} />);
      expect(screen.getByRole('heading', { name: 'Rick Sanchez' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Rick Sanchez' })).toHaveAttribute(
         'src',
         'https://example.com/rick.png',
      );
      expect(screen.getByText(/Alive — Human/)).toBeInTheDocument();
      expect(screen.getByText(/Earth \(C-137\)/)).toBeInTheDocument();
      expect(screen.getByText(/Citadel of Ricks/)).toBeInTheDocument();
   });

   it('sets pointer CSS variables on mouse move', () => {
      render(<CharacterCard character={character} />);
      const card = screen.getByRole('heading', { name: 'Rick Sanchez' }).closest('.glow-card');
      expect(card).toBeTruthy();
      fireEvent.mouseMove(card as HTMLElement, { clientX: 42, clientY: 24 });
      expect(card).toHaveStyle({ '--mx': '42px', '--my': '24px' });
   });
});
