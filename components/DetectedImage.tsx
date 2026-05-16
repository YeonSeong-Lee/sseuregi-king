// components/DetectedImage.tsx
'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import { SpeechBubble } from '@/components/SpeechBubble';
import type { DetectedObject } from '@/types';

interface DetectedImageProps {
  imageBase64: string;
  objects: DetectedObject[];
}

// Below this y%, a "label above bbox" bubble would clip the container top —
// flip the bubble below the bbox in that case.
const FLIP_THRESHOLD_Y = 8;

// Approximate bubble dimensions in % of the image container.
// These are estimates; accurate enough for overlap resolution without
// needing DOM measurement.
const BUBBLE_W_PCT = 22;
const BUBBLE_H_PCT = 9;
const MAX_ITER = 15;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

interface BubblePos {
  cx: number;
  cy: number;
  tail: 'down' | 'up';
}

function resolvePositions(objects: DetectedObject[]): BubblePos[] {
  const positions: BubblePos[] = objects.map((obj) => {
    const labelAbove = obj.bbox.y >= FLIP_THRESHOLD_Y;
    return {
      cx: obj.bbox.x + obj.bbox.w / 2,
      cy: labelAbove
        ? obj.bbox.y - BUBBLE_H_PCT / 2
        : obj.bbox.y + obj.bbox.h + BUBBLE_H_PCT / 2,
      tail: labelAbove ? 'down' : 'up',
    };
  });

  for (let iter = 0; iter < MAX_ITER; iter++) {
    let moved = false;
    for (let a = 0; a < positions.length; a++) {
      for (let b = a + 1; b < positions.length; b++) {
        const dx = Math.abs(positions[a].cx - positions[b].cx);
        const dy = Math.abs(positions[a].cy - positions[b].cy);
        const overlapX = BUBBLE_W_PCT - dx;
        const overlapY = BUBBLE_H_PCT - dy;

        if (overlapX > 0 && overlapY > 0) {
          moved = true;
          // Push along the axis with the smaller overlap to minimise displacement.
          if (overlapY <= overlapX) {
            const push = overlapY / 2 + 0.5;
            if (positions[a].cy <= positions[b].cy) {
              positions[a].cy -= push;
              positions[b].cy += push;
            } else {
              positions[a].cy += push;
              positions[b].cy -= push;
            }
          } else {
            const push = overlapX / 2 + 0.5;
            if (positions[a].cx <= positions[b].cx) {
              positions[a].cx -= push;
              positions[b].cx += push;
            } else {
              positions[a].cx += push;
              positions[b].cx -= push;
            }
          }
        }
      }
    }
    if (!moved) break;
  }

  return positions.map((p) => ({
    ...p,
    cx: clamp(p.cx, BUBBLE_W_PCT / 2, 100 - BUBBLE_W_PCT / 2),
    cy: clamp(p.cy, BUBBLE_H_PCT / 2, 100 - BUBBLE_H_PCT / 2),
  }));
}

export function DetectedImage({ imageBase64, objects }: DetectedImageProps) {
  const positions = useMemo(() => resolvePositions(objects), [objects]);

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
        const { cx, cy, tail } = positions[i];
        return (
          <div
            key={`${obj.name.en}-${i}`}
            data-testid="bbox-tag"
            className="absolute"
            style={{
              left: `${cx}%`,
              top: `${cy}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <SpeechBubble size="sm" tail={tail}>
              {label}
            </SpeechBubble>
          </div>
        );
      })}
    </div>
  );
}
