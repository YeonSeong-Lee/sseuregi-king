import { claudeDetect, claudeDetectStream } from './claude-vision';
import type { DetectedObject } from '@/types';

export async function detectWaste(base64Image: string): Promise<DetectedObject[]> {
  return claudeDetect(base64Image);
}

export function detectWasteStream(
  base64Image: string,
  signal?: AbortSignal,
): AsyncGenerator<DetectedObject, void, unknown> {
  return claudeDetectStream(base64Image, signal);
}
