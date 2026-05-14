'use client';
import { useState } from 'react';
import type { YoutubeVideo } from '@/lib/youtube';

interface YoutubeLinkCardProps {
  video: YoutubeVideo;
  ctaLabel: string;
  className?: string;
}

export function YoutubeLinkCard({ video, ctaLabel, className }: YoutubeLinkCardProps) {
  const [active, setActive] = useState(false);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;

  return (
    <div
      className={`w-full max-w-2xl rounded-xl overflow-hidden bg-surface-elev border border-line ${className ?? ''}`}
    >
      <div className="relative aspect-video bg-black">
        {active ? (
          <iframe
            key={video.id}
            src={embedUrl}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            aria-label={video.title}
            className="group absolute inset-0 w-full h-full cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-16 h-16 rounded-full bg-red-600/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="w-7 h-7 text-white translate-x-0.5"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        )}
      </div>
      <div className="px-4 py-3">
        <p className="text-fg text-sm font-medium line-clamp-2">{video.title}</p>
        <a
          href={video.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-red-600 dark:text-red-400 text-xs font-medium inline-flex items-center gap-1 hover:underline"
        >
          {ctaLabel}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
