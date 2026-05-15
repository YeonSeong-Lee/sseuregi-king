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

beforeEach(async () => {
  messagesCreateMock.mockReset();
  delete process.env.ANTHROPIC_API_KEY;
  vi.resetModules();
  ({ claudeDetect } = await import('@/lib/claude-vision'));
});

describe('claudeDetect', () => {
  it('throws when ANTHROPIC_API_KEY is not set', async () => {
    await expect(claudeDetect('base64data')).rejects.toThrow('ANTHROPIC_API_KEY not set');
  });

  it('includes every category id in the system prompt', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({ content: [{ type: 'text', text: '[]' }] });

    await claudeDetect('base64data');

    const callArg = messagesCreateMock.mock.calls[0][0];
    const systemText = Array.isArray(callArg.system) ? callArg.system[0].text : callArg.system;
    for (const id of ['paper', 'paper_carton', 'glass', 'metal_can', 'plastic', 'vinyl',
                      'styrofoam', 'clothing', 'lightbulb', 'food', 'general', 'large', 'etc']) {
      expect(systemText).toContain(id);
    }
  });

  it('parses a single well-formed item with bbox converted to 0-100 percent', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{
        type: 'text',
        text: JSON.stringify([
          { category: 'paper', label: 'Newspaper', bbox: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 } },
        ]),
      }],
    });

    const result = await claudeDetect('base64data');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('paper');
    // The label hits a specific trash-items entry, so we surface its item-level name.
    expect(result[0].nameEn).toBe('Newspaper / office paper');
    expect(result[0].trashItemId).toBe('newspaper_office_paper');
    expect(result[0].bbox.x).toBeCloseTo(10);
    expect(result[0].bbox.y).toBeCloseTo(20);
    expect(result[0].bbox.w).toBeCloseTo(30);
    expect(result[0].bbox.h).toBeCloseTo(40);
  });

  it('promotes a matched label to its trash-items entry across locales', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify([
        { category: 'paper_carton', label: 'Milk carton', bbox: { x: 0, y: 0, w: 0.5, h: 0.5 } },
      ]) }],
    });

    const result = await claudeDetect('base64data');

    expect(result[0].category).toBe('paper_carton');
    expect(result[0].trashItemId).toBe('milk_carton');
    expect(result[0].nameEn).toBe('Milk carton / juice box');
    // Non-EN locales fall back to EN until per-locale translations land.
    expect(result[0].nameZh).toBeTruthy();
    expect(result[0].nameJa).toBeTruthy();
    expect(result[0].nameRu).toBeTruthy();
  });

  it('coerces unknown category to etc with ETC_NAMES', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify([
        { category: 'banana_peel', label: 'banana', bbox: { x: 0, y: 0, w: 0.1, h: 0.1 } },
      ]) }],
    });

    const result = await claudeDetect('base64data');

    expect(result[0].category).toBe('etc');
    expect(result[0].nameEn).toBe('Other ❓');
  });

  it('accepts etc as an explicit category from Claude', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify([
        { category: 'etc', label: 'unknown thing', bbox: { x: 0, y: 0, w: 0.1, h: 0.1 } },
      ]) }],
    });

    const result = await claudeDetect('base64data');

    expect(result[0].category).toBe('etc');
    expect(result[0].nameEn).toBe('Other ❓');
  });

  it('strips markdown fences before parsing', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const json = JSON.stringify([
      { category: 'plastic', label: 'bottle', bbox: { x: 0.1, y: 0.1, w: 0.2, h: 0.2 } },
    ]);
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: '```json\n' + json + '\n```' }],
    });

    const result = await claudeDetect('base64data');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('plastic');
  });

  it('throws with diagnostic when response is not valid JSON', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: 'I see a newspaper and a plastic bottle.' }],
    });

    await expect(claudeDetect('base64data')).rejects.toThrow(/invalid JSON/);
  });

  it('throws when JSON is not an array', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: '{"category":"paper"}' }],
    });

    await expect(claudeDetect('base64data')).rejects.toThrow(/non-array/);
  });

  it('throws when there is no text content block', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({ content: [] });

    await expect(claudeDetect('base64data')).rejects.toThrow(/no text content/);
  });

  it('returns empty array when Claude detects no waste', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: '[]' }],
    });

    const result = await claudeDetect('base64data');

    expect(result).toEqual([]);
  });

  it('drops malformed items, keeps good ones, warns', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify([
        { category: 'paper', label: 'newspaper', bbox: { x: 0, y: 0, w: 0.1, h: 0.1 } },
        { category: 'plastic', label: 'no bbox' },
        { category: 'glass', label: 'partial bbox', bbox: { x: 0.5, y: 0.5 } },
      ]) }],
    });

    const result = await claudeDetect('base64data');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('paper');
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });

  it('drops items with non-positive width or height', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify([
        { category: 'paper', label: 'zero w', bbox: { x: 0.1, y: 0.1, w: 0, h: 0.2 } },
        { category: 'plastic', label: 'negative h', bbox: { x: 0.1, y: 0.1, w: 0.2, h: -0.1 } },
        { category: 'glass', label: 'good', bbox: { x: 0.1, y: 0.1, w: 0.2, h: 0.2 } },
      ]) }],
    });

    const result = await claudeDetect('base64data');

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('glass');
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });
});
