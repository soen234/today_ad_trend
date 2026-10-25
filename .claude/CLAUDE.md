# CLAUDE.md - Today Ad Trend

> 이 파일은 Claude Code가 프로젝트 컨텍스트를 이해하고 일관된 코드를 생성하도록 돕는 프로젝트 규칙 문서입니다.

## 참조 문서
- `docs/superpowers/specs/2026-10-25-daily-briefing-design.md` - 현재 제품/아키텍처 설계 (데이터 계약 §4, 에디션 선택 §5)
- `.claude/PRD.md` - 초기 PRD (광고 소재 갤러리 구상). **역사 기록용**, 현재 제품과 다름

## 프로젝트 개요

**Today Ad Trend (TAT)**: 글로벌 마케팅 실무자를 위한 "매일 끝낼 수 있는" 3분 광고 브리핑 앱.
역할(performance / ua / brand)별로 하루 5~7개 아이템과 AI "so what"을 보여준다. 성공 지표는 매일 여는 습관(DAU, D7 리텐션).

## 아키텍처

```
pipeline/ (GitHub Actions cron, 하루 4회)  ──►  GitHub Pages /v1/*.json  ──►  Expo 앱, todayadtrend.com
  RSS 수집 → LLM 보강(GitHub Models) → 에디션 생성 → Creative Pulse(주간)      (정적 JSON, DB/계정 없음)
  상태는 orphan `data` 브랜치에 커밋
```

- **백엔드 없음**: Supabase는 삭제됨. 앱은 `lib/config.ts`의 `DATA_BASE_URL`(기본 `https://soen234.github.io/today_ad_trend/v1`)에서 JSON만 읽는다.
- **데이터 계약**: `types/index.ts` ↔ `pipeline/src/types.ts` ↔ 스펙 §4. 필드를 바꾸면 세 곳 + 랜딩(`ad_trend_landing/next-app/src/lib/tat/types.ts`)을 같이 바꾼다.
- **알림**: 서버 푸시 없음. `lib/notifications.ts`가 기기에서 매일 로컬 알림을 예약한다.
- **사용자 데이터**: 전부 기기 로컬 (`stores/prefsStore.ts`, Zustand + AsyncStorage). 계정/동기화 없음.
- **광고**: AdMob 배너는 Explore 목록 사이에만. 브리핑(Today)에는 넣지 않는다. 비개인화 요청, ATT 없음.
- **보안**: 원격 JSON의 URL은 서드파티 RSS에서 온다. 링크는 반드시 `lib/open.ts`의 `openUrl`(http/https만 허용)로 연다.

## 기술 스택

- Expo SDK 54, expo-router (파일 기반 라우팅), TypeScript strict
- NativeWind (Tailwind) — 브랜드 토큰 `ink`, `signal` (`tailwind.config.js`), 나머지 색은 `COLORS` (`lib/config.ts`)
- TanStack Query (원격 JSON, AsyncStorage로 캐시 영속화 → 오프라인에서 마지막 브리핑 표시)
- Zustand + persist (설정, 읽음 기록, 스트릭, 저장, 워치리스트)
- react-native-google-mobile-ads, expo-notifications, expo-web-browser

## 프로젝트 구조

```
app/
  _layout.tsx           # 루트: QueryProvider, 테마, 설정 hydration 대기
  onboarding.tsx        # 가치 소개 → 역할 선택 → 알림 시간
  (tabs)/index.tsx      # Today: 역할별 브리핑, 진행도, 완료 카드, 스트릭
  (tabs)/explore.tsx    # News / Platforms / Experts / Creative Pulse
  (tabs)/saved.tsx      # 스와이프 파일 + 워치리스트
  (tabs)/settings.tsx   # 역할, 알림 시간, 출처, 개인정보
components/             # brief/, items/, pulse/, ads/(+ .web 스텁)
hooks/useBriefData.ts   # useLatest / useEdition / useFeed / usePulse
lib/                    # api, config, date, streak, watchlist, notifications, open, admob(+ .web)
stores/prefsStore.ts
pipeline/               # 데이터 파이프라인 (Node 24, 자체 package.json, node --test)
store.config.json       # App Store 메타데이터 (EAS Metadata)
assets/brand/           # 아이콘/마크 원본 SVG
```

## 코딩 컨벤션

- `any` 금지, 명시적 타입. 인터페이스에 `I` 접두사 없음, Props는 `컴포넌트명Props`
- 컴포넌트는 화살표 함수 + named export (expo-router 화면은 default export)
- 스타일은 NativeWind `className`. 동적 값(퍼센트 폭, 섹션 색)만 `style`
- 서버 데이터는 TanStack Query, 전역 클라이언트 상태는 Zustand, 화면 로컬 상태는 useState
- 절대 경로 `@/` 사용, 복잡한 로직에는 한국어 주석
- 네이티브 전용 모듈(AdMob 등)은 `.web.ts(x)` 스텁을 둬서 웹 번들이 깨지지 않게 한다

## 명령어

```bash
npm test               # jest-expo 단위 테스트 (lib/__tests__)
npm run typecheck      # tsc --noEmit
npx expo export -p ios -p web   # 번들 확인
cd pipeline && npm test         # 파이프라인 테스트
```

## Git 커밋 컨벤션

`feat:` 기능 / `fix:` 버그 / `refactor:` / `style:` / `docs:` / `test:` / `ci:` / `chore:`
