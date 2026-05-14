// app/[locale]/scan/page.tsx
'use client';
import { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { CameraCapture } from '@/components/CameraCapture';
import { ObjectOverlay } from '@/components/ObjectOverlay';
import { VideoPlayer } from '@/components/VideoPlayer';
import { MainBgWatcher } from '@/components/svg/MainBgWatcher';
import { useDistrictContext } from '@/contexts/DistrictContext';
import { isSupported } from '@/data/districts';
import { buildCategoryLabels, getCategoryDisposalText } from '@/lib/categories';
import type { DetectedObject, Locale } from '@/types';

type ScanState = 'capture' | 'analyzing' | 'overlay' | 'video';

export default function ScanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = use(params);
  const locale = rawLocale as Locale;
  const t = useTranslations();
  const district = useDistrictContext();

  const [state, setState] = useState<ScanState>('capture');
  const [imageBase64, setImageBase64] = useState('');
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const [selected, setSelected] = useState<DetectedObject[]>([]);
  const [error, setError] = useState('');

  const supportedCode =
    (district.state.status === 'detected' || district.state.status === 'manual') &&
    isSupported(district.state.info.code)
      ? district.state.info.code
      : null;

  const disposalTexts: Record<string, string | null> = {};
  for (const obj of selected) {
    disposalTexts[obj.category] = getCategoryDisposalText(obj.category, supportedCode, locale);
  }

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
    } catch {
      setError('Failed to analyze. Please try again.');
      setState('capture');
    }
  }

  if (state === 'capture') return (
    <div className="flex flex-col h-full">
      <div className="relative flex flex-col items-center justify-center flex-1 px-4 gap-8">
        <MainBgWatcher className="absolute left-2 bottom-2 w-28 h-28 pointer-events-none select-none opacity-90" />
        <div className="relative z-10 text-center">
          <div className="text-5xl mb-2">📷</div>
          <p className="text-fg-muted text-sm">{t('overlay.tap_hint')}</p>
        </div>
        {error && <p className="relative z-10 text-red-600 dark:text-red-400 text-sm text-center">{error}</p>}
        <div className="relative z-10 w-full">
          <CameraCapture onCapture={handleCapture}
            onError={() => setError('Failed to process image. Please try again.')}
            cameraLabel={t('scan.camera')} galleryLabel={t('scan.gallery')}
            shutterAria={t('scan.shutter_aria')} cancelAria={t('scan.cancel_aria')}
            usePhotoLabel={t('scan.use_photo')} retakeLabel={t('scan.retake')} />
        </div>
      </div>
    </div>
  );

  if (state === 'analyzing') return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-5xl animate-pulse">🔍</div>
      <p className="text-fg text-lg font-medium">{t('analyzing.label')}</p>
    </div>
  );

  if (state === 'overlay') return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <ObjectOverlay
          imageBase64={imageBase64}
          objects={objects}
          locale={locale}
          tapHint={objects.length === 0 ? t('overlay.no_items') : t('overlay.tap_hint')}
          seeGuideLabel={t('scan.see_guide')}
          selectAllLabel={t('overlay.select_all')}
          deselectAllLabel={t('overlay.deselect_all')}
          retakeLabel={t('scan.retake')}
          onSeeGuide={sel => { setSelected(sel); setState('video'); }}
          onRetake={() => { setObjects([]); setImageBase64(''); setError(''); setState('capture'); }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <VideoPlayer
          objects={selected}
          locale={locale}
          categoryLabels={buildCategoryLabels(t)}
          backLabel={t('video.back')}
          watchOnYoutubeLabel={t('video.watch_on_youtube')}
          onBack={() => setState('overlay')}
          disposalTexts={disposalTexts}
        />
      </div>
    </div>
  );
}
