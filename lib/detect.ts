import { claudeDetect } from './claude-vision';
import type { DetectedObject } from '@/types';

export async function detectWaste(base64Image: string): Promise<DetectedObject[]> {
  return claudeDetect(base64Image);
}
