import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Field, Textarea, ListEditor } from '../../components/Field';
import type { ProductOverviewData } from '../../types';
import { VisibilityBanner } from '../VisibilityBanner';

export function ProductOverviewEditor() {
  const { data, set } = useStore();
  const [form, setForm] = useState<ProductOverviewData>({ ...data.productOverview });
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof ProductOverviewData>(key: K, val: ProductOverviewData[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  function handleSave() {
    set('productOverview', form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <VisibilityBanner visKey="productOverview" label="Product Overview" />
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Product Overview</h2>
          <p className="text-gray-500 text-sm">Why this work exists</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <Field label="Problem Statement">
          <Textarea value={form.problem} onChange={e => update('problem', e.target.value)} rows={4} placeholder="What problem are we solving?" />
        </Field>
        <Field label="Vision">
          <Textarea value={form.vision} onChange={e => update('vision', e.target.value)} rows={4} placeholder="Future state description" />
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Scope & Objectives</h3>
        <Field label="Objectives">
          <ListEditor values={form.objectives} onChange={v => update('objectives', v)} placeholder="Objective" />
        </Field>
        <Field label="In Scope">
          <ListEditor values={form.inScope} onChange={v => update('inScope', v)} placeholder="In-scope item" />
        </Field>
        <Field label="Out of Scope">
          <ListEditor values={form.outOfScope} onChange={v => update('outOfScope', v)} placeholder="Out-of-scope item" />
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Users & Alignment</h3>
        <Field label="Target Users">
          <ListEditor values={form.targetUsers} onChange={v => update('targetUsers', v)} placeholder="User group" />
        </Field>
        <Field label="Strategic Alignment">
          <ListEditor values={form.strategicAlignment} onChange={v => update('strategicAlignment', v)} placeholder="Org goal supported" />
        </Field>
      </div>
    </div>
    </>
  );
}
