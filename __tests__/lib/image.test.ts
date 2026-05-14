import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { captureToBase64Jpeg } from '@/lib/image';

const FAKE_DATA_URL = 'data:image/jpeg;base64,ABC123';
let toDataURLSpy: ReturnType<typeof vi.spyOn>;
let getContextSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  toDataURLSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(FAKE_DATA_URL);
  getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  toDataURLSpy.mockRestore();
  getContextSpy.mockRestore();
});

describe('captureToBase64Jpeg', () => {
  it('strips the data URL prefix from a canvas source', () => {
    const c = document.createElement('canvas');
    c.width = 800;
    c.height = 600;
    expect(captureToBase64Jpeg(c)).toBe('ABC123');
  });

  it('encodes as image/jpeg at 0.8 quality', () => {
    const c = document.createElement('canvas');
    c.width = 800;
    c.height = 600;
    captureToBase64Jpeg(c);
    expect(toDataURLSpy).toHaveBeenCalledWith('image/jpeg', 0.8);
  });

  it('reads videoWidth/videoHeight from an HTMLVideoElement', () => {
    const v = document.createElement('video');
    Object.defineProperty(v, 'videoWidth', { value: 1920, configurable: true });
    Object.defineProperty(v, 'videoHeight', { value: 1080, configurable: true });
    expect(captureToBase64Jpeg(v)).toBe('ABC123');
  });

  it('throws when the source has no dimensions', () => {
    const v = document.createElement('video');
    Object.defineProperty(v, 'videoWidth', { value: 0, configurable: true });
    Object.defineProperty(v, 'videoHeight', { value: 0, configurable: true });
    expect(() => captureToBase64Jpeg(v)).toThrow(/no dimensions/);
  });

  it('downscales when the longest side exceeds 1024', () => {
    const c = document.createElement('canvas');
    c.width = 4000;
    c.height = 2000;
    captureToBase64Jpeg(c);
    // The internal canvas created inside the helper is the last canvas created.
    // We can verify the downscale via the drawImage call on the mocked context.
    const mockCtx = (getContextSpy.mock.results.at(-1)?.value) as { drawImage: ReturnType<typeof vi.fn> };
    const [, , , dw, dh] = mockCtx.drawImage.mock.calls[0];
    expect(dw).toBe(1024);
    expect(dh).toBe(512);
  });

  it('does not upscale when both sides are below 1024', () => {
    const c = document.createElement('canvas');
    c.width = 400;
    c.height = 300;
    captureToBase64Jpeg(c);
    const mockCtx = (getContextSpy.mock.results.at(-1)?.value) as { drawImage: ReturnType<typeof vi.fn> };
    const [, , , dw, dh] = mockCtx.drawImage.mock.calls[0];
    expect(dw).toBe(400);
    expect(dh).toBe(300);
  });
});
