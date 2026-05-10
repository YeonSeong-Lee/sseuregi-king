import { cloudVisionDetect } from './vision';
import { analyzeImage } from './analyze';
import { enrichObjects } from './matcher';
import type { DetectedObject } from '@/types';

export async function detectWaste(base64Image: string): Promise<DetectedObject[]> {
  if (process.env.DISABLE_CLOUD_VISION !== 'true') {
    try {
      const visionRaw = await cloudVisionDetect(base64Image);
      const visionEnriched = enrichObjects(visionRaw);

      if (
        visionEnriched.length > 0 &&
        visionEnriched.every(o => o.itemId !== null)
      ) {
        return visionEnriched;
      }
    } catch (err) {
      console.warn('cloud vision failed, falling back to claude:', err);
    }
  }

  const claudeRaw = await analyzeImage(base64Image);
  return enrichObjects(claudeRaw);
}
