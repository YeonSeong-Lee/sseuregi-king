import { describe, it, expect, vi, beforeEach } from 'vitest';

const { messagesStreamMock } = vi.hoisted(() => ({
  messagesStreamMock: vi.fn(),
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: function Anthropic() {
    return { messages: { stream: messagesStreamMock } };
  },
}));

// claudeDetect is re-imported in beforeEach so the module-level
// `_client` and `_systemPrompt` singletons are fresh per test.
let claudeDetect: typeof import('@/lib/claude-vision').claudeDetect;
let tryParseStrict: typeof import('@/lib/claude-vision').tryParseStrict;
let parsePartial: typeof import('@/lib/claude-vision').parsePartial;

beforeEach(async () => {
  messagesStreamMock.mockReset();
  delete process.env.ANTHROPIC_API_KEY;
  vi.resetModules();
  ({ claudeDetect, tryParseStrict, parsePartial } = await import('@/lib/claude-vision'));
});

type RawItem = Record<string, unknown>;

const L4 = (s: string) => ({ en: s, zh: s, ja: s, ru: s });

function goodItem(overrides: Partial<RawItem> = {}): RawItem {
  return {
    item_name: 'PET Water Bottle',
    category: 'Recyclable',
    bag: 'recycle',
    bbox: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
    steps: [{ visual: 'REMOVE_CAP_OR_LID_PUMP', text: 'Remove the cap' }],
    mascot_text: L4('Another one. Bold of you.'),
    funny_fact: L4('Korea uses 4.9B PET bottles per year.'),
    confidence: 'high',
    ...overrides,
  };
}

// Build a fake stream object that yields a sequence of text chunks as content_block_delta events.
function makeStream(chunks: string[]) {
  return {
    [Symbol.asyncIterator]() {
      let i = 0;
      return {
        async next() {
          if (i >= chunks.length) return { value: undefined, done: true };
          const value = {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: chunks[i++] },
          };
          return { value, done: false };
        },
      };
    },
    abort() {},
  };
}

function respondChunks(chunks: string[]): void {
  messagesStreamMock.mockImplementation(() => makeStream(chunks));
}

function respond(items: unknown): void {
  respondChunks([JSON.stringify(items)]);
}

describe('claudeDetect (stream)', () => {
  it('throws when ANTHROPIC_API_KEY is not set', async () => {
    await expect(claudeDetect('base64data')).rejects.toThrow('ANTHROPIC_API_KEY not set');
  });

  it('embeds the visual vocabulary and Korean disposal cheat sheet in the system prompt', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    respond([]);

    await claudeDetect('base64data');

    const callArg = messagesStreamMock.mock.calls[0][0];
    const systemText = Array.isArray(callArg.system) ? callArg.system[0].text : callArg.system;
    expect(systemText).toContain('general');
    expect(systemText).toContain('REMOVE_CAP_OR_LID_PUMP');
    expect(systemText).toContain('CALL_COMMUNITY_CENTER');
    expect(systemText).toContain('Cheat Sheet');
    expect(systemText).toContain('1599-0903');
    expect(systemText).not.toContain('T001');
    expect(systemText).toMatch(/Gangnam/);
  });

  it('passes output_config.format with json_schema to the Anthropic SDK', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    respond([]);

    await claudeDetect('base64data');

    const callArg = messagesStreamMock.mock.calls[0][0];
    expect(callArg.output_config?.format?.type).toBe('json_schema');
    expect(callArg.output_config?.format?.schema).toBeDefined();
  });

  it('parses a well-formed item with bbox converted to 0-100 percent', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    respond([goodItem()]);

    const result = await claudeDetect('base64data');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('PET Water Bottle');
    expect(result[0].category).toBe('Recyclable');
    expect(result[0].bag).toBe('recycle');
    expect(result[0].confidence).toBe('high');
    expect(result[0].steps[0].visual).toBe('REMOVE_CAP_OR_LID_PUMP');
    expect(result[0].steps[0].text).toBe('Remove the cap');
    expect(result[0].bbox.x).toBeCloseTo(10);
    expect(result[0].bbox.w).toBeCloseTo(30);
  });

  it('preserves all four locale strings on mascot_text and funny_fact', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    respond([goodItem({
      mascot_text: { en: 'A', zh: '甲', ja: 'ア', ru: 'А' },
      funny_fact: { en: 'F', zh: '事', ja: 'コト', ru: 'Ф' },
    })]);

    const r = (await claudeDetect('base64data'))[0];
    expect(r.mascotText.zh).toBe('甲');
    expect(r.funnyFact.ru).toBe('Ф');
  });

  it('returns empty array (no throw) when response is not valid JSON', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    respondChunks(['I see a newspaper.']);
    const result = await claudeDetect('base64data');
    expect(result).toEqual([]);
    warnSpy.mockRestore();
  });

  it('emits items as their JSON closes during streaming (progressive)', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const two = JSON.stringify([goodItem(), goodItem({ item_name: 'Can' })]);
    // Split the response into two chunks crossing the item boundary.
    const mid = two.indexOf('},{') + 1; // after the first item's closing brace
    respondChunks([two.slice(0, mid), two.slice(mid)]);

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('PET Water Bottle');
    expect(result[1].name).toBe('Can');
  });

  it('recovers complete items even if final item is truncated', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const two = JSON.stringify([goodItem(), goodItem({ item_name: 'Can' })]);
    const truncated = two.slice(0, two.length - 30); // second item gets cut mid-way
    respondChunks([truncated]);

    const result = await claudeDetect('base64data');
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].name).toBe('PET Water Bottle');
    warnSpy.mockRestore();
  });
});

