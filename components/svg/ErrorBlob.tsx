import Image from 'next/image';

interface ErrorBlobProps {
  className?: string;
}

export function ErrorBlob({ className }: ErrorBlobProps) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <Image
        src="/mascots/mascot-reject.png"
        alt="mascot"
        fill
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
