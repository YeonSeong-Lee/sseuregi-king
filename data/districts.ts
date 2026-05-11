import type { Locale, SupportedDistrict } from '@/types';

export type { SupportedDistrict };

export const SUPPORTED_DISTRICTS: SupportedDistrict[] = ['gangnam', 'mapo'];

export interface DistrictInfo {
  code: string;
  names: Record<Locale, string>;
}

export const DISTRICT_BY_KO_NAME: Record<string, DistrictInfo> = {
  '강남구': { code: 'gangnam',     names: { en: 'Gangnam-gu',     zh: '江南区',     ja: '江南区',     ru: 'Каннам-гу' } },
  '강동구': { code: 'gangdong',    names: { en: 'Gangdong-gu',    zh: '江东区',     ja: '江東区',     ru: 'Кандон-гу' } },
  '강북구': { code: 'gangbuk',     names: { en: 'Gangbuk-gu',     zh: '江北区',     ja: '江北区',     ru: 'Канбук-гу' } },
  '강서구': { code: 'gangseo',     names: { en: 'Gangseo-gu',     zh: '江西区',     ja: '江西区',     ru: 'Кансо-гу' } },
  '관악구': { code: 'gwanak',      names: { en: 'Gwanak-gu',      zh: '冠岳区',     ja: '冠岳区',     ru: 'Кванак-гу' } },
  '광진구': { code: 'gwangjin',    names: { en: 'Gwangjin-gu',    zh: '广津区',     ja: '広津区',     ru: 'Кванджин-гу' } },
  '구로구': { code: 'guro',        names: { en: 'Guro-gu',        zh: '九老区',     ja: '九老区',     ru: 'Куро-гу' } },
  '금천구': { code: 'geumcheon',   names: { en: 'Geumcheon-gu',   zh: '衿川区',     ja: '衿川区',     ru: 'Кымчхон-гу' } },
  '노원구': { code: 'nowon',       names: { en: 'Nowon-gu',       zh: '芦原区',     ja: '蘆原区',     ru: 'Новон-гу' } },
  '도봉구': { code: 'dobong',      names: { en: 'Dobong-gu',      zh: '道峰区',     ja: '道峰区',     ru: 'Добон-гу' } },
  '동대문구': { code: 'dongdaemun', names: { en: 'Dongdaemun-gu', zh: '东大门区',   ja: '東大門区',   ru: 'Тондэмун-гу' } },
  '동작구': { code: 'dongjak',     names: { en: 'Dongjak-gu',     zh: '铜雀区',     ja: '銅雀区',     ru: 'Тонджак-гу' } },
  '마포구': { code: 'mapo',        names: { en: 'Mapo-gu',        zh: '麻浦区',     ja: '麻浦区',     ru: 'Мапхо-гу' } },
  '서대문구': { code: 'seodaemun', names: { en: 'Seodaemun-gu',   zh: '西大门区',   ja: '西大門区',   ru: 'Содэмун-гу' } },
  '서초구': { code: 'seocho',      names: { en: 'Seocho-gu',      zh: '瑞草区',     ja: '瑞草区',     ru: 'Сочхо-гу' } },
  '성동구': { code: 'seongdong',   names: { en: 'Seongdong-gu',   zh: '城东区',     ja: '城東区',     ru: 'Сондон-гу' } },
  '성북구': { code: 'seongbuk',    names: { en: 'Seongbuk-gu',    zh: '城北区',     ja: '城北区',     ru: 'Сонбук-гу' } },
  '송파구': { code: 'songpa',      names: { en: 'Songpa-gu',      zh: '松坡区',     ja: '松坡区',     ru: 'Сонпха-гу' } },
  '양천구': { code: 'yangcheon',   names: { en: 'Yangcheon-gu',   zh: '阳川区',     ja: '陽川区',     ru: 'Янчхон-гу' } },
  '영등포구': { code: 'yeongdeungpo', names: { en: 'Yeongdeungpo-gu', zh: '永登浦区', ja: '永登浦区', ru: 'Йондынпхо-гу' } },
  '용산구': { code: 'yongsan',     names: { en: 'Yongsan-gu',     zh: '龙山区',     ja: '龍山区',     ru: 'Йонсан-гу' } },
  '은평구': { code: 'eunpyeong',   names: { en: 'Eunpyeong-gu',   zh: '恩平区',     ja: '恩平区',     ru: 'Ынпхён-гу' } },
  '종로구': { code: 'jongno',      names: { en: 'Jongno-gu',      zh: '钟路区',     ja: '鐘路区',     ru: 'Чонно-гу' } },
  '중구':   { code: 'junggu',      names: { en: 'Jung-gu',        zh: '中区',       ja: '中区',       ru: 'Чун-гу' } },
  '중랑구': { code: 'jungnang',    names: { en: 'Jungnang-gu',    zh: '中浪区',     ja: '中浪区',     ru: 'Чуннан-гу' } },
};

export function isSupported(code: string): code is SupportedDistrict {
  return (SUPPORTED_DISTRICTS as string[]).includes(code);
}

export function getDistrictByKoName(koName: string): DistrictInfo | null {
  return DISTRICT_BY_KO_NAME[koName] ?? null;
}

export function getSupportedDistrictInfo(code: SupportedDistrict): DistrictInfo {
  for (const info of Object.values(DISTRICT_BY_KO_NAME)) {
    if (info.code === code) return info;
  }
  throw new Error(`Supported district code "${code}" missing from DISTRICT_BY_KO_NAME`);
}
