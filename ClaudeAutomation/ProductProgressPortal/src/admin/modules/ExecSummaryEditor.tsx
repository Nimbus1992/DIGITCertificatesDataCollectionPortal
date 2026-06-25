import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Field, Input, Select, Textarea, ListEditor } from '../../components/Field';
import type { ExecSummaryData, Status } from '../../types';
import { VisibilityBanner } from '../VisibilityBanner';

const STATUS_OPTIONS: Status[] = ['Green', 'Amber', 'Red'];

export function ExecSummaryEditor() {
  const { data, set } = useStore();
  const [form, setForm] = useState<ExecSummaryData>({ ...data.execSummary });
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof ExecSummaryData>(key: K, val: ExecSummaryData[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  function handleSave() {
    set('execSummary', form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <VisibilityBanner visKey="execSummary" label="Executive Summary" />
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Executive Summary</h2>
          <p className="text-gray-500 text-sm">Status indicators, KPIs, and highlights</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confidence Indicators</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            ['overallStatus', 'Overall Status'],
            ['deliveryConfidence', 'Delivery Confidence'],
            ['budgetConfidence', 'Budget Confidence'],
            ['timelineConfidence', 'Timeline Confidence'],
          ] as [keyof ExecSummaryData, string][]).map(([key, label]) => (
            <Field key={key} label={label}>
              <Select
                value={form[key] as string}
                onChange={e => update(key, e.target.value as Status)}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">KPI Numbers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            ['okrsOnTrack', 'OKRs On Track (%)'],
            ['milestonesCompleted', 'Milestones Completed'],
            ['budgetUtilized', 'Budget Utilized (%)'],
            ['roadmapProgress', 'Roadmap Progress (%)'],
            ['successMetricProgress', 'Success Metric Progress (%)'],
          ] as [keyof ExecSummaryData, string][]).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                type="number"
                min={0}
                max={100}
                value={form[key] as number}
                onChange={e => update(key, Number(e.target.value))}
              />
            </Field>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Launch Date</h3>
        <Field label="Target Launch Date" hint="Shown as 'Days to launch' on the product listing page">
          <Input
            type="date"
            value={form.launchDate ?? ''}
            onChange={e => update('launchDate', e.target.value || undefined)}
          />
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Highlights</h3>
        <Field label="Biggest Win">
          <Textarea value={form.biggestWin} onChange={e => update('biggestWin', e.target.value)} rows={2} />
        </Field>
        <Field label="Biggest Risk">
          <Textarea value={form.biggestRisk} onChange={e => update('biggestRisk', e.target.value)} rows={2} />
        </Field>
        <Field label="Most Important Update">
          <Textarea value={form.mostImportantUpdate} onChange={e => update('mostImportantUpdate', e.target.value)} rows={2} />
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action Required</h3>
        <Field label="Decisions Needed">
          <ListEditor values={form.decisionsNeeded} onChange={v => update('decisionsNeeded', v)} placeholder="Decision item" />
        </Field>
        <Field label="Leadership Support Required">
          <ListEditor values={form.leadershipSupport} onChange={v => update('leadershipSupport', v)} placeholder="Support item" />
        </Field>
        <Field label="Escalations">
          <ListEditor values={form.escalations} onChange={v => update('escalations', v)} placeholder="Escalation item" />
        </Field>
      </div>
    </div>
    </>
  );
}
