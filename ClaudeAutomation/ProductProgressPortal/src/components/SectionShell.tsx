import { useConfig } from '../config/ConfigContext';

interface SectionShellProps {
  title: string;
  loading: boolean;
  error: string | null;
  empty?: boolean;
  configKey?: string;
  onRefetch?: () => void;
  children: React.ReactNode;
}

export function SectionShell({ title, loading, error, empty, configKey, onRefetch, children }: SectionShellProps) {
  const { isConfigured } = useConfig();

  if (!isConfigured) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
        <p className="text-gray-400 text-sm">
          <span className="font-medium">{title}</span> — not configured.{' '}
          <a href="/admin/connect" className="text-blue-600 hover:underline">Go to Admin → Sheet Connector</a> to link your Google Sheet.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-400 text-sm">Loading {title}…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-700 text-sm font-medium mb-1">Failed to load {title}</p>
        <p className="text-red-600 text-xs font-mono mb-3">{error}</p>
        {onRefetch && (
          <button onClick={onRefetch} className="text-xs text-red-700 underline">Retry</button>
        )}
        {configKey && (
          <p className="text-xs text-red-600 mt-1">Check that tab <code className="bg-red-100 px-1 rounded">{configKey}</code> exists in your spreadsheet.</p>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
        <p className="text-gray-400 text-sm">No data in {title} yet.</p>
      </div>
    );
  }

  return <>{children}</>;
}
