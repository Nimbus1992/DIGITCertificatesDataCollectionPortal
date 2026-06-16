export function S12_Appendix() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Appendix</h2>
        <p className="text-gray-500 text-sm">Supporting information</p>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Definitions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ['OKR', 'Objective and Key Result — a goal-setting framework.'],
              ['Green', 'On track; no intervention required.'],
              ['Amber', 'At risk; monitoring required; may need intervention.'],
              ['Red', 'Off track; immediate intervention required.'],
              ['Delivery Confidence', 'Likelihood of completing planned deliverables on time.'],
              ['Budget Confidence', 'Likelihood of staying within allocated budget.'],
              ['Timeline Confidence', 'Likelihood of meeting key milestone dates.'],
              ['Burn Rate', 'Rate at which budget is being consumed over time.'],
              ['Milestone', 'A significant, measurable marker of progress toward an OKR.'],
            ].map(([term, def]) => (
              <div key={term} className="flex gap-3">
                <span className="font-semibold text-gray-900 text-sm shrink-0 w-36">{term}</span>
                <span className="text-sm text-gray-600">{def}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Reporting Methodology</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              'Data is entered manually via the Admin Interface and stored in your browser\'s local storage.',
              'OKR progress is calculated as the average completion % across all Key Results under an Objective.',
              'Budget utilization is calculated as (Consumed / Budgeted) × 100 across all rows.',
              'Risk probability and impact are rated on a 1–5 scale. Critical path risks are severity Critical or High.',
              'Metric trends (Up/Down/Stable) are set manually in the Metrics Editor.',
            ].map((item, i) => (
              <li key={i} className="flex gap-2"><span className="text-blue-500 mt-0.5">•</span>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm text-amber-800"><strong>Data storage note:</strong> All portal data is stored in your browser's local storage. Clearing browser data or switching browsers will reset it. To back up your data, use the Export feature (coming soon) or screenshot key sections.</p>
        </div>
      </div>
    </div>
  );
}
