# Sseuregi King — Trash Disposal Guide for Foreigners
**Date:** 2026-05-09  
**Status:** Approved

---

## Overview

모바일 퍼스트 웹 앱. 한국에 거주하거나 방문 중인 외국인을 대상으로, 쓰레기를 카메라로 찍으면 AI가 오브젝트를 감지하고 한국 분리수거 방법을 안내한다. 포켓몬 도감 스타일의 수집 게임 요소를 포함한다.

**지원 언어:** 영어(en), 중국어(zh), 일본어(ja), 러시아어(ru)  
**대상 국가:** 한국 (한국 분리수거 기준)

---

## 핵심 사용자 흐름

1. 언어 선택 (브라우저 언어 자동 감지 → 수동 변경 가능)
2. 카메라 촬영 또는 갤러리에서 이미지 선택
3. `/api/analyze` 호출 → Claude Vision이 오브젝트 감지
4. 감지된 오브젝트 즉시 Trash Dex unlock (localStorage)
5. 사진 위 플로팅 태그 탭 → 오브젝트 선택
6. 선택한 오브젝트의 S3 처리법 영상 재생 (선택 사항)
7. 도감(Trash Dex) 탭에서 수집 현황 확인

---

## 아키텍처

```
[브라우저 (Next.js)]
  └── POST /api/analyze (이미지 base64)
        └── Claude Vision API
              └── 오브젝트 목록 + bbox + 4개 언어 이름 반환
  └── waste-items.json (aiAliases로 매핑)
        └── S3 영상 URL 조회
  └── localStorage ("trashdex")
        └── 언어 설정 + unlockedIds 저장
```

별도 DB 없음. 서버리스 (Next.js API Routes만 사용).

---

## 기술 스택

| 역할 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 스타일 | Tailwind CSS |
| i18n | next-intl |
| 카메라 | react-webcam |
| AI | Anthropic SDK (claude-sonnet-4-6) |
| 영상 호스팅 | AWS S3 |
| 데이터 | JSON 파일 (DB 없음) |
| 상태 저장 | localStorage |

---

## 화면 구성 (3개 페이지, 6개 상태)

> `/` → `/[locale]/scan` (캡처 → 로딩 → 오버레이 → 영상 순서로 상태 전환) → `/[locale]/collection`

### 1. 언어 선택 (`/`)
- 브라우저 `navigator.language`로 자동 감지, 해당 언어 기본 선택
- 4개 언어 버튼 (국기 + 언어명): English, 中文, 日本語, Русский
- 선택 시 localStorage에 저장 후 `/[locale]/scan`으로 이동

### 2. 촬영 화면 (`/[locale]/scan`)
- 카메라 버튼: 모바일에서는 `<input type="file" capture="environment">`, 데스크톱에서는 `react-webcam` 사용
- 갤러리 버튼: `<input type="file" accept="image/*">`
- 이미지 선택 즉시 분석 화면으로 전환

### 3. AI 분석 중 (로딩 오버레이)
- 로딩 애니메이션 + "Analyzing..." 텍스트 표시
- `/api/analyze` 응답 대기

### 4. 오브젝트 오버레이 (`/[locale]/scan` — 결과 상태)
- 원본 사진 위에 bbox 중앙 좌표 기준으로 플로팅 태그 배치
- 태그에는 선택된 언어의 오브젝트 이름 표시
- 탭하면 선택(강조)/해제 토글
- 하단 "See Guide" 버튼으로 선택된 오브젝트 처리법 이동
- 감지된 모든 오브젝트는 이 시점에 Trash Dex unlock

### 5. 처리법 영상 화면 (`/[locale]/scan` — 영상 상태)
- 오브젝트 이름 + 카테고리 배지 표시
- S3 MP4 영상 재생 (`<video>` 태그)
- 여러 오브젝트 선택 시 오브젝트별 탭(tab) UI로 전환 가능
- "Back to scan" 버튼

### 6. 도감 화면 (`/[locale]/collection`)
- 상단: "Trash Dex" 제목 + 수집 진행률 (n / 전체)
- 4열 그리드: unlock된 아이템은 이모지 + 이름 + 카테고리 색상 테두리
- 미unlock 아이템: 실루엣(필터:brightness(0)) + "???" 텍스트 + 자물쇠
- 카테고리별 색상: ♻️ 재활용(파랑), 🍃 음식물(초록), 🗑️ 일반(회색), 🚛 대형(주황)
- 하단 탭 네비게이션: 📷 Scan / 📖 Collection

---

## 데이터 구조

### `data/waste-items.json`

