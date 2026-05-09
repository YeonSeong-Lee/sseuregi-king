// components/CameraCapture.tsx
'use client';
import { useRef } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onError?: () => void;
  cameraLabel: string;
  galleryLabel: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const MAX = 1024;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error('canvas context unavailable')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}

export function CameraCapture({ onCapture, onError, cameraLabel, galleryLabel }: CameraCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined, input: HTMLInputElement) {
    input.value = '';
    if (!file) return;
    try {
      onCapture(await fileToBase64(file));
    } catch {
      onError?.();
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={e => handleFile(e.target.files?.[0], e.target as HTMLInputElement)} />
      <input ref={galleryRef} type="file" accept="image/*"
        className="hidden" onChange={e => handleFile(e.target.files?.[0], e.target as HTMLInputElement)} />
      <button onClick={() => cameraRef.current?.click()}
        className="flex items-center justify-center gap-2 bg-blue-500 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform">
        📷 {cameraLabel}
      </button>
      <button onClick={() => galleryRef.current?.click()}
        className="flex items-center justify-center gap-2 bg-zinc-700 text-white rounded-2xl py-4 text-lg font-semibold active:scale-95 transition-transform">
        🖼️ {galleryLabel}
      </button>
    </div>
  );
}
