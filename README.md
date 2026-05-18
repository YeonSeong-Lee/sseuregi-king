<div align="center">

# 🗑️ Sseuregi Killer

**Scan your trash. Sort it right. Done.**

한국에서 쓰레기 분리배출을 헤매는 모두를 위한 카메라 한 번에 끝나는 가이드.

<br />

<a href="https://youtube.com/shorts/yCNZUdUe7NM?feature=share">
  <img src="https://img.youtube.com/vi/yCNZUdUe7NM/maxresdefault.jpg" width="320" alt="Watch the demo on YouTube" />
</a>

<sub>▶️ <a href="https://youtube.com/shorts/yCNZUdUe7NM?feature=share">YouTube Shorts에서 데모 영상 보기</a></sub>

<br /><br />

![Next.js](https://img.shields.io/badge/Next.js-16.2-000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-EN_ZH_JA_RU-22c55e)

</div>

---

## ✨ What it does

- 📸 **Scan** — 쓰레기를 카메라로 비추면 무엇인지 알아냅니다 (Google Vision + Claude).
- 🏷️ **Classify** — 재활용 / 음식물 / 일반쓰레기로 자동 분류합니다.
- 🗺️ **Localize** — 우리 동네(구) 규칙에 맞춰 봉투 색깔, 배출 요일, 배출 장소까지 안내합니다.
- 📚 **Trash 101** — 처음이라면 분리배출의 기본을 단계별 가이드로 학습할 수 있습니다.
- 🌏 **4 languages** — English · 中文 · 日本語 · Русский.

## 🧰 Tech Stack

| Layer | Stack |
| --- | --- |
| Framework | Next.js 16.2 (App Router) · React 19 |
| Styling | Tailwind CSS 4 |
| AI / Vision | `@anthropic-ai/sdk` · `@google-cloud/vision` |
| i18n | `next-intl` |
| Testing | Vitest · Testing Library |

## 🚀 Getting Started

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속하세요.

### 환경 변수

`.env.local` 에 아래 키를 설정합니다.

```bash
ANTHROPIC_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=...   # Vision API 서비스 계정 JSON 경로
```

## 📂 Project Layout

```
app/
 ├── [locale]/         # scan · collection · trash101 페이지
 └── api/              # analyze · geocode · guide-text 라우트
data/                  # 쓰레기/카테고리/구별 규칙 데이터
i18n/                  # next-intl 라우팅 설정
public/                # 마스코트·아이콘 등 정적 자산
```

## 🧪 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드된 앱 실행 |
| `npm run lint` | ESLint |
| `npm test` | Vitest 1회 실행 |
| `npm run test:watch` | Vitest watch 모드 |

---

<div align="center">

made with ☕ to kill some 쓰레기.

</div>
