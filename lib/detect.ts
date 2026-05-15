import { cloudVisionDetect } from './vision';
import { claudeDetect } from './claude-vision';
import { enrichObjects } from './matcher';
import type { DetectedObject } from '@/types';

export async function detectWaste(base64Image: string): Promise<DetectedObject[]> {
  if (process.env.DETECT_PROVIDER === 'claude') {
    return claudeDetect(base64Image);
  }
  const raw = await cloudVisionDetect(base64Image);
  return enrichObjects(raw);
}
