import Image from 'next/image';

interface ScopeBlobProps {
  className?: string;
}

export function ScopeBlob({ className }: ScopeBlobProps) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <Image
        src="/mascots/mascot-scan.png"
        alt="mascot"
        fill
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
