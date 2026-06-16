import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useConfig } from '../../config/ConfigContext';
import { fetchSheetRows } from '../../sheets/sheetsApi';

interface DataPreviewProps {
  tabKey: keyof ReturnType<typeof useConfig>['config']['tabs'];
  title: string;
  description: string;
  icon: string;
}

export function DataPreview({ tabKey, title, description, icon }: DataPreviewProps) {
  const { user } = useAuth();
  const { config, isConfigured } = useConfig();
  const [rows, setRows] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabName = config.tabs[tabKey];
  const sheetsUrl = config.spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`
    : null;

  useEffect(() => {
    if (!user || !isConfigured || !tabName) return;
    setLoading(true);
    setError(null);
    fetchSheetRows(config.spreadsheetId, tabName, user.accessToken)
      .then(setRows)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, isConfigured, config.spreadsheetId, tabName]);

  const headers = rows?.[0] ?? [];
  const dataRows = rows?.slice(1) ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
        </div>
        {sheetsUrl && (
          <a
            href={sheetsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            Open in Google Sheets ↗
          </a>
        )}
      </div>

      {!isConfigured && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-gray-400 text-sm">
            Configure your Google Spreadsheet first.{' '}
            <a href="/admin/connect" className="text-blue-600 hover:underline">Go to Sheet Connector</a>
          </p>
        </div>
      )}

      {isConfigured && loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Loading from tab <code className="bg-gray-100 px-1 rounded">{tabName}</code>…</p>
        </div>
      )}

      {isConfigured && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-700 text-sm font-medium mb-1">Failed to load data</p>
          <p className="text-red-600 text-xs font-mono">{error}</p>
          <p className="text-xs text-red-600 mt-2">
            Check that tab <code className="bg-red-100 px-1 rounded">{tabName}</code> exists in your spreadsheet.
            <a href="/admin/connect" className="ml-2 underline">Update in Sheet Connector</a>
          </p>
        </div>
      )}

      {isConfigured && rows && !loading && (
        <>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">Tab: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{tabName}</code></span>
            <span className="text-gray-400">{dataRows.length} rows · {headers.length} columns</span>
          </div>

          {dataRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
              <p className="text-gray-400 text-sm">No data rows found in tab <strong>{tabName}</strong>.</p>
              <p className="text-gray-400 text-xs mt-1">Add data to your Google Sheet and refresh.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-400 uppercase tracking-wide w-8">#</th>
                    {headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataRows.slice(0, 50).map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400">{rowIdx + 1}</td>
                      {headers.map((_, colIdx) => (
                        <td key={colIdx} className="px-3 py-2 text-gray-700 max-w-xs truncate">
                          {row[colIdx] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {dataRows.length > 50 && (
                <p className="px-4 py-2.5 text-xs text-gray-400 border-t border-gray-100">
                  Showing 50 of {dataRows.length} rows. Open in Google Sheets to see all.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
