import { useState, useEffect } from 'react';
import { fetchSheetRows } from './sheetsApi';
import { useAuth } from '../auth/AuthContext';
import { useConfig } from '../config/ConfigContext';

interface SheetDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSheetData<T>(
  tabKey: keyof ReturnType<typeof useConfig>['config']['tabs'],
  transform: (rows: string[][]) => T
): SheetDataResult<T> {
  const { user } = useAuth();
  const { config, isConfigured } = useConfig();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const tabName = config.tabs[tabKey];

  useEffect(() => {
    if (!user || !isConfigured || !tabName) return;
    setLoading(true);
    setError(null);
    fetchSheetRows(config.spreadsheetId, tabName, user.accessToken)
      .then(rows => {
        if (rows.length < 2) { setData(transform([])); return; }
        setData(transform(rows));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, isConfigured, config.spreadsheetId, tabName, tick]);

  return { data, loading, error, refetch: () => setTick(t => t + 1) };
}
