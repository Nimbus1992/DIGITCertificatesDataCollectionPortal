import { useStore } from '../../store/DataStore';
import { EmptyState } from './S03_OKRProgress';
import type { Metric } from '../../types';

const TREND_ICON: Record<Metric['trend'], string> = { Up: '↑', Down: '↓', Stable: '→' };
const TREND_COLOR: Record<Metric['trend'], string> = { Up: 'text-green-600', Down: 'text-red-600', Stable: 'text-gray-500' };

export function S06_SuccessMetrics() {
  const { data } = useStore();
  const metrics = data.metrics;
  const delivery = metrics.filter(m => m.category === 'Delivery');
  const outcome = metrics.filter(m => m.category === 'Outcome');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Success Metrics</h2>
        <p className="text-gray-500 text-sm">Measuring outcomes</p>
      </div>

      {metrics.length === 0 ? <EmptyState label="Metrics" adminPath="/admin/metrics" /> : (
        <div className="space-y-8">
          {[
            { label: 'Delivery Metrics', items: delivery, color: 'blue' },
            { label: 'Outcome Metrics', items: outcome, color: 'green' },
          ].map(({ label, items, color }) => items.length > 0 && (
            <div key={label}>
              <h3 className="text-sm font-bold text-gray-700 mb-4">{label}</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {items.map((metric, idx) => (
                  <div key={idx} className={`rounded-xl border p-5 ${color === 'blue' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 leading-tight">{metric.name}</p>
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{metric.actual}</p>
                        <p className="text-xs text-gray-500">Target: {metric.target}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${TREND_COLOR[metric.trend]}`}>{TREND_ICON[metric.trend]}</p>
                        <p className="text-xs text-gray-400">{metric.trend}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 border-t border-gray-200 pt-2">{metric.period}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
