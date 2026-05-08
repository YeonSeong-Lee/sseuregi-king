// components/CameraCapture.tsx
'use client';
import { useRef } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  cameraLabel: string;
  galleryLabel: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1024;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function CameraCapture({ onCapture, cameraLabel, galleryLabel }: CameraCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    onCapture(await fileToBase64(file));
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      <input ref={galleryRef} type="file" accept="image/*"
        className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
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
