import { describe, it, expect, vi, beforeEach } from 'vitest';

const { messagesCreateMock } = vi.hoisted(() => ({
  messagesCreateMock: vi.fn(),
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: function Anthropic() {
    return { messages: { create: messagesCreateMock } };
  },
}));

// claudeDetect is re-imported in beforeEach so the module-level
// `_client` and `_systemPrompt` singletons are fresh per test.
let claudeDetect: typeof import('@/lib/claude-vision').claudeDetect;
let tryParseStrict: typeof import('@/lib/claude-vision').tryParseStrict;
let parsePartial: typeof import('@/lib/claude-vision').parsePartial;

beforeEach(async () => {
  messagesCreateMock.mockReset();
  delete process.env.ANTHROPIC_API_KEY;
  vi.resetModules();
  ({ claudeDetect, tryParseStrict, parsePartial } = await import('@/lib/claude-vision'));
});

type RawItem = Record<string, unknown>;

const L4 = (s: string) => ({ en: s, zh: s, ja: s, ru: s });

function goodItem(overrides: Partial<RawItem> = {}): RawItem {
  return {
    item_name: L4('PET Water Bottle'),
    category: 'Recyclable',
    bag: 'B04',
    bbox: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
    steps: [{ visual: 'V01', text: L4('Remove the cap') }],
    mascot_text: L4('Another one. Bold of you.'),
    funny_fact: L4('Korea uses 4.9B PET bottles per year.'),
    confidence: 'high',
    ...overrides,
  };
}

function respond(items: unknown): void {
  messagesCreateMock.mockResolvedValue({
    content: [{ type: 'text', text: JSON.stringify(items) }],
  });
}

