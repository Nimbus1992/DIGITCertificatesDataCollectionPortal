import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select, Textarea } from '../../components/Field';
import type { GovernanceSession, GovernanceLevel } from '../../types';
import { VisibilityBanner } from '../VisibilityBanner';
import { RowActions, Empty } from './OKREditor';

const LEVEL_OPTIONS: { value: GovernanceLevel; label: string }[] = [
  { value: 'daily',        label: 'Daily Standup' },
  { value: 'fortnightly',  label: 'Fortnightly Showcase' },
  { value: 'exco',         label: 'ExCo Alignment' },
  { value: 'quarterly',    label: 'Ecosystem Showcase' },
];

const LEVEL_BADGE: Record<GovernanceLevel, string> = {
  daily:       'bg-gray-100 text-gray-700',
  fortnightly: 'bg-blue-100 text-blue-700',
  exco:        'bg-purple-100 text-purple-700',
  quarterly:   'bg-green-100 text-green-700',
};

function levelLabel(v: GovernanceLevel): string {
  return LEVEL_OPTIONS.find(o => o.value === v)?.label ?? v;
}

function fmtDate(d: string): string {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EMPTY_SESSION: Omit<GovernanceSession, 'id'> = {
  level: 'daily',
  date: '',
  presentationLink: '',
  keyPoints: [],
  attendees: '',
};

export function GovernanceEditor() {
  const { data, set } = useStore();
  const sessions = data.governanceSessions ?? [];

  const [modal, setModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [form, setForm] = useState<Omit<GovernanceSession, 'id'> & { keyPointsRaw: string }>({
    ...EMPTY_SESSION,
    keyPointsRaw: '',
  });

  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  function openAdd() {
    setForm({ ...EMPTY_SESSION, keyPointsRaw: '' });
    setModal({ open: true, id: null });
  }

  function openEdit(id: string) {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    setForm({
      level: session.level,
      date: session.date,
      presentationLink: session.presentationLink ?? '',
      keyPoints: session.keyPoints,
      attendees: session.attendees ?? '',
      keyPointsRaw: session.keyPoints.join('\n'),
    });
    setModal({ open: true, id });
  }

  function handleDelete(id: string) {
    set('governanceSessions', sessions.filter(s => s.id !== id));
  }

  function handleSave() {
    const keyPoints = form.keyPointsRaw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const session: GovernanceSession = {
      id: modal.id ?? Date.now().toString(),
      level: form.level,
      date: form.date,
      presentationLink: form.presentationLink?.trim() || undefined,
      keyPoints,
      attendees: form.attendees?.trim() || undefined,
    };

    if (modal.id === null) {
      set('governanceSessions', [...sessions, session]);
    } else {
      set('governanceSessions', sessions.map(s => s.id === modal.id ? session : s));
    }
    setModal({ open: false, id: null });
  }

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <VisibilityBanner visKey="governance" label="Governance" />
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Governance Log Editor</h2>
            <p className="text-gray-500 text-sm">{sessions.length} session{sessions.length !== 1 ? 's' : ''} logged</p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            + Add Session
          </button>
        </div>

        {sessions.length === 0 ? (
          <Empty label="governance sessions" onAdd={openAdd} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Level', 'Date', 'Key Points', 'Link', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(session => (
                  <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${LEVEL_BADGE[session.level]}`}>
                        {levelLabel(session.level)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtDate(session.date)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      {session.keyPoints.length === 0 ? (
                        <span className="text-gray-300 italic">—</span>
                      ) : (
                        <ul className="space-y-0.5">
                          {session.keyPoints.slice(0, 2).map((pt, i) => (
                            <li key={i} className="truncate max-w-xs">{pt}</li>
                          ))}
                          {session.keyPoints.length > 2 && (
                            <li className="text-gray-400">+{session.keyPoints.length - 2} more</li>
                          )}
                        </ul>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {session.presentationLink ? (
                        <a
                          href={session.presentationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions onEdit={() => openEdit(session.id)} onDelete={() => handleDelete(session.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <Modal
          title={modal.id === null ? 'Add Session' : 'Edit Session'}
          onClose={() => setModal({ open: false, id: null })}
          onSave={handleSave}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Level">
              <Select value={form.level} onChange={e => upd('level', e.target.value as GovernanceLevel)}>
                {LEVEL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={e => upd('date', e.target.value)} />
            </Field>
          </div>
          <Field label="Presentation Link (optional)">
            <Input
              type="url"
              value={form.presentationLink ?? ''}
              onChange={e => upd('presentationLink', e.target.value)}
              placeholder="https://slides.google.com/…"
            />
          </Field>
          <Field label="Key Points (one per line)">
            <Textarea
              rows={5}
              value={form.keyPointsRaw}
              onChange={e => upd('keyPointsRaw', e.target.value)}
              placeholder={`Reviewed roadmap progress\nSprint demo complete\n…`}
            />
          </Field>
          <Field label="Attendees (optional — overrides defaults)">
            <Input
              value={form.attendees ?? ''}
              onChange={e => upd('attendees', e.target.value)}
              placeholder="e.g. Viraj, Santhosh, Varun"
            />
          </Field>
        </Modal>
      )}
    </>
  );
}
