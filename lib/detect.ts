import { cloudVisionDetect } from './vision';
import { enrichObjects } from './matcher';
import type { DetectedObject } from '@/types';

export async function detectWaste(base64Image: string): Promise<DetectedObject[]> {
  const raw = await cloudVisionDetect(base64Image);
  return enrichObjects(raw);
}
