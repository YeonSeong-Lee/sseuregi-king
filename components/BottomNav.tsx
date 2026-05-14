// components/BottomNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  locale: string;
  scanLabel: string;
  guideLabel: string;
}

export function BottomNav({ locale, scanLabel, guideLabel }: BottomNavProps) {
  const pathname = usePathname();
  const isGuide = pathname.includes('/collection');
  return (
    <nav className="flex border-t border-zinc-800 bg-zinc-950 shrink-0">
      <Link href={`/${locale}/scan`}
        className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 ${!isGuide ? 'text-blue-400' : 'text-zinc-500'}`}>
        <span className="text-xl">📷</span>{scanLabel}
      </Link>
      <Link href={`/${locale}/collection`}
        className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 ${isGuide ? 'text-blue-400' : 'text-zinc-500'}`}>
        <span className="text-xl">📖</span>{guideLabel}
      </Link>
    </nav>
  );
}
