import Image from 'next/image';
import type { VisualActionId } from '@/types';

export function StepIcon({ id }: { id: VisualActionId }) {
  return (
    <Image
      src={`/step-icons/${id}.png`}
      alt=""
      width={160}
      height={160}
      className="w-full h-full object-contain"
    />
  );
}
