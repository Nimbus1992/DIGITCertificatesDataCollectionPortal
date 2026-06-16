interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'amber' | 'red';
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const heightMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export function ProgressBar({ value, max = 100, color = 'blue', showLabel = true, height = 'md' }: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${heightMap[height]}`}>
        <div
          className={`${heightMap[height]} rounded-full transition-all ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-gray-600 w-10 text-right">{pct}%</span>}
    </div>
  );
}
