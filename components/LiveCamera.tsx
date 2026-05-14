// components/LiveCamera.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { captureToBase64Jpeg } from '@/lib/image';

interface LiveCameraProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
  onUnsupported: () => void;
  shutterAria: string;
  cancelAria: string;
  usePhotoLabel: string;
  retakeLabel: string;
}

type Phase = 'requesting' | 'streaming' | 'captured';

export function LiveCamera({
  onCapture, onCancel, onUnsupported,
  shutterAria, cancelAria, usePhotoLabel, retakeLabel,
}: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const capturedRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<Phase>('requesting');

  function stopStream() {
    const s = streamRef.current;
    streamRef.current = null;
    if (s) s.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch {
        if (!cancelled) onUnsupported();
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        try { await video.play(); } catch { /* autoplay may already have started */ }
      }
      if (!cancelled) setPhase('streaming');
    })();

    function onVisibility() {
      if (document.hidden) stopStream();
    }
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleShutter() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas context unavailable');
      ctx.drawImage(video, 0, 0);
      capturedRef.current = captureToBase64Jpeg(canvas);
      video.pause();
      setPhase('captured');
    } catch {
      stopStream();
      onUnsupported();
    }
  }

  function handleRetake() {
    capturedRef.current = null;
    setPhase('streaming');
    videoRef.current?.play().catch(() => { /* user gesture already granted */ });
  }

  function handleUse() {
    const b64 = capturedRef.current;
    if (!b64) return;
    stopStream();
    onCapture(b64);
  }

  function handleCancel() {
    stopStream();
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover"
      />
      {phase === 'captured' && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

      <div className="absolute top-0 left-0 right-0 pt-[env(safe-area-inset-top)] flex">
        <button
          type="button"
          aria-label={cancelAria}
          onClick={handleCancel}
          className="m-4 w-11 h-11 rounded-full bg-black/50 text-white text-2xl flex items-center justify-center active:scale-95 transition-transform"
        >
          ×
        </button>
      </div>

      {phase === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-5xl animate-pulse">📷</div>
        </div>
      )}

      {phase === 'streaming' && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            aria-label={shutterAria}
            onClick={handleShutter}
            className="mb-8 w-20 h-20 rounded-full bg-white ring-4 ring-white/40 active:scale-95 transition-transform"
          />
        </div>
      )}

      {phase === 'captured' && (
        <div className="absolute bottom-0 left-0 right-0 flex gap-4 px-4 pb-[env(safe-area-inset-bottom)] mb-4">
          <button
            type="button"
            onClick={handleRetake}
            className="flex-1 bg-zinc-700 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform"
          >
            {retakeLabel}
          </button>
          <button
            type="button"
            onClick={handleUse}
            className="flex-1 bg-blue-500 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform"
          >
            {usePhotoLabel}
          </button>
        </div>
      )}
    </div>
  );
}
