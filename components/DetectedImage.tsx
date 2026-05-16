// components/DetectedImage.tsx
'use client';
import Image from 'next/image';
import { SpeechBubble } from '@/components/SpeechBubble';
import type { DetectedObject, Locale } from '@/types';

interface DetectedImageProps {
  imageBase64: string;
  objects: DetectedObject[];
  locale: Locale;
}

// Below this y%, a "label above bbox" bubble would clip the container top —
// flip the bubble below the bbox in that case.
const FLIP_THRESHOLD_Y = 8;

export function DetectedImage({ imageBase64, objects, locale }: DetectedImageProps) {
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
        const label = obj.name[locale] || obj.name.en;
        const labelAbove = obj.bbox.y >= FLIP_THRESHOLD_Y;
        const bubbleTop = labelAbove
          ? `${obj.bbox.y}%`
          : `${obj.bbox.y + obj.bbox.h}%`;
        const bubbleTransform = labelAbove
          ? 'translate(-50%, -100%)'
          : 'translate(-50%, 0)';
        return (
          <div
            key={`${obj.name.en}-${i}`}
            data-testid="bbox-tag"
            className="absolute"
            style={{
              left: `${obj.bbox.x + obj.bbox.w / 2}%`,
              top: bubbleTop,
              transform: bubbleTransform,
            }}
          >
            <SpeechBubble size="sm" tail={labelAbove ? 'down' : 'up'}>
              {label}
            </SpeechBubble>
          </div>
        );
      })}
    </div>
  );
}