```json
{
  "plastic_bottle": {
    "id": "plastic_bottle",
    "emoji": "🍾",
    "category": "recycling",
    "names": {
      "en": "Plastic Bottle",
      "zh": "塑料瓶",
      "ja": "ペットボトル",
      "ru": "Пластиковая бутылка"
    },
    "videoUrl": "https://s3.amazonaws.com/[bucket]/plastic-bottle.mp4",
    "thumbnailUrl": "https://s3.amazonaws.com/[bucket]/plastic-bottle-thumb.jpg",
    "aiAliases": ["plastic bottle", "PET bottle", "water bottle", "soda bottle"]
  }
}
```

**category 값:** `recycling` | `food` | `general` | `large`

### `data/i18n/[lang].json`

```json
{
  "home": { "title": "Trash Dex", "subtitle": "Scan your trash" },
  "scan": { "camera": "Camera", "gallery": "Gallery" },
  "analyzing": { "label": "Analyzing..." },
  "overlay": { "tap_hint": "Tap items to select", "see_guide": "See Guide" },
  "collection": { "title": "My Collection", "locked": "???", "progress": "{{n}} / {{total}}" },
  "categories": {
    "recycling": "Recycling ♻️",
    "food": "Food Waste 🍃",
    "general": "General 🗑️",
    "large": "Large Waste 🚛"
  }
}
```

### localStorage (`key: "trashdex"`)

```json
{
  "lang": "en",
  "unlockedIds": ["plastic_bottle", "newspaper"],
  "lastScanAt": "2026-05-09T10:00:00Z"
}
```

---

## API

### `POST /api/analyze`

**Request:**
```json
{ "image": "<base64 encoded image>" }
```

**Claude Vision System Prompt:**
```
You are a waste detection assistant for Korea's recycling system.
Detect all waste/trash items visible in the image.
Return a JSON array with this exact shape:
[{
  "nameEn": "Plastic Bottle",
  "nameZh": "塑料瓶",
  "nameJa": "ペットボトル",
  "nameRu": "Пластиковая бутылка",
  "category": "recycling",
  "bbox": { "x": 20, "y": 30, "w": 15, "h": 25 }
}]
bbox values are percentages of image dimensions (0-100).
category must be one of: recycling, food, general, large.
Only detect items that are clearly waste or trash.
```

**Response:**
```json
{
  "objects": [
    {
      "nameEn": "Plastic Bottle",
      "nameZh": "塑料瓶",
      "nameJa": "ペットボトル",
      "nameRu": "Пластиковая бутылка",
      "category": "recycling",
      "bbox": { "x": 20, "y": 30, "w": 15, "h": 25 },
      "itemId": "plastic_bottle",
      "videoUrl": "https://s3.../plastic-bottle.mp4"
    }
  ]
}
```

**매핑 로직 (`lib/matcher.ts`):**
- Claude 응답의 `nameEn`을 소문자 변환 후 `waste-items.json`의 각 `aiAliases` 배열과 비교
- 매칭 성공: `itemId`, `videoUrl`, `thumbnailUrl` 추가
- 매칭 실패: `itemId: null`, `videoUrl: null` — 태그는 표시되지만 영상 없음

---

## 폴더 구조

```
sseuregi-king/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              ← 언어 선택 홈
│   │   ├── scan/
│   │   │   └── page.tsx          ← 카메라 + 오버레이 + 영상
│   │   └── collection/
│   │       └── page.tsx          ← 도감 수집 화면
│   └── api/
│       └── analyze/
│           └── route.ts          ← Claude Vision 호출
├── components/
│   ├── CameraCapture.tsx
│   ├── ObjectOverlay.tsx
│   ├── VideoPlayer.tsx
│   └── TrashDex.tsx
├── data/
│   ├── waste-items.json
│   └── i18n/
│       ├── en.json
│       ├── zh.json
│       ├── ja.json
│       └── ru.json
├── lib/
│   ├── analyze.ts                ← Claude API 호출
│   ├── matcher.ts                ← AI 응답 → 아이템 매핑
│   └── storage.ts                ← localStorage 헬퍼
└── hooks/
    └── useCollection.ts          ← unlock 상태 관리
```

---

## 주요 결정사항 & 트레이드오프

| 결정 | 이유 |
|------|------|
| Claude Vision (Anthropic) | 4개 언어 이름 + 카테고리를 한 번에 반환 가능 |
| Next.js API Routes만 사용 | 별도 백엔드 불필요, 배포 단순 |
| JSON 파일로 데이터 관리 | 초기 단계에서 DB 오버헤드 없이 빠른 개발 |
| 스캔 즉시 unlock | 포켓몬 "만남" 방식 — 교육보다 발견의 재미 우선 |
| localStorage | 로그인 없이 수집 가능, 기기 변경 시 초기화는 허용 |
| bbox % 단위 | 이미지 크기에 무관하게 오버레이 위치 계산 단순화 |

---

## 범위 밖 (현재 버전)

- 사용자 계정 / 로그인
- 수집 데이터 클라우드 동기화
- 어드민 패널 (데이터는 JSON 직접 편집)
- 오프라인 모드 (PWA)
- 쓰레기 위치 기반 수거함 안내
