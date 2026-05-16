'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { GradBlob } from '@/components/svg/GradBlob';
import type { Locale } from '@/types';

type LessonId = 'ceremony' | 'bags' | 'rules' | 'big';

interface LessonMeta {
  id: LessonId;
  swatch: string;
  border: string;
  icon: string;
}

const LESSONS: LessonMeta[] = [
  { id: 'ceremony', swatch: 'bg-amber-100 dark:bg-amber-500/15', border: 'border-amber-700/70 dark:border-amber-400/60', icon: '/mascots/mascot-happy.png' },
  { id: 'bags',     swatch: 'bg-emerald-100 dark:bg-emerald-500/15', border: 'border-emerald-700/70 dark:border-emerald-400/60', icon: '/bag-icons/general.png' },
  { id: 'rules',    swatch: 'bg-blue-100 dark:bg-blue-500/15', border: 'border-blue-700/70 dark:border-blue-400/60', icon: '/step-icons/SEPARATE_BY_MATERIAL.png' },
  { id: 'big',      swatch: 'bg-rose-100 dark:bg-rose-500/15', border: 'border-rose-700/70 dark:border-rose-400/60', icon: '/step-icons/CALL_COMMUNITY_CENTER.png' },
];

export function Trash101({ locale }: { locale: Locale }) {
  const t = useTranslations('trash101');
  const [active, setActive] = useState<LessonId | null>(null);

  if (active) {
    return <LessonView lessonId={active} onBack={() => setActive(null)} />;
  }

  return (
    <div className="relative flex flex-col h-full overflow-y-auto overflow-x-hidden">
      <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center px-4 py-3 sticky top-0 bg-surface/95 backdrop-blur z-10 shrink-0">
        <Link
          href={`/${locale}/scan`}
          aria-label={t('back_aria')}
          className="text-fg text-xl active:scale-90 transition-transform"
        >
          ←
        </Link>
        <h1 className="font-[family-name:var(--font-fraunces)] font-black text-xl tracking-tight text-center">
          {t('title')}
        </h1>
        <span />
      </header>

      <div className="flex flex-col items-center pt-2 pb-4 px-6">
        <GradBlob className="w-28 h-28" />
        <SpeechBubble text={t('mascot_greeting')} />
      </div>

      <ul className="flex flex-col gap-3 px-4 pb-8">
        {LESSONS.map(lesson => (
          <li key={lesson.id}>
            <button
              type="button"
              onClick={() => setActive(lesson.id)}
              className="group w-full text-left flex items-center gap-4 rounded-2xl border border-line bg-surface-elev px-4 py-4 transition-colors hover:border-line-strong active:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            >
              <span
                aria-hidden="true"
                className={`relative w-12 h-12 shrink-0 rounded-xl border-2 ${lesson.border} ${lesson.swatch}`}
              >
                <Image src={lesson.icon} alt="" fill style={{ objectFit: 'contain' }} className="p-1.5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-[family-name:var(--font-fraunces)] font-bold text-fg text-base leading-tight">
                  {t(`lessons.${lesson.id}.title`)}
                </span>
                <span className="block text-sm text-fg-muted mt-0.5 leading-snug">
                  {t(`lessons.${lesson.id}.tagline`)}
                </span>
              </span>
              <span aria-hidden="true" className="text-fg-muted text-lg shrink-0 group-active:translate-x-0.5 transition-transform">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpeechBubble({ text }: { text: string }) {
  return (
    <div className="relative mt-2 max-w-[20rem]">
      {/* Tail pointing up to mascot */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 rotate-45 bg-surface-elev border-l-2 border-t-2 border-fg" />
      <div className="relative rounded-2xl border-2 border-fg bg-surface-elev px-5 py-3">
        <p className="text-fg font-bold text-sm text-center leading-snug">
          {text}
        </p>
      </div>
    </div>
  );
}

function LessonView({
  lessonId,
  onBack,
}: {
  lessonId: LessonId;
  onBack: () => void;
}) {
  const t = useTranslations('trash101');
  const lesson = LESSONS.find(l => l.id === lessonId)!;
  const sectionKeys = ['s1', 's2', 's3', 's4'] as const;

  return (
    <div className="relative flex flex-col h-full overflow-y-auto overflow-x-hidden">
      <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center px-4 py-3 sticky top-0 bg-surface/95 backdrop-blur z-10 shrink-0 border-b border-line">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('back_aria')}
          className="text-fg text-xl active:scale-90 transition-transform"
        >
          ←
        </button>
        <h2 className="font-[family-name:var(--font-fraunces)] font-black text-base tracking-tight text-center truncate">
          {t(`lessons.${lessonId}.title`)}
        </h2>
        <span />
      </header>

      <div className="px-5 pt-5 pb-2 flex items-start gap-4">
        <div className={`relative w-14 h-14 shrink-0 rounded-xl border-2 ${lesson.border} ${lesson.swatch}`} aria-hidden="true">
          <Image src={lesson.icon} alt="" fill style={{ objectFit: 'contain' }} className="p-1.5" />
        </div>
        <p className="text-fg-muted text-sm leading-relaxed italic font-[family-name:var(--font-fraunces)]">
          {t(`lessons.${lessonId}.intro`)}
        </p>
      </div>

      <div className="flex flex-col gap-5 px-5 pt-4 pb-10">
        {sectionKeys.map(k => {
          const heading = t.has(`lessons.${lessonId}.${k}.heading`)
            ? t(`lessons.${lessonId}.${k}.heading`)
            : null;
          const body = t.has(`lessons.${lessonId}.${k}.body`)
            ? t(`lessons.${lessonId}.${k}.body`)
            : null;
          if (!heading || !body) return null;
          return (
            <section key={k}>
              <h3 className="font-[family-name:var(--font-fraunces)] font-bold text-fg text-base leading-tight">
                {heading}
              </h3>
              <p className="mt-1.5 text-fg-muted text-sm leading-relaxed whitespace-pre-line">
                {body}
              </p>
            </section>
          );
        })}

        {t.has(`lessons.${lessonId}.tip`) && (
          <div className={`rounded-2xl border-2 ${lesson.border} ${lesson.swatch} px-4 py-3`}>
            <p className="text-fg text-sm leading-relaxed">
              <span className="font-bold">{t('tip_label')} </span>
              {t(`lessons.${lessonId}.tip`)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
