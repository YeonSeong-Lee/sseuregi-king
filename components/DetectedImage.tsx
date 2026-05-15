// components/DetectedImage.tsx
'use client';
import Image from 'next/image';
import { SpeechBubble } from '@/components/SpeechBubble';
import type { DetectedObject, Locale } from '@/types';

const NAME_KEY: Record<Locale, keyof Pick<DetectedObject, 'nameEn' | 'nameZh' | 'nameJa' | 'nameRu'>> = {
  en: 'nameEn', zh: 'nameZh', ja: 'nameJa', ru: 'nameRu',
};

interface DetectedImageProps {
  imageBase64: string;
  objects: DetectedObject[];
  locale: Locale;
}

// Below this y%, a "label above bbox" bubble would clip the container top —
// flip the bubble below the bbox in that case.
const FLIP_THRESHOLD_Y = 8;

export function DetectedImage({ imageBase64, objects, locale }: DetectedImageProps) {
  const nameKey = NAME_KEY[locale];

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-500"
      data-testid="detected-image"
    >
      {imageBase64 && (
        <Image
          src={`data:image/jpeg;base64,${imageBase64}`}
          alt=""
          fill
          unoptimized
          className="object-cover"
        />
      )}
      {objects.map((obj, i) => {
        const labelAbove = obj.bbox.y >= FLIP_THRESHOLD_Y;
        const bubbleTop = labelAbove
          ? `${obj.bbox.y}%`
          : `${obj.bbox.y + obj.bbox.h}%`;
        const bubbleTransform = labelAbove
          ? 'translate(-50%, -100%)'
          : 'translate(-50%, 0)';
        return (
          <div key={`${obj.nameEn}-${i}`}>
            <div
              data-testid="bbox-rect"
              className="absolute border-2 border-dashed border-fg/80 rounded-xl pointer-events-none"
              style={{
                left: `${obj.bbox.x}%`,
                top: `${obj.bbox.y}%`,
                width: `${obj.bbox.w}%`,
                height: `${obj.bbox.h}%`,
              }}
            />
            <div
              className="absolute"
              style={{
                left: `${obj.bbox.x + obj.bbox.w / 2}%`,
                top: bubbleTop,
                transform: bubbleTransform,
              }}
            >
              <SpeechBubble size="sm" tail={labelAbove ? 'down' : 'up'}>
                {obj[nameKey]}
              </SpeechBubble>
            </div>
          </div>
        );
      })}
    </div>
  );
}
