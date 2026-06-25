import type { Risk } from '../../types';

// Color by P×I score — no severity needed
function scoreColor(prob: number, impact: number): string {
  const s = prob * impact;
  if (s >= 16) return '#dc2626';
  if (s >= 9)  return '#f97316';
  if (s >= 4)  return '#f59e0b';
  return '#22c55e';
}

interface RiskMatrixProps {
  risks: Risk[];
  selectedKey?: string | null;
  onSelect?: (key: string | null) => void;
}

export function RiskMatrix({ risks, selectedKey, onSelect }: RiskMatrixProps) {
  const size = 5;
  const cellSize = 56;
  const offset = 40;
  const topPad = 8;
  const svgW = size * cellSize + offset + 20;
  const svgH = size * cellSize + offset + 20;

  // Group risks by (col, row) position
  const groups = new Map<string, { col: number; row: number; prob: number; impact: number; count: number }>();
  risks.forEach(risk => {
    const col = Math.min(Math.max(risk.probability, 1), 5) - 1;
    const row = size - Math.min(Math.max(risk.impact, 1), 5);
    const key = `${col}-${row}`;
    if (!groups.has(key)) {
      groups.set(key, { col, row, prob: col + 1, impact: size - row, count: 0 });
    }
    groups.get(key)!.count++;
  });

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgW}
        height={svgH}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* Y-axis label */}
        <text
          x={12}
          y={size * cellSize / 2 + offset}
          textAnchor="middle"
          fontSize={11}
          fill="#6b7280"
          transform={`rotate(-90, 12, ${size * cellSize / 2 + offset})`}
        >
          Impact →
        </text>
        {/* X-axis label */}
        <text
          x={size * cellSize / 2 + offset}
          y={topPad + size * cellSize + 28}
          textAnchor="middle"
          fontSize={11}
          fill="#6b7280"
        >
          Probability →
        </text>

        {/* Axis tick labels */}
        {Array.from({ length: size }).map((_, i) => (
          <g key={i}>
            <text x={offset + i * cellSize + cellSize / 2} y={topPad + size * cellSize + 14} textAnchor="middle" fontSize={10} fill="#9ca3af">{i + 1}</text>
            <text x={offset - 6} y={topPad + (size - 1 - i) * cellSize + cellSize / 2 + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{i + 1}</text>
          </g>
        ))}

        {/* Circles — one per unique position, sized by count, clickable */}
        {Array.from(groups.values()).map(({ col, row, prob, impact, count }) => {
          const key = `${col}-${row}`;
          const cx = col * cellSize + offset + cellSize / 2;
          const cy = row * cellSize + topPad + cellSize / 2;
          const r = 10 + 5 * (count - 1);
          const color = scoreColor(prob, impact);
          const isSelected = selectedKey === key;
          const isDeselected = selectedKey !== null && !isSelected;
          const label = String(count);
          const fontSize = r < 15 ? 10 : 11;

          return (
            <g
              key={key}
              onClick={() => onSelect?.(key)}
              style={{ cursor: onSelect ? 'pointer' : 'default' }}
            >
              {/* Selection ring */}
              {isSelected && (
                <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke={color} strokeWidth={2} strokeDasharray="4 2" opacity={0.7} />
              )}
              <circle
                cx={cx} cy={cy} r={r}
                fill={color}
                fillOpacity={isDeselected ? 0.25 : 0.88}
                stroke={isSelected ? color : 'none'}
                strokeWidth={isSelected ? 2 : 0}
              />
              <text
                x={cx} y={cy + fontSize / 3}
                textAnchor="middle"
                fontSize={fontSize}
                fill={isDeselected ? '#9ca3af' : 'white'}
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {label}
              </text>
              <title>{`P=${prob}, I=${impact} — ${count} risk${count !== 1 ? 's' : ''}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
