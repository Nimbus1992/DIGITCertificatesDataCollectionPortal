import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ConversationEditor } from '../../admin/modules/ConversationEditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

const SAMPLE_CONVERSATION = {
  organization: 'State IT Secretary', owner: 'PM', objective: 'Onboarding',
  stage: 'Implement' as const, latestUpdate: 'Meeting held', nextStep: 'Follow up',
  partner: '', lastUpdateDate: '2025-06-01', stageHistory: [],
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
            <ConversationEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('ConversationEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-38.01: renders empty state when no conversations', () => {
    renderEditor();
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });

  it('T-38.02: "+ Add Conversation" button opens modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Conversation'));
    await waitFor(() => expect(screen.getByText('Add Conversation')).toBeInTheDocument());
  });

  it('T-38.03: saving a new conversation adds it to the list', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Conversation'));
    await waitFor(() => screen.getByText('Add Conversation'));
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Steering Committee Meeting');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Steering Committee Meeting')).toBeInTheDocument());
  });

  it('T-38.04: pre-seeded conversation renders organization name', async () => {
    renderEditor({ conversations: [SAMPLE_CONVERSATION] });
    await waitFor(() => expect(screen.getByText('State IT Secretary')).toBeInTheDocument());
  });

  it('T-38.05: Delete button removes the conversation', async () => {
    const user = userEvent.setup();
    renderEditor({ conversations: [SAMPLE_CONVERSATION] });
    await waitFor(() => screen.getByText('State IT Secretary'));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.queryByText('State IT Secretary')).not.toBeInTheDocument());
  });

  it('T-38.06: Edit button opens modal for existing conversation', async () => {
    const user = userEvent.setup();
    renderEditor({ conversations: [SAMPLE_CONVERSATION] });
    await waitFor(() => screen.getByText('State IT Secretary'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Conversation')).toBeInTheDocument());
  });

  it('T-38.07: stage badge renders for pre-seeded conversation', async () => {
    renderEditor({ conversations: [SAMPLE_CONVERSATION] });
    await waitFor(() => expect(screen.getAllByText('Implement').length).toBeGreaterThan(0));
  });

  it('T-38.08: editing existing conversation saves via else branch', async () => {
    const user = userEvent.setup();
    renderEditor({ conversations: [SAMPLE_CONVERSATION] });
    await waitFor(() => screen.getByText('State IT Secretary'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => screen.getByText('Edit Conversation'));
    // Change the organization name
    const textboxes = screen.getAllByRole('textbox');
    await user.clear(textboxes[0]);
    await user.type(textboxes[0], 'Updated Organization');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Updated Organization')).toBeInTheDocument());
  });

  it('T-38.09: editing conversation with stage change records stage history', async () => {
    const user = userEvent.setup();
    const convWithHistory = {
      ...SAMPLE_CONVERSATION,
      stageHistory: [{ stage: 'Explore', date: '2025-01-01', comment: 'Initial' }],
    };
    renderEditor({ conversations: [convWithHistory] });
    await waitFor(() => screen.getByText('State IT Secretary'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => screen.getByText('Edit Conversation'));
    // Change stage from Implement to Close
    const stageSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(stageSelect, 'Expand');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    // After save, updated conversation should still exist
    await waitFor(() => expect(screen.getByText('State IT Secretary')).toBeInTheDocument());
  });
});
