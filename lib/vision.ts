import vision from '@google-cloud/vision';
import type { RawDetected } from './analyze';

const SCORE_THRESHOLD = 0.5;

type VisionClient = InstanceType<typeof vision.ImageAnnotatorClient>;

let _client: VisionClient | null = null;
function getClient(): VisionClient {
  if (_client) return _client;
  const raw = process.env.GOOGLE_CREDENTIALS_JSON;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!raw) throw new Error('GOOGLE_CREDENTIALS_JSON not set');
  if (!projectId) throw new Error('GOOGLE_CLOUD_PROJECT not set');
  _client = new vision.ImageAnnotatorClient({
    credentials: JSON.parse(raw),
    projectId,
  });
  return _client;
}

export async function cloudVisionDetect(base64Image: string): Promise<RawDetected[]> {
  const client = getClient();
  const [response] = await client.objectLocalization!({
    image: { content: base64Image },
  });
  const annotations = response.localizedObjectAnnotations ?? [];

  return annotations
    .filter(a => (a.score ?? 0) >= SCORE_THRESHOLD)
    .map(a => {
      const vs = a.boundingPoly?.normalizedVertices ?? [];
      const xs = vs.map(v => v.x ?? 0);
      const ys = vs.map(v => v.y ?? 0);
      const xMin = xs.length ? Math.min(...xs) : 0;
      const yMin = ys.length ? Math.min(...ys) : 0;
      const xMax = xs.length ? Math.max(...xs) : 0;
      const yMax = ys.length ? Math.max(...ys) : 0;
      return {
        nameEn: a.name ?? '',
        nameZh: '', nameJa: '', nameRu: '',
        category: '',
        bbox: {
          x: xMin * 100,
          y: yMin * 100,
          w: (xMax - xMin) * 100,
          h: (yMax - yMin) * 100,
        },
      };
    });
}
