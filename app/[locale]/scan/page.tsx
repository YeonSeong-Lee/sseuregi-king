// app/[locale]/scan/page.tsx
'use client';
import { useState, use, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CameraCapture } from '@/components/CameraCapture';
import { ScanResultHeader } from '@/components/ScanResultHeader';
import { DetectedImage } from '@/components/DetectedImage';
import { DetectedItemList } from '@/components/DetectedItemList';
import { GuideTextSection } from '@/components/GuideTextSection';
import { SpeechBubble } from '@/components/SpeechBubble';
import { VideoPlayer } from '@/components/VideoPlayer';
import { PhotoTipsSheet } from '@/components/PhotoTipsSheet';
import { SadBlob } from '@/components/svg/SadBlob';
import type { DetectedObject, Locale } from '@/types';

type ScanState = 'capture' | 'analyzing' | 'overlay' | 'video';

const MASCOT_PHASES = 4;
const MASCOT_PHASE_INTERVAL_MS = 3000;

// Progress steps shown during the analyzing phase
const ANALYZING_STEPS = [0, 1, 2, 3] as const;

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
  const [mascotPhase, setMascotPhase] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [guideText, setGuideText] = useState('');
  const [isGuideFetching, setIsGuideFetching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (state !== 'analyzing') return;
    setMascotPhase(0);
    const id = setInterval(() => {
      setMascotPhase(p => Math.min(p + 1, MASCOT_PHASES - 1));
    }, MASCOT_PHASE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

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
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setImageBase64(base64);
    setObjects([]);
    setState('analyzing');
    setIsStreaming(true);
    setError('');
    setGuideText('');
    setIsGuideFetching(false);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error('Analysis failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      const collected: DetectedObject[] = [];
      let firstItemSeen = false;
      let serverError: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          let event: { type?: string; item?: DetectedObject; error?: string };
          try {
            event = JSON.parse(trimmed);
          } catch {
            continue;
          }
          if (event.type === 'item' && event.item) {
            collected.push(event.item);
            if (!firstItemSeen) {
              firstItemSeen = true;
              setState('overlay');
            }
            setObjects([...collected]);
          } else if (event.type === 'error') {
            serverError = event.error ?? 'Analysis failed';
          }
        }
      }

      setIsStreaming(false);
      if (serverError) throw new Error(serverError);

      if (!firstItemSeen) {
        setState('overlay');
        setTipsOpen(true);
      }

      // Fetch Claude text guide after items are detected
      if (collected.length > 0 && !controller.signal.aborted) {
        setIsGuideFetching(true);
        try {
          const guideRes = await fetch('/api/guide-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: collected, locale }),
            signal: controller.signal,
          });
          if (guideRes.ok && guideRes.body) {
            const reader = guideRes.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              setGuideText(prev => prev + decoder.decode(value, { stream: true }));
            }
          }
        } catch (guideErr) {
          if ((guideErr as { name?: string }).name !== 'AbortError') {
            console.warn('guide-text fetch failed:', guideErr);
          }
        } finally {
          setIsGuideFetching(false);
        }
      }
    } catch (err) {
      setIsStreaming(false);
      if ((err as { name?: string }).name === 'AbortError') return;
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
      <div className="flex flex-col h-full">
        {/* Captured image with scan-line overlay */}
        <div className="relative flex-1 min-h-0 overflow-hidden bg-black">
          {imageBase64 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/jpeg;base64,${imageBase64}`}
              alt=""
              className="w-full h-full object-contain"
            />
          )}

          {/* Scanning line */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80 animate-scan-line"
          />

          {/* Corner brackets */}
          <div aria-hidden="true" className="absolute inset-4 pointer-events-none">
            <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
            <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br" />
          </div>
        </div>

        {/* Bottom info panel */}
        <div className="flex flex-col gap-4 px-5 py-5">
          {/* Mascot + speech bubble row */}
          <div className="flex items-end gap-3">
            <Image
              src="/mascots/mascot-scan.png"
              alt=""
              width={72}
              height={72}
              className="shrink-0 animate-pulse"
            />
            <SpeechBubble tail="left-bottom" size="md" shape="card" className="flex-1 min-w-0">
              {t(`analyzing.label_${mascotPhase}`)}
            </SpeechBubble>
          </div>

          {/* Step progress dots */}
          <div className="flex items-center gap-2 px-1">
            {ANALYZING_STEPS.map(step => (
              <div
                key={step}
                className={[
                  'h-1.5 rounded-full transition-all duration-700',
                  step < mascotPhase
                    ? 'bg-emerald-500 flex-1'
                    : step === mascotPhase
                      ? 'bg-emerald-400 flex-[2] animate-pulse'
                      : 'bg-fg/20 flex-1',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
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
        <div className="relative">
          <DetectedImage imageBase64={imageBase64} objects={objects} />
          <div className="absolute bottom-0 left-0 translate-y-1/2 z-10 flex items-end max-w-full">
            <div className="shrink-0 -mr-3">
              <Image
                src={objects.length > 0 ? `/bag-icons/${objects[0].bag}.png` : '/mascots/mascot-scan.png'}
                alt=""
                width={96}
                height={96}
              />
            </div>
            <SpeechBubble tail="left-bottom" size="md" shape="card" className="flex-1 min-w-0 max-w-[calc(100%-72px)]">
              {objects.length > 0 && objects[0].mascotText
                ? objects[0].mascotText[locale] || objects[0].mascotText.en
                : objects.length === 0
                  ? t('result.status_empty')
                  : t('result.status_found', { count: objects.length })}
            </SpeechBubble>
          </div>
        </div>
        <div className="h-14" />
        <DetectedItemList
          objects={objects}
          isStreaming={isStreaming}
          groupLabels={{
            recyclable: t('result.group.recyclable'),
            food: t('result.group.food'),
            general: t('result.group.general'),
          }}
          onTapItem={() => {}}
        />
        <GuideTextSection
          text={guideText}
          isLoading={isGuideFetching}
          title={t('result.guide_title')}
        />
        {objects.length > 0 && objects[0].funnyFact && (
          <section className="rounded-2xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
            <h3 className="text-xs uppercase tracking-wide font-semibold text-amber-600 dark:text-amber-400">
              {t('result.did_you_know')}
            </h3>
            <p className="mt-1 text-sm text-fg leading-relaxed">
              {objects[0].funnyFact[locale] || objects[0].funnyFact.en}
            </p>
          </section>
        )}
        <a
          href="https://www.gangnam.go.kr/waste/apply/info.do?mid=ID03_020704"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full rounded-2xl border-2 border-rose-700/70 dark:border-rose-400/60 bg-rose-100 dark:bg-rose-500/15 py-4 text-sm font-bold text-fg tracking-wide active:scale-95 transition-transform"
        >
          {t('trash101.gangnam_apply_btn')}
        </a>
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
