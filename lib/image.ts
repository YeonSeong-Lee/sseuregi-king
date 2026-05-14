// lib/image.ts
export type CaptureSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

const MAX = 1024;
const QUALITY = 0.8;

function sourceDimensions(source: CaptureSource): { w: number; h: number } {
  if ('videoWidth' in source) return { w: source.videoWidth, h: source.videoHeight };
  if ('naturalWidth' in source) return { w: source.naturalWidth || source.width, h: source.naturalHeight || source.height };
  return { w: source.width, h: source.height };
}

export function captureToBase64Jpeg(source: CaptureSource): string {
  const { w, h } = sourceDimensions(source);
  if (!w || !h) throw new Error('source has no dimensions');
  const scale = Math.min(1, MAX / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas context unavailable');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', QUALITY).split(',')[1];
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        resolve(captureToBase64Jpeg(img));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}
