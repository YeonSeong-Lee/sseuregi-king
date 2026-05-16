// components/DetectedItemList.tsx
'use client';
import { type CategoryGroup } from '@/lib/categories';
import { StepRow } from '@/components/StepRow';
import type { DetectedObject, ScanCategory } from '@/types';

const SCAN_GROUP: Record<ScanCategory, CategoryGroup> = {
  'Recyclable':    'recyclable',
  'General Waste': 'general',
  'Food Waste':    'food',
  'Hazardous':     'general',
  'Bulky':         'general',
};

const GROUP_PILL: Record<CategoryGroup, string> = {
  recyclable: 'bg-emerald-700 text-white',
  food: 'bg-orange-600 text-white',
  general: 'bg-zinc-500 text-white',
};

function SkeletonCard({ index }: { index: number }) {
  return (
    <li
      aria-hidden="true"
      style={{ animationDelay: `${index * 120}ms` }}
      className="flex items-center gap-3 w-full px-3 py-4 rounded-2xl border-2 border-fg/20 bg-surface-elev animate-pulse"
    >
      <span className="shrink-0 w-9 h-9 rounded-full bg-fg/15" />
      <span className="flex-1 min-w-0 flex flex-col gap-2">
        <span className="h-4 w-2/3 rounded bg-fg/15" />
        <span className="h-3 w-1/4 rounded-full bg-fg/10" />
      </span>
      <span className="shrink-0 w-8 h-10 rounded-lg bg-fg/15" />
      <span className="shrink-0 w-5 h-5 rounded bg-fg/10" />
    </li>
  );
}

interface DetectedItemListProps {
  objects: DetectedObject[];
  isStreaming?: boolean;
  groupLabels: Record<CategoryGroup, string>;
  onTapItem: (obj: DetectedObject) => void;
}

export function DetectedItemList({ objects, isStreaming = false, groupLabels, onTapItem }: DetectedItemListProps) {
  return (
    <ul className="flex flex-col gap-3 w-full">
      {objects.map((obj, i) => {
        const group = SCAN_GROUP[obj.category];
        const label = obj.name;
        return (
          <li
            key={`${obj.name}-${i}`}
            className="animate-fade-in"
          >
            <div className="rounded-2xl border-2 border-fg bg-surface-elev overflow-hidden">
              <div
                className="flex items-center gap-3 w-full px-3 py-4 text-left"
              >
                <span
                  aria-hidden="true"
                  className="shrink-0 w-9 h-9 rounded-full bg-fg text-accent-fg flex items-center justify-center font-bold text-sm"
                >
                  {i + 1}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-[family-name:var(--font-fraunces)] font-bold text-lg truncate">
                    {label}
                  </span>
                  <span className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${GROUP_PILL[group]}`}
                    >
                      {groupLabels[group]}
                    </span>
                  </span>
                </span>
              </div>
              <div className="border-t border-line px-3 pb-3">
                <StepRow
                  steps={obj.steps.map(s => ({ visualId: s.visual, label: s.text }))}

                />
              </div>
            </div>
          </li>
        );
      })}

      {/* Skeleton placeholders while streaming (show 1-2 shimmer cards) */}
      {isStreaming && (
        <>
          <SkeletonCard index={0} />
          {objects.length === 0 && <SkeletonCard index={1} />}
        </>
      )}
    </ul>
  );
}
