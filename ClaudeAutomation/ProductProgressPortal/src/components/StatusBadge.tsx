import type { Status } from '../types';

const styles: Record<Status, string> = {
  Green: 'bg-green-100 text-green-800 border-green-200',
  Amber: 'bg-amber-100 text-amber-800 border-amber-200',
  Red: 'bg-red-100 text-red-800 border-red-200',
};

const dot: Record<Status, string> = {
  Green: 'bg-green-500',
  Amber: 'bg-amber-500',
  Red: 'bg-red-500',
};

export function StatusBadge({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-1.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styles[status]} ${textSize}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}
