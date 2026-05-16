import Image from 'next/image';
import type { BagCode } from '@/types';

export function BagIcon({ id }: { id: BagCode }) {
  return (
    <Image
      src={`/bag-icons/${id}.png`}
      alt=""
      width={20}
      height={20}
      className="w-5 h-5 object-contain"
    />
  );
}
