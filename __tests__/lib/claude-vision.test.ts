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
});
