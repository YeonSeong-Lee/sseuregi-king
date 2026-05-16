import type { ComponentType } from 'react';
import { CoffeeCup } from './svg/CoffeeCup';
import { SodaCan } from './svg/SodaCan';
import { Banana } from './svg/Banana';

export type TrashIcon = ComponentType<{ className?: string }>;

export interface TrashItem {
  id: string;
  Component: TrashIcon;
}

export const TRASH_ITEMS: TrashItem[] = [
  { id: 'coffee', Component: CoffeeCup },
  { id: 'can', Component: SodaCan },
  { id: 'banana', Component: Banana },
];
