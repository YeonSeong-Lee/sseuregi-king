'use client';
import type { WasteCategory } from '@/types';

const ORDER: WasteCategory[] = ['recycling', 'food', 'general', 'large'];

const COLORS: Record<WasteCategory, string> = {
  recycling: 'border-blue-500/40 text-blue-300 data-[active=true]:bg-blue-500/20',
  food:      'border-emerald-500/40 text-emerald-300 data-[active=true]:bg-emerald-500/20',
  general:   'border-zinc-500/40 text-zinc-300 data-[active=true]:bg-zinc-500/30',
  large:     'border-orange-500/40 text-orange-300 data-[active=true]:bg-orange-500/20',
};

interface CategoryChipsProps {
  active: WasteCategory | 'all';
  onChange: (next: WasteCategory | 'all') => void;
  labels: Record<WasteCategory, string>;
  allLabel: string;
}

export function CategoryChips({ active, onChange, labels, allLabel }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-2 -mx-4 scrollbar-none">
      <button
        type="button"
        data-active={active === 'all'}
        onClick={() => onChange('all')}
        className="shrink-0 px-3 py-1.5 rounded-full text-xs border border-zinc-700 text-zinc-200 data-[active=true]:bg-zinc-700/40 data-[active=true]:text-white"
      >
        {allLabel}
      </button>
      {ORDER.map(cat => (
        <button
          key={cat}
          type="button"
          data-active={active === cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs border ${COLORS[cat]}`}
        >
          {labels[cat]}
        </button>
      ))}
    </div>
  );
}
