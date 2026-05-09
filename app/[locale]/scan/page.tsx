// app/[locale]/scan/page.tsx
'use client';
import { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { CameraCapture } from '@/components/CameraCapture';
import { ObjectOverlay } from '@/components/ObjectOverlay';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useCollection } from '@/hooks/useCollection';
import type { DetectedObject, Locale } from '@/types';

type ScanState = 'capture' | 'analyzing' | 'overlay' | 'video';

export default function ScanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const { unlock } = useCollection();

  const [state, setState] = useState<ScanState>('capture');
  const [imageBase64, setImageBase64] = useState('');
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const [selected, setSelected] = useState<DetectedObject[]>([]);
  const [error, setError] = useState('');

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
      const validIds = data.objects.map(o => o.itemId).filter((id): id is string => id !== null);
      if (validIds.length > 0) unlock(validIds);
      setState('overlay');
    } catch {
      setError('Failed to analyze. Please try again.');
      setState('capture');
    }
  }

  if (state === 'capture') return (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-8">
      <div className="text-center">
        <div className="text-5xl mb-2">📷</div>
        <p className="text-zinc-400 text-sm">{t('overlay.tap_hint')}</p>
      </div>
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      <CameraCapture onCapture={handleCapture}
        onError={() => setError('Failed to process image. Please try again.')}
        cameraLabel={t('scan.camera')} galleryLabel={t('scan.gallery')} />
    </div>
  );

  if (state === 'analyzing') return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-5xl animate-pulse">🔍</div>
      <p className="text-white text-lg font-medium">{t('analyzing.label')}</p>
    </div>
  );

  if (state === 'overlay') return (
    <ObjectOverlay
      imageBase64={imageBase64}
      objects={objects}
      locale={locale as Locale}
      tapHint={objects.length === 0 ? t('overlay.no_items') : t('overlay.tap_hint')}
      seeGuideLabel={t('scan.see_guide')}
      onSeeGuide={sel => { setSelected(sel); setState('video'); }}
    />
  );

  return (
    <VideoPlayer
      objects={selected}
      locale={locale as Locale}
      categoryLabels={{
        recycling: t('categories.recycling'),
        food: t('categories.food'),
        general: t('categories.general'),
        large: t('categories.large'),
      }}
      backLabel={t('video.back')}
      noVideoLabel={t('video.no_video')}
      onBack={() => setState('overlay')}
    />
  );
}
