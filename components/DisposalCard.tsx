import { StepRow } from '@/components/StepRow';
import { BagChip } from '@/components/BagChip';
import type { DistrictRule, Locale, StepId, WasteCategory, WasteCategoryDef } from '@/types';

export const CATEGORY_BADGE: Record<WasteCategory, string> = {
  paper:        'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  paper_carton: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  glass:        'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  metal_can:    'bg-slate-200 text-slate-700 dark:bg-slate-400/20 dark:text-slate-200',
  plastic:      'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  vinyl:        'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300',
  styrofoam:    'bg-rose-100 text-rose-700 dark:bg-rose-300/20 dark:text-rose-200',
  clothing:     'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300',
  lightbulb:    'bg-orange-100 text-orange-800 dark:bg-orange-400/20 dark:text-orange-300',
  food:         'bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-300',
  general:      'bg-zinc-200 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300',
  large:        'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  etc:          'bg-slate-100 text-slate-700 border border-dashed border-slate-400 dark:bg-slate-500/20 dark:text-slate-200 dark:border-slate-400/60',
};

interface DisposalCardProps {
  category: WasteCategoryDef;
  steps: StepId[];
  districtRule: DistrictRule;
  locale: Locale;
  categoryLabel: string;
  bagLabel: string;
  onClick: () => void;
}

export function DisposalCard({
  category, steps, districtRule, locale, categoryLabel, bagLabel, onClick,
}: DisposalCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${category.names[locale]} — ${categoryLabel}`}
      className="block w-full text-left rounded-2xl border border-line bg-surface-elev overflow-hidden transition-colors hover:border-line-strong active:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
    >
      <div className="flex items-start gap-3 px-4 pt-4">
        <div className="w-20 h-20 shrink-0 flex items-center justify-center text-5xl animate-float" aria-hidden="true">
          {category.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-fg font-semibold truncate">
              {category.names[locale]}
            </h3>
            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${CATEGORY_BADGE[category.id]}`}>
              {categoryLabel}
            </span>
          </div>
          <div className="mt-2">
            <BagChip color={districtRule.bagColor} label={bagLabel} />
          </div>
        </div>
      </div>
      <div className="px-3 pt-3">
        <StepRow steps={steps} locale={locale} interactive={false} />
      </div>
      <p className="px-4 py-3 mt-1 text-sm text-fg-muted leading-relaxed border-t border-line bg-surface/40">
        {districtRule.schedule[locale]}
      </p>
    </button>
  );
}
