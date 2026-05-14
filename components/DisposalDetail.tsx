'use client';
import { useTranslations } from 'next-intl';
import { BagChip } from '@/components/BagChip';
import { CATEGORY_BADGE } from '@/components/DisposalCard';
import { StepRow } from '@/components/StepRow';
import { YoutubeLinkCard } from '@/components/YoutubeLinkCard';
import { getYoutubeVideo } from '@/lib/youtube';
import type { DistrictRule, Locale, StepId, WasteCategoryDef } from '@/types';

interface DisposalDetailProps {
  category: WasteCategoryDef;
  steps: StepId[];
  districtRule: DistrictRule;
  locale: Locale;
  categoryLabel: string;
  bagLabel: string;
  onBack: () => void;
}

export function DisposalDetail({
  category, steps, districtRule, locale, categoryLabel, bagLabel, onBack,
}: DisposalDetailProps) {
  const t = useTranslations();
  const examples = category.examples[locale];
  const video = getYoutubeVideo(category.id, locale);

  return (
    <div className="relative flex flex-col h-full overflow-y-auto overflow-x-hidden">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-line sticky top-0 bg-surface/95 backdrop-blur z-10 shrink-0">
        <button
          onClick={onBack}
          type="button"
          className="text-blue-600 dark:text-blue-400 text-sm font-medium shrink-0"
        >
          {t('video.back')}
        </button>
        <h2 className="text-fg font-semibold truncate">
          <span aria-hidden="true" className="mr-1">{category.emoji}</span>
          {category.names[locale]}
        </h2>
        <span className={`ml-auto shrink-0 text-[10px] px-2 py-0.5 rounded-full ${CATEGORY_BADGE[category.id]}`}>
          {categoryLabel}
        </span>
      </header>

      <div className="px-4 pt-4">
        <YoutubeLinkCard
          video={video}
          ctaLabel={t('video.watch_on_youtube')}
          className="mx-auto"
        />
      </div>

      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="w-16 h-16 shrink-0 flex items-center justify-center text-4xl animate-float" aria-hidden="true">
          {category.emoji}
        </div>
        <BagChip color={districtRule.bagColor} label={bagLabel} />
      </div>

      <div className="px-3 pt-4">
        <StepRow steps={steps} locale={locale} interactive />
        <p className="text-[10px] text-fg-faint text-center pt-1">{t('guide.pin_step_hint')}</p>
      </div>

      <p className="mx-4 mt-4 px-4 py-3 text-sm text-fg leading-relaxed rounded-xl border border-line bg-surface-elev">
        {districtRule.schedule[locale]}
      </p>

      {examples && (
        <section className="px-4 pt-5 pb-8">
          <h4 className="text-xs text-fg-faint uppercase tracking-wide">
            {t('guide.detail.examples_title')}
          </h4>
          <p className="mt-2 text-sm text-fg-muted leading-relaxed">{examples}</p>
        </section>
      )}
    </div>
  );
}
