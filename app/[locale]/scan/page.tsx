// app/[locale]/scan/page.tsx
'use client';
import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CameraCapture } from '@/components/CameraCapture';
import { ScanResultHeader } from '@/components/ScanResultHeader';
import { DetectedImage } from '@/components/DetectedImage';
import { DetectedItemList } from '@/components/DetectedItemList';
import { SpeechBubble } from '@/components/SpeechBubble';
import { VideoPlayer } from '@/components/VideoPlayer';
import { PhotoTipsSheet } from '@/components/PhotoTipsSheet';
import { SadBlob } from '@/components/svg/SadBlob';
import type { DetectedObject, Locale } from '@/types';

type ScanState = 'capture' | 'analyzing' | 'overlay' | 'video';

export default function ScanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = use(params);
  const locale = rawLocale as Locale;
  const t = useTranslations();

  const [state, setState] = useState<ScanState>('capture');
  const [imageBase64, setImageBase64] = useState('');
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const [selected, setSelected] = useState<DetectedObject[]>([]);
  const [error, setError] = useState('');
  const [tipsOpen, setTipsOpen] = useState(false);

  const tipItems = [
    { emoji: '💡', title: t('tips.lighting_title'), body: t('tips.lighting_body') },
    { emoji: '🎯', title: t('tips.single_title'), body: t('tips.single_body') },
    { emoji: '📏', title: t('tips.distance_title'), body: t('tips.distance_body') },
  ];
  const tipsSheet = (
    <PhotoTipsSheet
      open={tipsOpen}
      onClose={() => setTipsOpen(false)}
      title={t('tips.title')}
      closeAria={t('tips.close_aria')}
      tips={tipItems}
    />
  );

  async function handleCapture(base64: string) {
    setImageBase64(base64);
    setState('analyzing');
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data: { objects: DetectedObject[] } = await res.json();
      setObjects(data.objects);
      setState('overlay');
      if (data.objects.length === 0) setTipsOpen(true);
    } catch {
      setError('Failed to analyze. Please try again.');
      setState('capture');
    }
  }

  if (state === 'capture') return (
    <>
      <div className="flex flex-col h-full px-6 py-6">
        <div className="flex flex-col items-center text-center pt-2">
          <h1 className="font-[family-name:var(--font-fraunces)] font-black text-5xl sm:text-6xl leading-[0.95] tracking-tight">
            {t('home.brand_title_line1')}<br />{t('home.brand_title_line2')}
          </h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0">
          <SadBlob className="w-44 h-44 sm:w-52 sm:h-52" />
          <div
            className="relative inline-flex items-center justify-center border-2 border-fg rounded-full px-6 py-2.5"
            style={{ background: 'var(--mascot-bag)' }}
          >
            <span
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 -top-[7px] w-3 h-3 border-l-2 border-t-2 border-fg rotate-45"
              style={{ background: 'var(--mascot-bag)' }}
            />
            <p className="font-[family-name:var(--font-fraunces)] text-fg text-sm font-semibold">
              {t('home.tagline')}
            </p>
          </div>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm text-center mb-2">{error}</p>}

        <div className="flex flex-col gap-3 pb-2">
          <CameraCapture onCapture={handleCapture}
            onError={() => setError('Failed to process image. Please try again.')}
            cameraLabel={t('home.point_at_trash')}
            shutterAria={t('scan.shutter_aria')} cancelAria={t('scan.cancel_aria')}
            usePhotoLabel={t('scan.use_photo')} retakeLabel={t('scan.retake')} />
          <Link
            href={`/${locale}/trash101`}
            className="flex items-center justify-center w-full rounded-full border-2 border-fg text-fg py-4 text-sm font-bold tracking-[0.15em] active:scale-95 transition-transform"
          >
            {t('home.teach_me')}
          </Link>
        </div>
      </div>
      {tipsSheet}
    </>
  );

  if (state === 'analyzing') return (
    <>
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-5xl animate-pulse">🔍</div>
        <p className="text-fg text-lg font-medium">{t('analyzing.label')}</p>
      </div>
      {tipsSheet}
    </>
  );

  if (state === 'overlay') return (
    <>
      <div className="flex flex-col h-full px-5 pt-3 pb-6 gap-4 overflow-y-auto">
        <ScanResultHeader
          onBack={() => { setObjects([]); setImageBase64(''); setError(''); setState('capture'); }}
          backAria={t('result.back_aria')}
        />
        <DetectedImage imageBase64={imageBase64} objects={objects} locale={locale} />
        <div className="relative flex items-end self-start">
          <div className="relative z-10 -mr-3 mb-[-4px] shrink-0">
            <Image
              src="/mascots/mascot-scan.png"
              alt=""
              width={64}
              height={64}
            />
          </div>
          <SpeechBubble tail="left" size="md">
            {objects.length === 0
              ? t('result.status_empty')
              : t('result.status_found', { count: objects.length })}
          </SpeechBubble>
        </div>
        <DetectedItemList
          objects={objects}
          locale={locale}
          groupLabels={{
            recyclable: t('result.group.recyclable'),
            food: t('result.group.food'),
            general: t('result.group.general'),
          }}
          onTapItem={obj => { setSelected([obj]); setState('video'); }}
        />
      </div>
      {tipsSheet}
    </>
  );

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0">
          <VideoPlayer
            objects={selected}
            locale={locale}
            backLabel={t('video.back')}
            onBack={() => setState('overlay')}
          />
        </div>
      </div>
      {tipsSheet}
    </>
  );
}
