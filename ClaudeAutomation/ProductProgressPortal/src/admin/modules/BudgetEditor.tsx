import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import { VisibilityBanner } from '../VisibilityBanner';
import type { BudgetRow } from '../../types';

const EMPTY: BudgetRow = { category: '', workstream: '', month: '', budgeted: 0, consumed: 0, remaining: 0, forecast: 0, variance: 0 };

function getMonthSuggestions(): string[] {
  const today = new Date();
  const result: string[] = [];
  for (let i = -5; i <= 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    result.push(d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  }
  return result;
}

export function BudgetEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<BudgetRow>(EMPTY);
  const [addNewCat, setAddNewCat] = useState(false);
  const [addNewWs, setAddNewWs] = useState(false);
  const [sortKey, setSortKey] = useState<'category' | 'workstream' | 'month' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [hlDraft, setHlDraft] = useState('');
  const [hlEditIdx, setHlEditIdx] = useState<number | null>(null);

  const highlights = data.budgetHighlights ?? [];
  const currency = data.budgetCurrency ?? 'INR';

  function fmt(n: number) {
    return n.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN');
  }

  function addHighlight() {
    const text = hlDraft.trim();
    if (!text) return;
    set('budgetHighlights', [...highlights, text]);
    setHlDraft('');
  }

  function saveHighlightEdit(idx: number, text: string) {
    const next = [...highlights];
    next[idx] = text;
    set('budgetHighlights', next);
    setHlEditIdx(null);
  }

  function deleteHighlight(idx: number) {
    set('budgetHighlights', highlights.filter((_, i) => i !== idx));
  }

  const rows = data.budget;
  const total = { budgeted: rows.reduce((s, r) => s + r.budgeted, 0), consumed: rows.reduce((s, r) => s + r.consumed, 0) };
  const pct = total.budgeted > 0 ? Math.round((total.consumed / total.budgeted) * 100) : 0;

  // Derive suggestions from existing rows
  const existingCategories = [...new Set(rows.map(r => r.category).filter(Boolean))];
  const existingWorkstreams = [...new Set(rows.map(r => r.workstream).filter(Boolean))];
  const monthSuggestions = getMonthSuggestions();

  function toggleSort(key: 'category' | 'workstream' | 'month') {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sortedRows = sortKey
    ? [...rows].sort((a, b) => {
        const va = a[sortKey] ?? '';
        const vb = b[sortKey] ?? '';
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      })
    : rows;

  function openAdd() { setForm(EMPTY); setAddNewCat(false); setAddNewWs(false); setModal({ open: true, idx: null }); }
  function openEdit(idx: number) { setForm({ ...rows[idx] }); setAddNewCat(false); setAddNewWs(false); setModal({ open: true, idx }); }

  function handleSave() {
    const budgeted = Number(form.budgeted);
    const consumed = Number(form.consumed);
    const forecast = Number(form.forecast);
    const remaining = budgeted - consumed;
    const variance = forecast - budgeted; // negative = under budget (saving)
    const n = { ...form, budgeted, consumed, remaining, forecast, variance };
    if (modal.idx === null) set('budget', [...rows, n]);
    else { const next = [...rows]; next[modal.idx] = n; set('budget', next); }
    setModal({ open: false, idx: null });
  }

  const upd = <K extends keyof BudgetRow>(k: K, v: BudgetRow[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <VisibilityBanner visKey="budget" label="Budget" />
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Budget Manager</h2>
          <p className="text-gray-500 text-sm">{rows.length} rows · {pct}% utilized overall</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Currency selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['INR', 'USD'] as const).map(c => (
              <button
                key={c}
                onClick={() => set('budgetCurrency', c)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  currency === c ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {c === 'INR' ? '₹ INR' : '$ USD'}
              </button>
            ))}
          </div>
          <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Add Row</button>
        </div>
      </div>

      {rows.length === 0 ? <Empty label="budget rows" onAdd={openAdd} /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {(['Category', 'Workstream', 'Month'] as const).map(h => {
                  const key = h.toLowerCase() as 'category' | 'workstream' | 'month';
                  const active = sortKey === key;
                  return (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <button onClick={() => toggleSort(key)} className={`flex items-center gap-1 hover:text-gray-800 transition-colors ${active ? 'text-blue-600' : ''}`}>
                        {h}
                        <span className="text-[10px]">{active ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}</span>
                      </button>
                    </th>
                  );
                })}
                {['Budgeted', 'Consumed', 'Remaining', 'Forecast', 'Variance', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedRows.map((row, sortedIdx) => {
                const origIdx = rows.indexOf(row);
                return (
                  <tr key={sortedIdx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{row.category}</td>
                    <td className="px-4 py-3 text-gray-600">{row.workstream}</td>
                    <td className="px-4 py-3 text-gray-600">{row.month}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(row.budgeted)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(row.consumed)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(row.remaining)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(row.forecast)}</td>
                    <td className={`px-4 py-3 font-medium ${row.variance < 0 ? 'text-green-600' : row.variance > 0 ? 'text-red-600' : 'text-gray-500'}`}>{fmt(row.variance)}</td>
                    <td className="px-4 py-3"><RowActions onEdit={() => openEdit(origIdx)} onDelete={() => set('budget', rows.filter((_, i) => i !== origIdx))} /></td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={3} className="px-4 py-3 text-gray-700">Total</td>
                <td className="px-4 py-3 text-gray-900">{fmt(total.budgeted)}</td>
                <td className="px-4 py-3 text-gray-900">{fmt(total.consumed)}</td>
                <td colSpan={3} />
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Key Highlights editor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Key Highlights</h3>

        {highlights.length === 0 && (
          <p className="text-sm text-gray-400">No highlights yet. Add one below.</p>
        )}

        <ul className="space-y-2">
          {highlights.map((h, idx) => (
            <li key={idx} className="flex items-start gap-3">
              {hlEditIdx === idx ? (
                <>
                  <textarea
                    className="flex-1 border border-blue-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={2}
                    defaultValue={h}
                    id={`hl-edit-${idx}`}
                    autoFocus
                  />
                  <div className="flex flex-col gap-1 pt-1">
                    <button
                      onClick={() => {
                        const el = document.getElementById(`hl-edit-${idx}`) as HTMLTextAreaElement;
                        saveHighlightEdit(idx, el.value.trim() || h);
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >Save</button>
                    <button
                      onClick={() => setHlEditIdx(null)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="flex-1 text-sm text-gray-700">{h}</span>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setHlEditIdx(idx)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => deleteHighlight(idx)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <textarea
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={2}
            placeholder="Add a key highlight..."
            value={hlDraft}
            onChange={e => setHlDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addHighlight(); }}
          />
          <button
            onClick={addHighlight}
            disabled={!hlDraft.trim()}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-40 self-end"
          >Add</button>
        </div>
      </div>

      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Budget Row' : 'Edit Budget Row'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave}>
          <p className="text-xs text-gray-400 -mt-1 mb-2">Remaining and Variance are calculated automatically.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              {addNewCat ? (
                <div className="flex gap-2 items-center">
                  <Input value={form.category} onChange={e => upd('category', e.target.value)} placeholder="New category name" autoFocus />
                  <button type="button" onClick={() => { setAddNewCat(false); upd('category', ''); }} className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap shrink-0">Cancel</button>
                </div>
              ) : (
                <Select value={form.category} onChange={e => { if (e.target.value === '__new__') { setAddNewCat(true); upd('category', ''); } else upd('category', e.target.value); }}>
                  <option value="">Select category…</option>
                  {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__new__">+ Add new…</option>
                </Select>
              )}
            </Field>
            <Field label="Workstream">
              {addNewWs ? (
                <div className="flex gap-2 items-center">
                  <Input value={form.workstream} onChange={e => upd('workstream', e.target.value)} placeholder="New workstream name" autoFocus />
                  <button type="button" onClick={() => { setAddNewWs(false); upd('workstream', ''); }} className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap shrink-0">Cancel</button>
                </div>
              ) : (
                <Select value={form.workstream} onChange={e => { if (e.target.value === '__new__') { setAddNewWs(true); upd('workstream', ''); } else upd('workstream', e.target.value); }}>
                  <option value="">Select workstream…</option>
                  {existingWorkstreams.map(w => <option key={w} value={w}>{w}</option>)}
                  <option value="__new__">+ Add new…</option>
                </Select>
              )}
            </Field>
            <Field label="Month">
              <Select value={form.month} onChange={e => upd('month', e.target.value)}>
                <option value="">Select month…</option>
                {form.month && !monthSuggestions.includes(form.month) && (
                  <option value={form.month}>{form.month}</option>
                )}
                {monthSuggestions.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label={`Budgeted (${currency})`}>
              <Input type="number" value={form.budgeted} onChange={e => upd('budgeted', Number(e.target.value))} />
            </Field>
            <Field label={`Consumed (${currency})`}>
              <Input type="number" value={form.consumed} onChange={e => upd('consumed', Number(e.target.value))} />
            </Field>
            <Field label={`Forecast (${currency})`}>
              <Input type="number" value={form.forecast} onChange={e => upd('forecast', Number(e.target.value))} />
            </Field>
          </div>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
            <p>Remaining = Budgeted − Consumed = <strong>{(Number(form.budgeted) - Number(form.consumed)).toLocaleString()}</strong></p>
            <p>Variance = Forecast − Budgeted = <strong className={Number(form.forecast) - Number(form.budgeted) < 0 ? 'text-green-700' : Number(form.forecast) - Number(form.budgeted) > 0 ? 'text-red-700' : ''}>{(Number(form.forecast) - Number(form.budgeted)).toLocaleString()}</strong> {Number(form.forecast) < Number(form.budgeted) ? '(saving)' : Number(form.forecast) > Number(form.budgeted) ? '(overrun)' : ''}</p>
          </div>
        </Modal>
      )}
    </div>
    </>
  );
}
