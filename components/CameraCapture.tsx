// components/CameraCapture.tsx
'use client';
import { useRef, useState } from 'react';
import { LiveCamera } from './LiveCamera';
import { fileToBase64 } from '@/lib/image';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onError?: () => void;
  cameraLabel: string;
  galleryLabel: string;
  shutterAria: string;
  cancelAria: string;
  usePhotoLabel: string;
  retakeLabel: string;
}

function liveCameraSupported(): boolean {
  return typeof navigator !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia
    && (typeof window === 'undefined' || window.isSecureContext);
}

export function CameraCapture({
  onCapture, onError, cameraLabel, galleryLabel,
  shutterAria, cancelAria, usePhotoLabel, retakeLabel,
}: CameraCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [showLive, setShowLive] = useState(false);

  async function handleFile(file: File | undefined, input: HTMLInputElement) {
    input.value = '';
    if (!file) return;
    try {
      onCapture(await fileToBase64(file));
    } catch {
      onError?.();
    }
  }

  function handleCameraTap() {
    if (liveCameraSupported()) setShowLive(true);
    else cameraRef.current?.click();
  }

  function handleUnsupported() {
    setShowLive(false);
    cameraRef.current?.click();
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={e => handleFile(e.target.files?.[0], e.target as HTMLInputElement)} />
      <input ref={galleryRef} type="file" accept="image/*"
        className="hidden" onChange={e => handleFile(e.target.files?.[0], e.target as HTMLInputElement)} />
      <button onClick={handleCameraTap}
        className="flex items-center justify-center gap-2 bg-blue-500 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform">
        📷 {cameraLabel}
      </button>
      <button onClick={() => galleryRef.current?.click()}
        className="flex items-center justify-center gap-2 bg-zinc-700 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform">
        🖼️ {galleryLabel}
      </button>
      {showLive && (
        <LiveCamera
          onCapture={(b64) => { setShowLive(false); onCapture(b64); }}
          onCancel={() => setShowLive(false)}
          onUnsupported={handleUnsupported}
          shutterAria={shutterAria}
          cancelAria={cancelAria}
          usePhotoLabel={usePhotoLabel}
          retakeLabel={retakeLabel}
        />
      )}
    </div>
  );
}
