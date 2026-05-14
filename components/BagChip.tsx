import type { BagColor } from '@/types';

const SWATCH: Record<BagColor, { bg: string; border: string }> = {
  transparent: { bg: 'bg-white/10', border: 'border-white/40' },
  yellow:      { bg: 'bg-yellow-400', border: 'border-yellow-300' },
  white:       { bg: 'bg-zinc-100',   border: 'border-zinc-200' },
  green:       { bg: 'bg-emerald-500',border: 'border-emerald-400' },
  special:     { bg: 'bg-stone-500',  border: 'border-stone-400' },
  none:        { bg: 'bg-transparent',border: 'border-dashed border-zinc-600' },
};

interface BagChipProps {
  color: BagColor;
  label: string;
}

export function BagChip({ color, label }: BagChipProps) {
  const { bg, border } = SWATCH[color];
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200">
      <span className={`w-3.5 h-3.5 rounded-full border-2 ${bg} ${border}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
