import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React, { useEffect } from 'react';
import { DataStoreProvider, useStore } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function Harness({ onData }: { onData: (store: ReturnType<typeof useStore>) => void }) {
  const store = useStore();
  useEffect(() => { onData(store); }, [store, onData]);
  return <div data-testid="harness">{String(store.data._versionMeta?.hasUnpublishedChanges ?? false)}</div>;
}

function wrap(productId = 'test') {
  let captured: ReturnType<typeof useStore> | null = null;
  const Wrapper = () => (
    <DataStoreProvider productId={productId}>
      <Harness onData={store => { captured = store; }} />
    </DataStoreProvider>
  );
  const utils = render(<Wrapper />);
  const get = () => captured!;
  return { ...utils, get };
}

describe('DataStoreProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-13.01: set() updates the key in context data', async () => {
    const { get } = wrap();
    act(() => {
      get().set('risks', [{ description: 'Test Risk', severity: 'High', probability: 3, impact: 4, owner: '', mitigation: '', eta: '', status: 'Open' }]);
    });
    await waitFor(() => {
      expect(get().data.risks).toHaveLength(1);
      expect(get().data.risks[0].description).toBe('Test Risk');
    });
  });

  it('T-13.02: set() updates _sectionUpdatedAt for a mapped key', async () => {
    const { get } = wrap();
    act(() => { get().set('risks', []); });
    await waitFor(() => {
      expect(get().data._sectionUpdatedAt?.risks).toBeTruthy();
    });
  });

  it('T-13.03: set() sets hasUnpublishedChanges to true', async () => {
    const { get } = wrap();
    expect(get().data._versionMeta?.hasUnpublishedChanges).toBe(false);
    act(() => { get().set('risks', []); });
    await waitFor(() => {
      expect(get().data._versionMeta?.hasUnpublishedChanges).toBe(true);
    });
  });

  it('T-13.04: set() bumps draftVersion when publishedVersion exists', async () => {
    // Pre-seed localStorage with a published version
    localStorage.setItem('ppp_data_test', JSON.stringify({
      _versionMeta: { draftVersion: '1.0', publishedVersion: '1.0', hasUnpublishedChanges: false },
    }));
    const { get } = wrap();
    await waitFor(() => expect(get().data._versionMeta?.draftVersion).toBe('1.0'));
    act(() => { get().set('risks', []); });
    await waitFor(() => {
      expect(get().data._versionMeta?.draftVersion).toBe('1.1');
    });
  });

  it('T-13.05: set() does NOT bump version for _versionMeta key itself', async () => {
    const { get } = wrap();
    const initial = get().data._versionMeta?.draftVersion;
    act(() => {
      get().set('_versionMeta', { draftVersion: '2.0', hasUnpublishedChanges: false });
    });
    await waitFor(() => {
      // draftVersion was explicitly set to 2.0, no auto-bump happened on top
      expect(get().data._versionMeta?.draftVersion).toBe('2.0');
    });
    // No additional bump should have occurred
    expect(get().data._versionMeta?.draftVersion).not.toBe(
      `${initial?.split('.')[0]}.${parseInt(initial?.split('.')[1] ?? '0', 10) + 1}`
    );
  });

  it('T-13.06: publish() marks hasUnpublishedChanges false', async () => {
    const { get } = wrap();
    act(() => { get().set('risks', []); });
    await waitFor(() => expect(get().data._versionMeta?.hasUnpublishedChanges).toBe(true));

    await act(async () => { await get().publish(); });
    await waitFor(() => {
      expect(get().data._versionMeta?.hasUnpublishedChanges).toBe(false);
    });
  });

  it('T-13.07: publish() is a no-op when productId ends in _pub', async () => {
    const { get } = wrap('test_pub');
    const result = await act(async () => get().publish());
    expect(result.version).toBe('');
  });

  it('T-13.08: reset() removes data from localStorage', async () => {
    const { get } = wrap();
    act(() => { get().set('risks', [{ description: 'R', severity: 'High', probability: 1, impact: 1, owner: '', mitigation: '', eta: '', status: '' }]); });
    await waitFor(() => expect(localStorage.getItem('ppp_data_test')).toBeTruthy());

    act(() => { get().reset(); });
    await waitFor(() => {
      expect(localStorage.getItem('ppp_data_test')).toBeNull();
    });
  });

  it('T-13.09: loads from localStorage on mount', async () => {
    localStorage.setItem('ppp_data_test', JSON.stringify({ risks: [{ description: 'Persisted', severity: 'Low', probability: 1, impact: 1, owner: '', mitigation: '', eta: '', status: '' }] }));
    const { get } = wrap();
    await waitFor(() => {
      expect(get().data.risks[0]?.description).toBe('Persisted');
    });
  });

  it('T-13.10: useStore throws when called outside DataStoreProvider', () => {
    const Bad = () => { useStore(); return null; };
    // Suppress expected console.error from React
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow('useStore must be used within DataStoreProvider');
    spy.mockRestore();
  });
});
