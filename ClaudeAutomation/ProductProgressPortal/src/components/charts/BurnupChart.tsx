import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { BudgetRow } from '../../types';

interface BurnupChartProps {
  data: BudgetRow[];
}

export function BurnupChart({ data }: BurnupChartProps) {
  const byMonth = data.reduce<Record<string, { budgeted: number; consumed: number }>>((acc, row) => {
    if (!row.month) return acc;
    if (!acc[row.month]) acc[row.month] = { budgeted: 0, consumed: 0 };
    acc[row.month].budgeted += row.budgeted;
    acc[row.month].consumed += row.consumed;
    return acc;
  }, {});

  const chartData = Object.entries(byMonth).map(([month, vals]) => ({ month, ...vals }));

  if (!chartData.length) {
    return <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No monthly data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => typeof v === 'number' ? `₹${v.toLocaleString()}` : v} />
        <Area type="monotone" dataKey="budgeted" stroke="#93c5fd" fill="#dbeafe" name="Budgeted" strokeWidth={2} />
        <Area type="monotone" dataKey="consumed" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} name="Consumed" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
