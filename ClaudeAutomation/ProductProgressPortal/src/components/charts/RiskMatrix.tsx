import type { Risk } from '../../types';

const SEVERITY_COLOR: Record<string, string> = {
  Critical: '#dc2626',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#22c55e',
};

interface RiskMatrixProps {
  risks: Risk[];
}

export function RiskMatrix({ risks }: RiskMatrixProps) {
  const size = 5;
  const cellSize = 52;
  const offset = 40;

  const bgColor = (row: number, col: number) => {
    const score = row * col;
    if (score >= 16) return '#fee2e2';
    if (score >= 9) return '#fef3c7';
    if (score >= 4) return '#fef9c3';
    return '#dcfce7';
  };

  return (
    <div className="overflow-x-auto">
      <svg
        width={size * cellSize + offset + 20}
        height={size * cellSize + offset + 20}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* Y-axis label */}
        <text x={12} y={size * cellSize / 2 + offset} textAnchor="middle" fontSize={11} fill="#6b7280" transform={`rotate(-90, 12, ${size * cellSize / 2 + offset})`}>Impact →</text>
        {/* X-axis label */}
        <text x={size * cellSize / 2 + offset} y={size * cellSize + offset + 16} textAnchor="middle" fontSize={11} fill="#6b7280">Probability →</text>

        {Array.from({ length: size }).map((_, row) => (
          Array.from({ length: size }).map((_, col) => {
            const impact = size - row;
            const prob = col + 1;
            const x = col * cellSize + offset;
            const y = row * cellSize + 8;
            return (
              <rect
                key={`${row}-${col}`}
                x={x}
                y={y}
                width={cellSize - 2}
                height={cellSize - 2}
                rx={4}
                fill={bgColor(impact, prob)}
                stroke="#e5e7eb"
              />
            );
          })
        ))}

        {/* Axis tick labels */}
        {Array.from({ length: size }).map((_, i) => (
          <g key={i}>
            <text x={offset + i * cellSize + cellSize / 2} y={6} textAnchor="middle" fontSize={10} fill="#9ca3af">{i + 1}</text>
            <text x={offset - 4} y={8 + (size - 1 - i) * cellSize + cellSize / 2 + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{i + 1}</text>
          </g>
        ))}

        {/* Risk dots */}
        {risks.map((risk, idx) => {
          const col = Math.min(Math.max(risk.probability, 1), 5) - 1;
          const row = size - Math.min(Math.max(risk.impact, 1), 5);
          const cx = col * cellSize + offset + cellSize / 2;
          const cy = row * cellSize + 8 + cellSize / 2;
          return (
            <g key={idx}>
              <circle cx={cx} cy={cy} r={12} fill={SEVERITY_COLOR[risk.severity] || '#6b7280'} fillOpacity={0.85} />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill="white" fontWeight="bold">
                {idx + 1}
              </text>
              <title>{`${idx + 1}. ${risk.description}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
