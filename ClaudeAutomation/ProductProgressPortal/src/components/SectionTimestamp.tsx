import { useStore } from '../store/DataStore';

export function SectionTimestamp({ sectionKey }: { sectionKey: string }) {
  const { data } = useStore();
  const ts = data._sectionUpdatedAt?.[sectionKey];
  if (!ts) return null;
  const d = new Date(ts);
  return (
    <span className="text-xs text-gray-400 shrink-0">
      Updated {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
    </span>
  );
}
