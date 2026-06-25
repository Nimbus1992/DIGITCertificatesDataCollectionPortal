import '@testing-library/jest-dom';
import { vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
});

// Silence Recharts ResizeObserver noise in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Stub import.meta.env for all tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'http://localhost:54321',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_GOOGLE_CLIENT_ID: '',
  },
  writable: true,
  configurable: true,
});

// Silence SVG / canvas warnings from Recharts
vi.stubGlobal('SVGElement', class {});
