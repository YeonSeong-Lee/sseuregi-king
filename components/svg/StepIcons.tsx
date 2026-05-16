import Image from 'next/image';
import type { VisualActionId } from '@/types';

export function StepIcon({ id }: { id: VisualActionId }) {
  return (
    <Image
      src={`/step-icons/${id}.png`}
      alt=""
      width={36}
      height={36}
      className="w-full h-full object-contain"
    />
  );
}
