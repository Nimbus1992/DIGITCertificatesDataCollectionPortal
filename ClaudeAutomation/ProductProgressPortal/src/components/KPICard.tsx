interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'amber' | 'purple';
}

const colorMap = {
  blue: 'bg-blue-50 border-blue-100',
  green: 'bg-green-50 border-green-100',
  amber: 'bg-amber-50 border-amber-100',
  purple: 'bg-purple-50 border-purple-100',
};

const valueColorMap = {
  blue: 'text-blue-900',
  green: 'text-green-900',
  amber: 'text-amber-900',
  purple: 'text-purple-900',
};

export function KPICard({ label, value, unit, sublabel, color = 'blue' }: KPICardProps) {
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-bold ${valueColorMap[color]}`}>
        {value}{unit && <span className="text-lg font-medium ml-1">{unit}</span>}
      </p>
      {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
    </div>
  );
}
