import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface BudgetGaugeProps {
  utilized: number;
}

export function BudgetGauge({ utilized }: BudgetGaugeProps) {
  const pct = Math.min(utilized, 100);
  const color = pct > 90 ? '#dc2626' : pct > 75 ? '#f59e0b' : '#16a34a';

  return (
    <div className="relative flex flex-col items-center">
      <RadialBarChart
        width={180}
        height={180}
        cx={90}
        cy={90}
        innerRadius={60}
        outerRadius={80}
        startAngle={90}
        endAngle={-270}
        data={[{ value: pct, fill: color }]}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#e5e7eb' }} />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{pct}%</span>
        <span className="text-xs text-gray-500">consumed</span>
      </div>
    </div>
  );
}
