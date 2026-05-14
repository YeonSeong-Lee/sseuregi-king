import youtubeFallbackData from '@/data/youtube-fallback.json';
import { getCategoryDef } from '@/lib/categories';
import type { Locale, WasteCategory, YoutubePick } from '@/types';

const fallback = youtubeFallbackData as unknown as Record<Locale, YoutubePick>;

export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  watchUrl: string;
}

export function getYoutubeVideo(
  category: WasteCategory,
  locale: Locale,
): YoutubeVideo {
  const def = getCategoryDef(category);
  const pick = def.youtube?.[locale] ?? fallback[locale] ?? fallback.en;
  return {
    id: pick.id,
    title: pick.title,
    thumbnailUrl: `https://i.ytimg.com/vi/${pick.id}/hqdefault.jpg`,
    watchUrl: `https://www.youtube.com/watch?v=${pick.id}`,
  };
}
