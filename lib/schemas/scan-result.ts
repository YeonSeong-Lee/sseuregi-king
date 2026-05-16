const localizedSchema = {
  type: 'object',
  properties: {
    en: { type: 'string' },
    zh: { type: 'string' },
    ja: { type: 'string' },
    ru: { type: 'string' },
  },
  required: ['en', 'zh', 'ja', 'ru'],
  additionalProperties: false,
} as const;

export const SCAN_RESULT_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      item_name: { type: 'string' },
      category: {
        type: 'string',
        enum: ['Recyclable', 'General Waste', 'Food Waste', 'Hazardous', 'Bulky'],
      },
      bag: { type: 'string', enum: ['B01', 'B02', 'B03'] },
      bbox: {
        type: 'object',
        properties: {
          x: { type: 'number' },
          y: { type: 'number' },
          w: { type: 'number' },
          h: { type: 'number' },
        },
        required: ['x', 'y', 'w', 'h'],
        additionalProperties: false,
      },
      steps: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            visual: { type: 'string' },
            text: { type: 'string' },
          },
          required: ['visual', 'text'],
          additionalProperties: false,
        },
      },
      mascot_text: localizedSchema,
      funny_fact: localizedSchema,
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    },
    required: [
      'item_name',
      'category',
      'bag',
      'bbox',
      'steps',
      'mascot_text',
      'funny_fact',
      'confidence',
    ],
    additionalProperties: false,
  },
} as const;
