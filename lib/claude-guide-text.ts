import Anthropic from '@anthropic-ai/sdk';
import type { DetectedObject, Locale } from '@/types';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
  _client = new Anthropic({ apiKey });
  return _client;
}

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  zh: 'Chinese (Simplified)',
  ja: 'Japanese',
  ru: 'Russian',
};

function buildPrompt(objects: DetectedObject[], locale: Locale): string {
  const langName = LOCALE_NAMES[locale];
  const itemSummaries = objects
    .map((obj, i) => {
      const steps = obj.steps.map((s, j) => `  ${j + 1}. ${s.text}`).join('\n');
      return `Item ${i + 1}: ${obj.name} (${obj.category})\nDisposal steps:\n${steps}`;
    })
    .join('\n\n');

  return `You are a friendly waste disposal guide for Gangnam-gu, Seoul.
Write a concise, practical disposal guide in ${langName} for the following detected items.
For each item, write 1-3 sentences explaining how to dispose of it correctly.
Use a helpful, warm tone. Be specific and actionable. No markdown formatting — plain text only.
Separate each item with a blank line.

Detected items:
${itemSummaries}`;
}

export async function* streamGuideText(
  objects: DetectedObject[],
  locale: Locale,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const client = getClient();
  const prompt = buildPrompt(objects, locale);

  const stream = client.messages.stream(
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    },
    { signal },
  );

  try {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  } finally {
    if (typeof (stream as { abort?: () => void }).abort === 'function') {
      (stream as { abort: () => void }).abort();
    }
  }
}