describe('claudeDetect', () => {
  it('throws when ANTHROPIC_API_KEY is not set', async () => {
    await expect(claudeDetect('base64data')).rejects.toThrow('ANTHROPIC_API_KEY not set');
  });

  it('embeds the visual library and Korean disposal cheat sheet in the system prompt', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    respond([]);

    await claudeDetect('base64data');

    const callArg = messagesCreateMock.mock.calls[0][0];
    const systemText = Array.isArray(callArg.system) ? callArg.system[0].text : callArg.system;
    expect(systemText).toContain('B01');
    expect(systemText).toContain('B04');
    expect(systemText).toContain('V01');
    expect(systemText).toContain('Cheat Sheet');
    expect(systemText).toContain('1599-0903');
    expect(systemText).not.toContain('T001');
    expect(systemText).toMatch(/Gangnam/);
  });

  it('parses a well-formed item with bbox converted to 0-100 percent', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    respond([goodItem()]);

    const result = await claudeDetect('base64data');

    expect(result).toHaveLength(1);
    expect(result[0].name.en).toBe('PET Water Bottle');
    expect(result[0].category).toBe('Recyclable');
    expect(result[0].bag).toBe('B04');
    expect(result[0].confidence).toBe('high');
    expect(result[0].steps[0].visual).toBe('V01');
    expect(result[0].steps[0].text.ja).toBe('Remove the cap');
    expect(result[0].bbox.x).toBeCloseTo(10);
    expect(result[0].bbox.w).toBeCloseTo(30);
  });

  it('preserves all four locale strings on every text field', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    respond([goodItem({
      item_name: { en: 'Bottle', zh: '瓶', ja: 'ボトル', ru: 'Бутылка' },
      mascot_text: { en: 'A', zh: '甲', ja: 'ア', ru: 'А' },
      funny_fact: { en: 'F', zh: '事', ja: 'コト', ru: 'Ф' },
    })]);

    const r = (await claudeDetect('base64data'))[0];
    expect(r.name.zh).toBe('瓶');
    expect(r.name.ja).toBe('ボトル');
    expect(r.name.ru).toBe('Бутылка');
    expect(r.mascotText.zh).toBe('甲');
    expect(r.funnyFact.ru).toBe('Ф');
  });

  it('strips markdown fences before parsing', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const json = JSON.stringify([goodItem()]);
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: '```json\n' + json + '\n```' }],
    });

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(1);
  });

  it('returns empty array (no throw) when response is not valid JSON on both attempts', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: 'I see a newspaper.' }],
    });
    const result = await claudeDetect('base64data');
    expect(result).toEqual([]);
    expect(messagesCreateMock).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });

  it('returns empty array when JSON is not an array on both attempts', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: '{"category":"Recyclable"}' }],
    });
    const result = await claudeDetect('base64data');
    expect(result).toEqual([]);
    warnSpy.mockRestore();
  });

  it('throws when there is no text content block (initial call SDK-level failure)', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({ content: [] });
    await expect(claudeDetect('base64data')).rejects.toThrow(/no text content/);
  });

  it('retries once with larger max_tokens when initial response has truncated JSON', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const truncated = JSON.stringify([goodItem()]).slice(0, -10);  // chop off tail
    const full = JSON.stringify([goodItem()]);
    messagesCreateMock
      .mockResolvedValueOnce({ content: [{ type: 'text', text: truncated }] })
      .mockResolvedValueOnce({ content: [{ type: 'text', text: full }] });

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(1);
    expect(messagesCreateMock).toHaveBeenCalledTimes(2);
    expect(messagesCreateMock.mock.calls[0][0].max_tokens).toBeLessThan(
      messagesCreateMock.mock.calls[1][0].max_tokens
    );
    warnSpy.mockRestore();
  });

  it('recovers complete items via partial parse when both attempts truncate', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const two = JSON.stringify([goodItem(), goodItem({ item_name: L4('Can') })]);
    const truncated = two.slice(0, two.length - 30);  // second item gets cut mid-way
    messagesCreateMock.mockResolvedValue({ content: [{ type: 'text', text: truncated }] });

    const result = await claudeDetect('base64data');
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].name.en).toBe('PET Water Bottle');
    warnSpy.mockRestore();
  });

  it('falls back to partial parse on initial response when retry call throws', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const two = JSON.stringify([goodItem(), goodItem({ item_name: L4('Can') })]);
    const truncated = two.slice(0, two.length - 30);
    messagesCreateMock
      .mockResolvedValueOnce({ content: [{ type: 'text', text: truncated }] })
      .mockRejectedValueOnce(new Error('Anthropic 503'));

    const result = await claudeDetect('base64data');
    expect(result.length).toBeGreaterThanOrEqual(1);
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
    const two = JSON.stringify([goodItem(), goodItem({ item_name: L4('Can') })]);
    const truncated = two.slice(0, two.length - 30);
    const result = parsePartial(truncated);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].name.en).toBe('PET Water Bottle');
    warnSpy.mockRestore();
  });

  it('returns empty array on completely malformed text', () => {
    expect(parsePartial('total garbage no braces')).toEqual([]);
  });

  it('returns empty array when no complete items survive validation', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parsePartial('[{"item_name": {"en": "X"')).toEqual([]);
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
      goodItem({ category: 'paper' }),  // legacy WasteCategory, no longer valid
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

  it('drops items missing required localized fields', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    respond([
      goodItem({ item_name: { en: 'X' } }),       // missing zh/ja/ru
      goodItem({ mascot_text: 'just a string' }), // not an object
    ]);

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });

  it('drops items with malformed bbox', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    respond([
      goodItem({ bbox: { x: 0.1, y: 0.1 } }),                   // partial
      goodItem({ bbox: { x: 0.1, y: 0.1, w: 0, h: 0.2 } }),     // zero width
      goodItem({ bbox: { x: 0.1, y: 0.1, w: 0.2, h: -0.1 } }),  // negative height
      goodItem(),                                                // good
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
        { visual: 'V01', text: L4('cap') },
        { visual: 'XX', text: L4('bad') },           // bad code
        { visual: 'V03', text: { en: 'partial' } },   // missing locales
        { visual: 'V09', text: L4('bin') },
      ],
    })]);

    const result = await claudeDetect('base64data');
    expect(result).toHaveLength(1);
    expect(result[0].steps.map(s => s.visual)).toEqual(['V01', 'V09']);
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
