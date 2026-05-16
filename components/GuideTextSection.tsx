'use client';

interface GuideTextSectionProps {
  text: string;
  isLoading: boolean;
  title: string;
}

export function GuideTextSection({ text, isLoading, title }: GuideTextSectionProps) {
  if (!isLoading && !text) return null;

  return (
    <section className="rounded-2xl border border-line bg-surface-elev px-4 py-4">
      <h3 className="text-xs uppercase tracking-wide font-semibold text-fg-muted mb-3">
        {title}
      </h3>

      {isLoading && !text ? (
        <div className="flex flex-col gap-2 animate-pulse">
          <span className="h-3.5 w-full rounded bg-fg/10" />
          <span className="h-3.5 w-5/6 rounded bg-fg/10" />
          <span className="h-3.5 w-4/5 rounded bg-fg/10" />
          <span className="h-3.5 w-full rounded bg-fg/10" />
          <span className="h-3.5 w-3/4 rounded bg-fg/10" />
        </div>
      ) : (
        <p className="text-sm text-fg leading-relaxed whitespace-pre-wrap">
          {text}
          {isLoading && (
            <span
              aria-hidden="true"
              className="inline-block w-0.5 h-3.5 bg-fg/60 ml-0.5 align-middle animate-pulse"
            />
          )}
        </p>
      )}
    </section>
  );
}
