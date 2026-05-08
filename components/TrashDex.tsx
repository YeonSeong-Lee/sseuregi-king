// components/TrashDex.tsx
import type { WasteItem, Locale } from '@/types';

const CATEGORY_BORDER: Record<string, string> = {
  recycling: 'border-blue-500',
  food: 'border-green-500',
  general: 'border-zinc-500',
  large: 'border-orange-500',
};

interface TrashDexProps {
  items: WasteItem[];
  unlockedIds: string[];
  locale: Locale;
  lockedLabel: string;
  progress: string;
}

export function TrashDex({ items, unlockedIds, locale, lockedLabel, progress }: TrashDexProps) {
  const unlockedCount = items.filter(item => unlockedIds.includes(item.id)).length;

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="px-4 pt-6 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-white text-2xl font-bold">Trash Dex</h1>
          <span className="text-blue-400 text-sm">{progress}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${items.length > 0 ? (unlockedCount / items.length) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {items.map(item => {
            const unlocked = unlockedIds.includes(item.id);
            return (
              <div key={item.id}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 bg-zinc-900 p-1 ${
                  unlocked ? CATEGORY_BORDER[item.category] : 'border-zinc-700 opacity-50'
                }`}>
                <span className={`text-2xl ${unlocked ? '' : 'grayscale brightness-0'}`}>{item.emoji}</span>
                <span className={`text-center text-[10px] mt-1 leading-tight ${unlocked ? 'text-white' : 'text-zinc-600'}`}>
                  {unlocked ? item.names[locale] : lockedLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
