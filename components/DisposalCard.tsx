import { StepRow } from '@/components/StepRow';
import { BagChip } from '@/components/BagChip';
import { ItemHero } from '@/components/svg/ItemHeroes';
import type { DistrictRule, ItemRule, Locale, WasteItem } from '@/types';

const CATEGORY_BADGE: Record<string, string> = {
  recycling: 'bg-blue-500/20 text-blue-300',
  food:      'bg-emerald-500/20 text-emerald-300',
  general:   'bg-zinc-500/20 text-zinc-300',
  large:     'bg-orange-500/20 text-orange-300',
};

interface DisposalCardProps {
  item: WasteItem;
  rule: ItemRule;
  districtRule: DistrictRule;
  locale: Locale;
  categoryLabel: string;
  bagLabel: string;
}

export function DisposalCard({ item, rule, districtRule, locale, categoryLabel, bagLabel }: DisposalCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      <div className="flex items-start gap-3 px-4 pt-4">
        <div className="w-20 h-20 shrink-0 animate-float">
          <ItemHero id={item.id} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-white font-semibold truncate">
              <span aria-hidden="true" className="mr-1">{item.emoji}</span>
              {item.names[locale]}
            </h3>
            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${CATEGORY_BADGE[item.category] ?? ''}`}>
              {categoryLabel}
            </span>
          </div>
          <div className="mt-2">
            <BagChip color={districtRule.bagColor} label={bagLabel} />
          </div>
        </div>
      </div>
      <div className="px-3 pt-3">
        <StepRow steps={rule.steps} locale={locale} />
      </div>
      <p className="px-4 py-3 mt-1 text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/80 bg-zinc-950/40">
        {districtRule.schedule[locale]}
      </p>
    </article>
  );
}
