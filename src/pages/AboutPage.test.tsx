import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
   it('renders name as main heading', () => {
      render(<AboutPage />);
      expect(screen.getByRole('heading', { level: 1, name: 'Vinicius Rossi' })).toBeInTheDocument();
   });

   it('renders portrait with accessible alt text', () => {
      render(<AboutPage />);
      expect(screen.getByRole('img', { name: /Retrato de Vinicius Rossi/i })).toHaveAttribute(
         'src',
         `${import.meta.env.BASE_URL}about/portrait.png`,
      );
   });

   it('renders mailto and external social links', () => {
      render(<AboutPage />);
      expect(screen.getByRole('link', { name: /Email/i })).toHaveAttribute(
         'href',
         'mailto:viniciusprossi18@gmail.com',
      );
      expect(screen.getByRole('link', { name: /LinkedIn/i })).toHaveAttribute(
         'href',
         'https://www.linkedin.com/in/vinicius-pimenta-rossi/',
      );
   });
});
