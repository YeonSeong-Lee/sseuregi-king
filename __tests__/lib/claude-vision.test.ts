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
});
