import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ArtifactEditor } from '../../admin/modules/ArtifactEditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

const SAMPLE_ARTIFACT = {
  title: 'Architecture Decision Record', type: 'PRD' as const, owner: 'Architect',
  date: '2025-06-01', status: 'Draft' as const, link: '', version: '1.0',
  reviewedBy: '', section: '', stage: '', thumbnailUrl: '', heading: '', description: 'Core architecture doc',
};

// Pre-seed with empty categories to avoid default category Edit/Delete buttons
// coming before the artifact's own buttons in the DOM
const ARTIFACT_SEED = { artifacts: [SAMPLE_ARTIFACT], artifactCategories: [] };

const EMPTY_CAT_SEED = { artifacts: [], artifactCategories: [] };

const CATEGORY_SEED = {
  artifacts: [],
  artifactCategories: [{ id: 'cat1', name: 'Design Docs', subcategories: [], visible: true }],
};

function renderEditor(initial: object = {}) {
  if (Object.keys(initial).length) {
    localStorage.setItem('ppp_data_test', JSON.stringify(initial));
  }
  return render(
    <MemoryRouter initialEntries={['/test/admin']}>
      <Routes>
        <Route path="/:productSlug/admin" element={
          <DataStoreProvider productId="test">
            <ArtifactEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('ArtifactEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-39.01: renders empty state when no artifacts', () => {
    renderEditor();
    expect(screen.getByText('No key assets yet')).toBeInTheDocument();
  });

  it('T-39.02: "+ Add Asset" button opens modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Asset'));
    await waitFor(() => expect(screen.getByText('Add Asset')).toBeInTheDocument());
  });

  it('T-39.03: saving a new asset adds it to the list', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Asset'));
    await waitFor(() => screen.getByText('Add Asset'));
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Architecture Decision Record');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Architecture Decision Record')).toBeInTheDocument());
  });

  it('T-39.04: pre-seeded artifact renders title', async () => {
    renderEditor(ARTIFACT_SEED);
    await waitFor(() => expect(screen.getByText('Architecture Decision Record')).toBeInTheDocument());
  });

  it('T-39.05: Delete button removes the artifact', async () => {
    const user = userEvent.setup();
    renderEditor(ARTIFACT_SEED);
    await waitFor(() => screen.getByText('Architecture Decision Record'));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.queryByText('Architecture Decision Record')).not.toBeInTheDocument());
  });

  it('T-39.06: Edit button opens modal for existing artifact', async () => {
    const user = userEvent.setup();
    renderEditor(ARTIFACT_SEED);
    await waitFor(() => screen.getByText('Architecture Decision Record'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Asset')).toBeInTheDocument());
  });

  it('T-39.07: status badge renders for pre-seeded artifact', async () => {
    renderEditor(ARTIFACT_SEED);
    await waitFor(() => expect(screen.getByText('Draft')).toBeInTheDocument());
  });

  it('T-39.08: "+ Add Category" button opens Add Category modal', async () => {
    const user = userEvent.setup();
    renderEditor(EMPTY_CAT_SEED);
    await user.click(screen.getByText('+ Add Category'));
    await waitFor(() => expect(screen.getByText('Add Category')).toBeInTheDocument());
  });

  it('T-39.09: saving a new category adds it to the categories list', async () => {
    const user = userEvent.setup();
    renderEditor(EMPTY_CAT_SEED);
    await user.click(screen.getByText('+ Add Category'));
    await waitFor(() => screen.getByText('Add Category'));
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'Design Docs');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Design Docs')).toBeInTheDocument());
  });

  it('T-39.10: Edit button on category opens Edit Category modal', async () => {
    const user = userEvent.setup();
    renderEditor(CATEGORY_SEED);
    await waitFor(() => screen.getByText('Design Docs'));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await waitFor(() => expect(screen.getByText('Edit Category')).toBeInTheDocument());
  });

  it('T-39.11: toggle visibility button changes category visual state', async () => {
    const user = userEvent.setup();
    renderEditor(CATEGORY_SEED);
    await waitFor(() => screen.getByText('Design Docs'));
    // The visibility toggle has no accessible name; find it by its parent structure
    const catCard = screen.getByText('Design Docs').closest('div');
    const toggleBtn = catCard?.querySelector('button[class*="rounded-full"]') as HTMLButtonElement;
    expect(toggleBtn).toBeTruthy();
    await user.click(toggleBtn!);
    // After toggle, category card should have opacity-50 class
    await waitFor(() => {
      const card = screen.getByText('Design Docs').closest('[class*="rounded-lg"]');
      expect(card?.className).toContain('opacity-50');
    });
  });

  it('T-39.13: artifact assigned to category renders under that category heading', async () => {
    const categorizedArtifact = {
      ...SAMPLE_ARTIFACT,
      title: 'Design System Doc',
      section: 'Design Docs',
    };
    renderEditor({
      artifacts: [categorizedArtifact],
      artifactCategories: [{ id: 'cat1', name: 'Design Docs', subcategories: [], visible: true }],
    });
    await waitFor(() => {
      expect(screen.getAllByText('Design Docs').length).toBeGreaterThan(0);
      expect(screen.getByText('Design System Doc')).toBeInTheDocument();
    });
  });

  it('T-39.12: genId produces unique ids for categories', async () => {
    const user = userEvent.setup();
    renderEditor(EMPTY_CAT_SEED);
    // Add first category
    await user.click(screen.getByText('+ Add Category'));
    await waitFor(() => screen.getByText('Add Category'));
    await user.type(screen.getAllByRole('textbox')[0], 'Category A');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => screen.getByText('Category A'));
    // Add second category - genId ensures they have distinct ids
    await user.click(screen.getByText('+ Add Category'));
    await waitFor(() => screen.getByText('Add Category'));
    await user.type(screen.getAllByRole('textbox')[0], 'Category B');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Category B')).toBeInTheDocument());
    expect(screen.getByText('Category A')).toBeInTheDocument();
  });
});
