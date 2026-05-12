import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import i18n, { LOCALE_STORAGE_KEY } from '../i18n';

afterEach(() => {
   cleanup();
   void i18n.changeLanguage('pt');
   localStorage.removeItem(LOCALE_STORAGE_KEY);
});
