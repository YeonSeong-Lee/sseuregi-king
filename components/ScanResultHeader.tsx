// components/ScanResultHeader.tsx
'use client';
import { ScopeBlob } from '@/components/svg/ScopeBlob';

interface ScanResultHeaderProps {
  onBack: () => void;
  backAria: string;
}

export function ScanResultHeader({ onBack, backAria }: ScanResultHeaderProps) {
  return (
    <div className="flex items-center justify-between shrink-0">
      <button
        type="button"
        onClick={onBack}
        aria-label={backAria}
        className="w-11 h-11 -ml-2 flex items-center justify-center text-fg text-2xl active:scale-95 transition-transform"
      >
        <span aria-hidden="true">←</span>
      </button>
      <ScopeBlob className="w-10 h-10" />
    </div>
  );
}
