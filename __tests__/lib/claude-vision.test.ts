import { describe, it, expect, vi, beforeEach } from 'vitest';

const { messagesCreateMock } = vi.hoisted(() => ({
  messagesCreateMock: vi.fn(),
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: function Anthropic() {
    return { messages: { create: messagesCreateMock } };
  },
}));

import { claudeDetect } from '@/lib/claude-vision';

beforeEach(() => {
  messagesCreateMock.mockReset();
  delete process.env.ANTHROPIC_API_KEY;
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
    expect(result[0].nameEn).toBe('Paper');
    expect(result[0].bbox.x).toBeCloseTo(10);
    expect(result[0].bbox.y).toBeCloseTo(20);
    expect(result[0].bbox.w).toBeCloseTo(30);
    expect(result[0].bbox.h).toBeCloseTo(40);
  });

  it('hydrates localized names from getCategoryDef for known categories', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    messagesCreateMock.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify([
        { category: 'paper_carton', label: 'Milk carton', bbox: { x: 0, y: 0, w: 0.5, h: 0.5 } },
      ]) }],
    });

    const result = await claudeDetect('base64data');

    expect(result[0].category).toBe('paper_carton');
    expect(result[0].nameEn).toBe('Paper Carton');
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
});
