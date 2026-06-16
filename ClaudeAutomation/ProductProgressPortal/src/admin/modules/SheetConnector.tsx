import { useState } from 'react';
import { useConfig } from '../../config/ConfigContext';
import { DEFAULT_CONFIG } from '../../config/defaults';
import { useAuth } from '../../auth/AuthContext';
import { testConnection } from '../../sheets/sheetsApi';

export function SheetConnector() {
  const { config, saveConfig } = useConfig();
  const { user } = useAuth();

  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId);
  const [adminEmails, setAdminEmails] = useState(config.adminEmails.join('\n'));
  const [tabs, setTabs] = useState({ ...config.tabs });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; tabs?: string[]; error?: string } | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleTest() {
    if (!user || !spreadsheetId.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const foundTabs = await testConnection(spreadsheetId.trim(), user.accessToken);
      setTestResult({ ok: true, tabs: foundTabs });
    } catch (e: unknown) {
      setTestResult({ ok: false, error: e instanceof Error ? e.message : 'Failed' });
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    saveConfig({
      spreadsheetId: spreadsheetId.trim(),
      adminEmails: adminEmails.split('\n').map(e => e.trim()).filter(Boolean),
      tabs,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TAB_LABELS: Record<keyof typeof DEFAULT_CONFIG.tabs, string> = {
    executiveSummary: 'Executive Summary',
    productOverview: 'Product Overview',
    okrs: 'OKRs',
    budget: 'Budget',
    roadmap: 'Roadmap',
    metrics: 'Metrics',
    artifacts: 'Artifacts',
    conversations: 'Conversations',
    risks: 'Risks',
    decisions: 'Decisions',
    changelog: 'Changelog',
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Sheet Connector</h2>
        <p className="text-gray-500 text-sm">Connect your Google Spreadsheet to the portal</p>
      </div>

      {/* Spreadsheet ID */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm">Google Spreadsheet</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Spreadsheet ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={spreadsheetId}
              onChange={e => setSpreadsheetId(e.target.value)}
              placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTest}
              disabled={testing || !spreadsheetId.trim()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {testing ? 'Testing…' : 'Test'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Find the ID in the spreadsheet URL: docs.google.com/spreadsheets/d/<strong>ID</strong>/edit
          </p>
        </div>

        {testResult && (
          <div className={`rounded-lg p-4 ${testResult.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {testResult.ok ? (
              <div>
                <p className="text-green-800 font-medium text-sm mb-2">✓ Connected — {testResult.tabs?.length} tabs found</p>
                <div className="flex flex-wrap gap-1.5">
                  {testResult.tabs?.map(t => (
                    <span key={t} className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-mono">{t}</span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-red-700 text-sm">{testResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Tab mappings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Tab Mappings</h3>
          <p className="text-xs text-gray-500 mt-1">Map each portal section to a tab name in your spreadsheet</p>
        </div>
        <div className="space-y-3">
          {(Object.keys(DEFAULT_CONFIG.tabs) as Array<keyof typeof DEFAULT_CONFIG.tabs>).map(key => (
            <div key={key} className="flex items-center gap-3">
              <label className="w-40 text-xs font-medium text-gray-700 shrink-0">{TAB_LABELS[key]}</label>
              <input
                type="text"
                value={tabs[key]}
                onChange={e => setTabs(prev => ({ ...prev, [key]: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {testResult?.ok && (
                <span className={`text-xs ${testResult.tabs?.includes(tabs[key]) ? 'text-green-600' : 'text-red-500'}`}>
                  {testResult.tabs?.includes(tabs[key]) ? '✓' : '✗'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Admin emails */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Admin Emails</h3>
          <p className="text-xs text-gray-500 mt-1">One email per line. Leave blank to allow all signed-in users admin access.</p>
        </div>
        <textarea
          value={adminEmails}
          onChange={e => setAdminEmails(e.target.value)}
          rows={4}
          placeholder="admin@egovernments.org&#10;product@example.com"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {saved ? '✓ Saved' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
