import vision from '@google-cloud/vision';

const SCORE_THRESHOLD = 0.5;

export type RawDetected = {
  nameEn: string;
  nameZh: string;
  nameJa: string;
  nameRu: string;
  category: string;
  bbox: { x: number; y: number; w: number; h: number };
};

type VisionClient = InstanceType<typeof vision.ImageAnnotatorClient>;

let _client: VisionClient | null = null;
function getClient(): VisionClient {
  if (_client) return _client;
  const raw = process.env.GOOGLE_CREDENTIALS_JSON;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!raw) throw new Error('GOOGLE_CREDENTIALS_JSON not set');
  if (!projectId) throw new Error('GOOGLE_CLOUD_PROJECT not set');
  const credentials = JSON.parse(raw);
  // ADC user credentials (authorized_user type) require a quota project on the
  // credentials object itself; the client-level quotaProjectId option is ignored.
  // Harmless for service-account keys, which carry their own project.
  if (!credentials.quota_project_id) credentials.quota_project_id = projectId;
  _client = new vision.ImageAnnotatorClient({
    credentials,
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
