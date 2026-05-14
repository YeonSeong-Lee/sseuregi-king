// components/PhotoTipsSheet.tsx
'use client';
import { useEffect, useId, useRef } from 'react';

interface Tip {
  emoji: string;
  title: string;
  body: string;
}

interface PhotoTipsSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  closeAria: string;
  tips: Tip[];
}

export function PhotoTipsSheet({ open, onClose, title, closeAria, tips }: PhotoTipsSheetProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={closeAria}
        onClick={onClose}
        className={`absolute inset-0 w-full h-full bg-black/50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute bottom-0 left-0 right-0 bg-surface-elev border-t border-line rounded-t-2xl shadow-xl transition-transform duration-200 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 id={titleId} className="text-fg text-base font-semibold">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label={closeAria}
            onClick={onClose}
            className="w-9 h-9 -mr-2 rounded-full text-fg-muted text-xl flex items-center justify-center active:scale-95 transition-transform"
          >
            ×
          </button>
        </div>
        <ul className="px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-2 space-y-4">
          {tips.map(tip => (
            <li key={tip.title} className="flex gap-3 items-start">
              <span className="text-2xl shrink-0 leading-none mt-0.5" aria-hidden="true">
                {tip.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-fg font-semibold">{tip.title}</p>
                <p className="text-fg-muted text-sm leading-relaxed">{tip.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
