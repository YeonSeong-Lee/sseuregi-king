// app/[locale]/scan/page.tsx
'use client';
import { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { CameraCapture } from '@/components/CameraCapture';
import { ObjectOverlay } from '@/components/ObjectOverlay';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DistrictBadge } from '@/components/DistrictBadge';
import { useCollection } from '@/hooks/useCollection';
import { useDistrict } from '@/hooks/useDistrict';
import { isSupported } from '@/data/districts';
import { getDisposalText } from '@/lib/disposal';
import type { DetectedObject, Locale } from '@/types';

type ScanState = 'capture' | 'analyzing' | 'overlay' | 'video';

export default function ScanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = use(params);
  const locale = rawLocale as Locale;
  const t = useTranslations();
  const { unlock } = useCollection();
  const district = useDistrict();

  const [state, setState] = useState<ScanState>('capture');
  const [imageBase64, setImageBase64] = useState('');
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const [selected, setSelected] = useState<DetectedObject[]>([]);
  const [error, setError] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const supportedCode =
    (district.state.status === 'detected' || district.state.status === 'manual') &&
    isSupported(district.state.info.code)
      ? district.state.info.code
      : null;

  const districtDisplayName =
    district.state.status === 'detected' ||
    district.state.status === 'manual' ||
    district.state.status === 'unsupported'
      ? district.state.info.names[locale]
      : null;

  const disposalSubtitle = supportedCode && districtDisplayName
    ? t('district.supported_subtitle', { name: districtDisplayName })
    : null;

  const unsupportedHint =
    district.state.status === 'unsupported' && districtDisplayName
      ? t('district.unsupported_hint', { name: districtDisplayName })
      : district.state.status === 'no_match'
        ? t('district.no_match_hint')
        : null;

  const disposalTexts: Record<string, string | null> = {};
  for (const obj of selected) {
    const key = obj.itemId ?? obj.nameEn;
    disposalTexts[key] = getDisposalText(obj.itemId, supportedCode, locale);
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
      const validIds = data.objects.map(o => o.itemId).filter((id): id is string => id !== null);
      if (validIds.length > 0) unlock(validIds);
      setState('overlay');
    } catch {
      setError('Failed to analyze. Please try again.');
      setState('capture');
    }
  }

  const headerBar = state !== 'analyzing' && (
    <div className="flex items-center justify-end px-4 pt-3 pb-2 shrink-0">
      <DistrictBadge
        state={district.state}
        locale={locale}
        onRequestGPS={district.requestGPS}
        onSetManual={district.setManual}
        onClear={district.clear}
      />
    </div>
  );

  const showFirstPrompt =
    state === 'capture' &&
    district.state.status === 'unknown' &&
    !bannerDismissed;

  if (state === 'capture') return (
    <div className="flex flex-col h-full">
      {headerBar}
      <div className="flex flex-col items-center justify-center flex-1 px-4 gap-8">
        {showFirstPrompt && (
          <div className="w-full bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 text-sm text-blue-200">
            <p className="mb-2">{t('district.first_prompt')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setBannerDismissed(true); district.requestGPS(); }}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm font-medium"
              >
                {t('district.use_gps')}
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="px-3 bg-zinc-800 text-zinc-300 rounded-xl py-2 text-sm"
              >
                {t('district.skip')}
              </button>
            </div>
          </div>
        )}
        <div className="text-center">
          <div className="text-5xl mb-2">📷</div>
          <p className="text-zinc-400 text-sm">{t('overlay.tap_hint')}</p>
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <CameraCapture onCapture={handleCapture}
          onError={() => setError('Failed to process image. Please try again.')}
          cameraLabel={t('scan.camera')} galleryLabel={t('scan.gallery')} />
      </div>
    </div>
  );

  if (state === 'analyzing') return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-5xl animate-pulse">🔍</div>
      <p className="text-white text-lg font-medium">{t('analyzing.label')}</p>
    </div>
  );

  if (state === 'overlay') return (
    <div className="flex flex-col h-full">
      {headerBar}
      <div className="flex-1 min-h-0">
        <ObjectOverlay
          imageBase64={imageBase64}
          objects={objects}
          locale={locale}
          tapHint={objects.length === 0 ? t('overlay.no_items') : t('overlay.tap_hint')}
          seeGuideLabel={t('scan.see_guide')}
          selectAllLabel={t('overlay.select_all')}
          deselectAllLabel={t('overlay.deselect_all')}
          onSeeGuide={sel => { setSelected(sel); setState('video'); }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {headerBar}
      <div className="flex-1 min-h-0">
        <VideoPlayer
          objects={selected}
          locale={locale}
          categoryLabels={{
            recycling: t('categories.recycling'),
            food: t('categories.food'),
            general: t('categories.general'),
            large: t('categories.large'),
          }}
          backLabel={t('video.back')}
          noVideoLabel={t('video.no_video')}
          onBack={() => setState('overlay')}
          disposalTexts={disposalTexts}
          disposalSubtitle={disposalSubtitle}
          unsupportedHint={unsupportedHint}
        />
      </div>
    </div>
  );
}
