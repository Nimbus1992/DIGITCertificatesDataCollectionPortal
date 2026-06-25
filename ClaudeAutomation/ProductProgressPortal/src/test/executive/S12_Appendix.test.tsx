import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S12_Appendix } from '../../executive/sections/S12_Appendix';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderSection() {
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/appendix']}>
      <Routes>
        <Route path="/:productSlug/executive/appendix" element={
          <DataStoreProvider productId="lnp_pub">
            <S12_Appendix />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('S12_Appendix', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('T-48.01: renders Appendix heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: /Appendix/i })).toBeInTheDocument();
  });

  it('T-48.02: contains "OKR" definition in the glossary', () => {
    renderSection();
    expect(screen.getByText('OKR')).toBeInTheDocument();
  });
});
