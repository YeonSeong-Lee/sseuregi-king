import { describe, it, expect } from 'vitest';
import { getYoutubeVideo } from '@/lib/youtube';
import fallback from '@/data/youtube-fallback.json';

describe('getYoutubeVideo', () => {
  it('falls back to the locale-general video when category has no override', () => {
    for (const locale of ['en', 'ja', 'zh', 'ru'] as const) {
      const video = getYoutubeVideo('plastic', locale);
      expect(video.id).toBe(fallback[locale].id);
      expect(video.title).toBe(fallback[locale].title);
    }
  });

  it('builds canonical watch and thumbnail URLs from the video id', () => {
    const video = getYoutubeVideo('food', 'en');
    expect(video.watchUrl).toBe(`https://www.youtube.com/watch?v=${video.id}`);
    expect(video.thumbnailUrl).toBe(`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`);
  });

  it('returns a video for every category × locale pair', () => {
    const categories = [
      'paper', 'paper_carton', 'glass', 'metal_can', 'plastic', 'vinyl',
      'styrofoam', 'clothing', 'lightbulb', 'food', 'general', 'large',
    ] as const;
    for (const category of categories) {
      for (const locale of ['en', 'ja', 'zh', 'ru'] as const) {
        const video = getYoutubeVideo(category, locale);
        expect(video.id, `${category} / ${locale}`).toBeTruthy();
        expect(video.title.length, `${category} / ${locale}`).toBeGreaterThan(0);
      }
    }
  });
});
