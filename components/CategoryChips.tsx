'use client';
import { CATEGORY_IDS } from '@/lib/categories';
import type { WasteCategory } from '@/types';

const COLORS: Record<WasteCategory, string> = {
  paper:        'border-amber-300 text-amber-800 data-[active=true]:bg-amber-100 dark:border-amber-500/40 dark:text-amber-300 dark:data-[active=true]:bg-amber-500/20',
  paper_carton: 'border-yellow-300 text-yellow-800 data-[active=true]:bg-yellow-100 dark:border-yellow-500/40 dark:text-yellow-300 dark:data-[active=true]:bg-yellow-500/20',
  glass:        'border-emerald-300 text-emerald-800 data-[active=true]:bg-emerald-100 dark:border-emerald-500/40 dark:text-emerald-300 dark:data-[active=true]:bg-emerald-500/20',
  metal_can:    'border-slate-300 text-slate-700 data-[active=true]:bg-slate-200 dark:border-slate-400/40 dark:text-slate-200 dark:data-[active=true]:bg-slate-400/20',
  plastic:      'border-blue-300 text-blue-800 data-[active=true]:bg-blue-100 dark:border-blue-500/40 dark:text-blue-300 dark:data-[active=true]:bg-blue-500/20',
  vinyl:        'border-cyan-300 text-cyan-800 data-[active=true]:bg-cyan-100 dark:border-cyan-500/40 dark:text-cyan-300 dark:data-[active=true]:bg-cyan-500/20',
  styrofoam:    'border-rose-300 text-rose-700 data-[active=true]:bg-rose-100 dark:border-rose-300/40 dark:text-rose-200 dark:data-[active=true]:bg-rose-300/20',
  clothing:     'border-violet-300 text-violet-800 data-[active=true]:bg-violet-100 dark:border-violet-500/40 dark:text-violet-300 dark:data-[active=true]:bg-violet-500/20',
  lightbulb:    'border-orange-300 text-orange-800 data-[active=true]:bg-orange-100 dark:border-orange-400/40 dark:text-orange-300 dark:data-[active=true]:bg-orange-400/20',
  food:         'border-lime-300 text-lime-800 data-[active=true]:bg-lime-100 dark:border-lime-500/40 dark:text-lime-300 dark:data-[active=true]:bg-lime-500/20',
  general:      'border-zinc-300 text-zinc-700 data-[active=true]:bg-zinc-200 dark:border-zinc-500/40 dark:text-zinc-300 dark:data-[active=true]:bg-zinc-500/30',
  large:        'border-red-300 text-red-800 data-[active=true]:bg-red-100 dark:border-red-500/40 dark:text-red-300 dark:data-[active=true]:bg-red-500/20',
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
        className="shrink-0 px-3 py-1.5 rounded-full text-xs border border-line-strong text-fg-muted data-[active=true]:bg-surface-elev data-[active=true]:text-fg"
      >
        {allLabel}
      </button>
      {CATEGORY_IDS.map(cat => (
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
