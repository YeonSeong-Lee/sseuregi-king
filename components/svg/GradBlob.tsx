import Image from 'next/image';

interface GradBlobProps {
  className?: string;
}

export function GradBlob({ className }: GradBlobProps) {
  return (
    <div className={`relative ${className ?? ''}`}>
      <Image
        src="/mascots/mascot-happy.png"
        alt="mascot"
        fill
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