describe('tryParseStrict', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ tryParseStrict } = await import('@/lib/claude-vision'));
  });

  it('returns array of coerced items on valid JSON array', () => {
    const text = JSON.stringify([goodItem()]);
    const result = tryParseStrict(text);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
  });

  it('returns null on syntactically invalid JSON', () => {
    expect(tryParseStrict('[ {"x": 1, ')).toBeNull();
    expect(tryParseStrict('not json at all')).toBeNull();
  });

  it('returns null on non-array JSON', () => {
    expect(tryParseStrict('{"x": 1}')).toBeNull();
  });

  it('strips markdown fences before parsing', () => {
    const json = JSON.stringify([goodItem()]);
    const result = tryParseStrict('```json\n' + json + '\n```');
    expect(result).toHaveLength(1);
  });
});

describe('parsePartial', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ parsePartial } = await import('@/lib/claude-vision'));
  });

  it('extracts complete items from truncated array', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const two = JSON.stringify([goodItem(), goodItem({ item_name: 'Can' })]);
    const truncated = two.slice(0, two.length - 30);
    const result = parsePartial(truncated);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].name).toBe('PET Water Bottle');
    warnSpy.mockRestore();
  });

  it('returns empty array on completely malformed text', () => {
    expect(parsePartial('total garbage no braces')).toEqual([]);
  });

  it('returns empty array when no complete items survive validation', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parsePartial('[{"item_name": "X"')).toEqual([]);
    warnSpy.mockRestore();
  });

  it('handles braces inside strings correctly', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const item = goodItem({ funny_fact: L4('Has { brace } in text') });
    const text = JSON.stringify([item]);
    const result = parsePartial(text);
    expect(result).toHaveLength(1);
    expect(result[0].funnyFact.en).toBe('Has { brace } in text');
    warnSpy.mockRestore();
  });
});

describe('claudeDetect validation', () => {
  it('returns empty array when Claude detects no waste', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    respond([]);
    const result = await claudeDetect('base64data');
    expect(result).toEqual([]);
  });

  it('drops items with invalid category', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    respond([
      goodItem(),
      goodItem({ category: 'paper' }), // legacy WasteCategory, no longer valid
    ]);

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('drops items with invalid bag code', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    respond([goodItem({ bag: 'B99' })]);

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('drops items missing required fields', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    respond([
      goodItem({ item_name: '' }), // empty string
      goodItem({ mascot_text: 'just a string' }), // not an object
      goodItem({ mascot_text: { en: 'X' } }), // missing zh/ja/ru
    ]);

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalledTimes(3);
    warnSpy.mockRestore();
  });

  it('drops items with malformed bbox', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    respond([
      goodItem({ bbox: { x: 0.1, y: 0.1 } }), // partial
      goodItem({ bbox: { x: 0.1, y: 0.1, w: 0, h: 0.2 } }), // zero width
      goodItem({ bbox: { x: 0.1, y: 0.1, w: 0.2, h: -0.1 } }), // negative height
      goodItem(), // good
    ]);

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalledTimes(3);
    warnSpy.mockRestore();
  });

  it('drops steps with invalid visual codes but keeps valid steps', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    respond([goodItem({
      steps: [
        { visual: 'REMOVE_CAP_OR_LID_PUMP', text: 'cap' },
        { visual: 'XX', text: 'bad' }, // bad code
        { visual: 'CRUSH', text: '' }, // empty text
        { visual: 'PUT_IN_GENERAL_BIN', text: 'bin' },
      ],
    })]);

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(1);
    expect(result[0].steps.map(s => s.visual)).toEqual(['REMOVE_CAP_OR_LID_PUMP', 'PUT_IN_GENERAL_BIN']);
    warnSpy.mockRestore();
  });

  it('drops items with no surviving steps', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    respond([goodItem({ steps: [] })]);

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(0);
    warnSpy.mockRestore();
  });

  it('drops items with invalid confidence', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    respond([goodItem({ confidence: 'maybe' })]);

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(0);
    warnSpy.mockRestore();
  });
});
