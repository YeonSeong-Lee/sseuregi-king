import Anthropic from '@anthropic-ai/sdk';
import type { DetectedObject } from '@/types';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  _client = new Anthropic({ apiKey });
  return _client;
}

export async function claudeDetect(_base64Image: string): Promise<DetectedObject[]> {
  getClient();
  throw new Error('not implemented');
}
