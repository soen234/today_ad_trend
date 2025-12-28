# Ad Trend Viewer - Product Requirements Document

## 📌 개요

**프로젝트명**: Ad Trend Viewer (광고 트렌드 뷰어)

**버전**: 1.0

**목적**: 다양한 광고 지면 타입과 카테고리별로 현재 트렌드 광고를 탐색하고 분석할 수 있는 모바일 앱 서비스

**타겟 사용자**: 마케터, 광고 기획자, 크리에이티브 디자이너, 스타트업 창업자, 광고 업계 종사자

---

## 🎯 핵심 가치 제안

1. **광고 트렌드 인사이트**: 현재 시장에서 어떤 광고들이 집행되고 있는지 한눈에 파악
2. **지면별 분류**: 광고 포맷(배너, 전면, 리워드 등)별로 구분하여 탐색
3. **카테고리별 탐색**: IAB 표준 기반 광고 카테고리로 세분화된 탐색 경험
4. **크리에이티브 영감**: 실제 집행 중인 광고 크리에이티브에서 아이디어 획득

---

## 📱 기능 명세

### 1. 홈 화면 (Home)

**목적**: 오늘의 트렌드 광고와 주요 카테고리 하이라이트 제공

**UI 요소**:
- 상단 검색바 (광고주, 키워드 검색)
- "오늘의 핫 광고" 캐러셀 (수평 스크롤)
- "지면별 트렌드" 퀵 액세스 카드 (6개 광고 포맷)
- "인기 카테고리" 그리드 (8개 주요 카테고리)
- 하단 탭 네비게이션

**데이터 요구사항**:
- 조회수 기반 인기 광고 상위 10개
- 카테고리별 최신 광고 썸네일

---

### 2. 광고 지면 타입 탐색 (Ad Formats)

**목적**: 광고 포맷별로 분류된 광고 크리에이티브 탐색

**광고 포맷 분류 (6가지 주요 타입)**:

| 포맷명 | 설명 | 아이콘 제안 |
|--------|------|------------|
| **Banner** | 앱 상/하단 고정 배너 광고 (320x50, 300x250 MREC) | 📐 |
| **Interstitial** | 전면 광고, 화면 전환 시점에 노출 | 📱 |
| **Rewarded Video** | 보상형 동영상 광고, 시청 완료 시 보상 제공 | 🎁 |
| **Native** | 앱 UI와 자연스럽게 통합된 광고 | 🧩 |
| **Playable** | 인터랙티브 체험형 광고 (주로 게임) | 🎮 |
| **App Open** | 앱 실행 시 전면 노출되는 광고 | 🚀 |

**UI 요소**:
- 상단 탭바 (포맷 6개 + All)
- 그리드 레이아웃 (2열)으로 광고 카드 나열
- 광고 카드 구성: 썸네일, 광고주명, 카테고리 태그, 등록일
- 무한 스크롤 페이지네이션
- 필터: 기간(7일/30일/전체), 정렬(최신순/인기순)

---

### 3. 광고 카테고리 탐색 (Categories)

**목적**: IAB 표준 기반 카테고리별 광고 탐색

**Tier-1 카테고리 (주요 26개 중 앱에 적합한 12개 선정)**:

| 카테고리 | 영문명 | 아이콘 |
|---------|--------|--------|
| 게임 | Games | 🎮 |
| 쇼핑/이커머스 | Shopping | 🛒 |
| 금융/핀테크 | Finance | 💰 |
| 건강/피트니스 | Health & Fitness | 💪 |
| 음식/배달 | Food & Drink | 🍔 |
| 여행 | Travel | ✈️ |
| 엔터테인먼트 | Entertainment | 🎬 |
| 교육 | Education | 📚 |
| 라이프스타일 | Lifestyle | 🏠 |
| 뷰티/패션 | Beauty & Fashion | 💄 |
| 테크/앱 | Technology | 📱 |
| 자동차 | Automotive | 🚗 |

**Tier-2 세부 카테고리 예시** (게임 선택 시):
- 캐주얼 게임
- 퍼즐/보드 게임
- RPG/MMORPG
- 액션/슈팅
- 시뮬레이션
- 스포츠 게임

**UI 요소**:
- Tier-1 카테고리 그리드 (3x4 레이아웃)
- 카테고리 선택 시 → Tier-2 서브카테고리 리스트 + 광고 그리드
- 브레드크럼 네비게이션
- 필터/정렬 옵션

---

### 4. 광고 상세 화면 (Ad Detail)

**목적**: 개별 광고의 상세 정보 및 크리에이티브 확인

**표시 정보**:
- **크리에이티브 프리뷰**: 이미지/동영상 뷰어 (핀치 줌 지원)
- **광고주 정보**: 광고주명, 로고
- **광고 메타데이터**:
  - 광고 포맷 타입
  - 카테고리 (Tier-1 > Tier-2)
  - 최초 발견일 / 마지막 확인일
  - 노출 플랫폼 (iOS/Android/Web)
- **CTA 버튼**: 링크 복사, 공유, 저장(북마크)

**UI 요소**:
- 풀스크린 미디어 뷰어 (상단)
- 하단 시트 형태의 정보 패널
- 관련 광고 추천 캐러셀 (같은 광고주/카테고리)

---

### 5. 검색 기능 (Search)

**목적**: 키워드, 광고주, 브랜드명으로 광고 검색

**검색 범위**:
- 광고주명
- 브랜드명
- 광고 카피 텍스트
- 카테고리명

**UI 요소**:
- 검색창 (자동완성 지원)
- 최근 검색어 히스토리
- 검색 결과 필터: 포맷, 카테고리, 기간
- 검색 결과 그리드

---

### 6. 저장/컬렉션 (Collections)

**목적**: 관심 광고 저장 및 컬렉션 관리

**기능**:
- 광고 북마크 (하트 아이콘)
- 커스텀 컬렉션 생성 (폴더 개념)
- 컬렉션 공유 (딥링크)

**UI 요소**:
- "내 저장" 탭
- 컬렉션 리스트 (그리드)
- 컬렉션 내 광고 목록
- 컬렉션 편집/삭제 기능

---

### 7. 설정 (Settings)

**기본 설정**:
- 알림 설정 (새로운 트렌드 알림)
- 테마 (라이트/다크)
- 언어 (한국어/English)

---

## 🏗️ 기술 스택 (권장)

### Frontend (Mobile App)
```
React Native + Expo (SDK 54+)
├── 라우팅: Expo Router (파일 기반 라우팅)
├── 스타일링: NativeWind (Tailwind CSS for RN)
├── 상태관리: Zustand
├── 서버 상태: TanStack Query (React Query)
├── 애니메이션: React Native Reanimated
├── 폼 관리: React Hook Form
├── 아이콘: lucide-react-native
└── 이미지: expo-image
```

### Backend (API)
```
Supabase (BaaS)
├── PostgreSQL 데이터베이스
├── Row Level Security (RLS)
├── Supabase Auth (인증)
├── Supabase Storage (미디어 저장)
└── Edge Functions (서버리스)
```

### 광고 수익화 (Ad Monetization)
```
메디에이션: Google AdMob Mediation (초기) → AppLovin MAX (스케일업)
├── Google AdMob (기본 네트워크)
├── Meta Audience Network
├── Unity Ads (Rewarded 특화)
└── InMobi (Native 특화)
```

### 데이터 수집 (선택적)
```
광고 데이터 소스:
├── Meta Ad Library API
├── Google Ads Transparency Center (크롤링)
├── TikTok Commercial Content Library
└── 자체 광고 데이터 입력 시스템
```

---

## 📊 데이터 스키마

### ads 테이블
```sql
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_name TEXT NOT NULL,
  advertiser_logo_url TEXT,
  creative_type TEXT NOT NULL, -- 'image', 'video', 'playable'
  creative_url TEXT NOT NULL,
  thumbnail_url TEXT,
  ad_format TEXT NOT NULL, -- 'banner', 'interstitial', 'rewarded', 'native', 'playable', 'app_open'
  category_tier1 TEXT NOT NULL,
  category_tier2 TEXT,
  platform TEXT[], -- ['ios', 'android', 'web']
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### categories 테이블
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  tier INTEGER NOT NULL, -- 1 or 2
  parent_id TEXT REFERENCES categories(id),
  icon_name TEXT,
  display_order INTEGER
);
```

### collections 테이블
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### saved_ads 테이블
```sql
CREATE TABLE saved_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ad_id UUID REFERENCES ads(id),
  collection_id UUID REFERENCES collections(id),
  saved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, ad_id, collection_id)
);
```

---

## 📐 화면 와이어프레임 가이드

### 탭 네비게이션 구조
```
┌────────────────────────────────────┐
│          [앱 헤더 / 검색바]          │
├────────────────────────────────────┤
│                                    │
│          [메인 콘텐츠 영역]          │
│                                    │
│                                    │
├────────────────────────────────────┤
│  🏠    📱    📂    💾    ⚙️      │
│ Home  Format Category Saved Settings│
└────────────────────────────────────┘
```

### 광고 카드 컴포넌트
```
┌─────────────────────────────┐
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   [광고 썸네일]        │  │
│  │   (16:9 or 1:1)       │  │
│  │                       │  │
│  └───────────────────────┘  │
│  광고주명                    │
│  [배너] [게임] [11월 25일]    │
│                       [♡]  │
└─────────────────────────────┘
```

---

## ✅ 수락 기준 (Acceptance Criteria)

### Phase 1 - MVP (2주)
- [ ] Expo 프로젝트 초기 설정 (TypeScript, NativeWind)
- [ ] 탭 네비게이션 구현 (5개 탭)
- [ ] 홈 화면 UI 구현
- [ ] 광고 포맷별 탐색 화면
- [ ] 광고 카테고리별 탐색 화면
- [ ] 광고 상세 화면
- [ ] 목업 데이터로 동작 확인

### Phase 2 - Backend 연동 (1주)
- [ ] Supabase 프로젝트 설정
- [ ] 데이터베이스 스키마 생성
- [ ] TanStack Query로 API 연동
- [ ] 검색 기능 구현

### Phase 3 - 사용자 기능 (1주)
- [ ] 인증 (Supabase Auth)
- [ ] 북마크/저장 기능
- [ ] 컬렉션 관리
- [ ] 다크 모드

### Phase 4 - 광고 수익화 (1주)
- [ ] AdMob Mediation SDK 통합
- [ ] Banner 광고 (하단 고정)
- [ ] Interstitial 광고 (화면 전환 시)
- [ ] Native 광고 (피드 내 삽입)
- [ ] Rewarded 광고 (프리미엄 기능 언락)

---

## 💰 광고 수익화 전략 (Ad Monetization)

### 광고 지면 배치 계획

| 지면 타입 | 배치 위치 | 노출 빈도 | 우선순위 |
|----------|----------|----------|---------|
| **Banner** | 홈/탐색 화면 하단 고정 | 상시 노출 | 높음 |
| **Interstitial** | 광고 상세 → 목록 복귀 시 | 3회 조회마다 1회 | 높음 |
| **Native** | 광고 목록 피드 내 (10개마다 1개) | 스크롤 시 | 중간 |
| **Rewarded** | "광고 10개 더 보기" 기능 | 사용자 선택 | 중간 |
| **App Open** | 앱 재진입 시 (백그라운드 30초+) | 세션당 1회 | 낮음 |

### SSP/네트워크별 지면 할당

| 지면 | 1순위 SSP | 2순위 SSP | 예상 eCPM |
|------|----------|----------|----------|
| **Banner** | Google AdMob | Meta Audience Network | $0.5 ~ $2.5 |
| **Interstitial** | Google AdMob | InMobi | $4.5 ~ $4.8 |
| **Rewarded Video** | Unity Ads | AppLovin | $10 ~ $30 |
| **Native** | InMobi | Meta Audience Network | $3 ~ $8 |
| **App Open** | Google AdMob | - | $3 ~ $6 |

### 메디에이션 전략

#### Phase 1 - MVP (AdMob Mediation)
```
Google AdMob Mediation
├── AdMob (자체) - 기본 Fill
├── Meta Audience Network - 높은 eCPM
└── Unity Ads - Rewarded 특화

소요 시간: 4-6시간
장점: 쉬운 설정, Firebase 연동
```

#### Phase 2 - 스케일업 (AppLovin MAX 전환)
```
AppLovin MAX (DAU 10,000+ 도달 시)
├── AppLovin (자체)
├── Google AdMob
├── Meta Audience Network
├── Unity Ads
├── InMobi
└── Vungle

장점: In-App Bidding 자동 최적화, 높은 수익
```

### 사용자 경험(UX) 가이드라인

1. **빈도 제한 (Frequency Capping)**
   - Interstitial: 사용자당 시간당 최대 3회
   - App Open: 세션당 1회
   - Rewarded: 무제한 (사용자 선택)

2. **자연스러운 전환점 활용**
   - 광고 상세 화면 종료 시 Interstitial
   - 피드 스크롤 중 Native (10번째 아이템마다)
   - 앱 재진입 시 App Open (30초+ 백그라운드 후)

3. **프리미엄 기능 연동**
   - Rewarded 시청 → 광고 10개 추가 열람
   - Rewarded 시청 → 광고 없이 30분 이용
   - 광고 제거 구독 옵션 (v2에서 고려)

### 예상 수익 시뮬레이션

| DAU | Banner | Interstitial | Native | Rewarded | 월 예상 수익 |
|-----|--------|--------------|--------|----------|-------------|
| 1,000 | $45 | $30 | $20 | $15 | **$110** |
| 5,000 | $225 | $150 | $100 | $75 | **$550** |
| 10,000 | $450 | $300 | $200 | $150 | **$1,100** |
| 50,000 | $2,250 | $1,500 | $1,000 | $750 | **$5,500** |

*가정: Banner eCPM $1.5, Interstitial $4.5, Native $3, Rewarded $15, 평균 세션 3회/일*

---

## 🚫 범위 외 (Out of Scope)

1. 광고 데이터 자동 크롤링 시스템 (v1에서는 수동 입력 또는 시드 데이터)
2. 광고 효과 분석/리포팅 기능
3. 광고주 대시보드
4. 실시간 알림 (푸시 노티피케이션)
5. 결제/구독 시스템

---

## 📚 참고 레퍼런스

### 유사 서비스
- **Meta Ad Library**: facebook.com/ads/library
- **Google Ads Transparency Center**: adstransparency.google.com
- **Foreplay.co**: 광고 크리에이티브 스와이프 파일
- **MagicBrief**: AI 기반 광고 분석

### IAB 카테고리 표준
- IAB Tech Lab Content Taxonomy 3.0
- GitHub: InteractiveAdvertisingBureau/Taxonomies

---

## 🔑 성공 지표 (Success Metrics)

1. **사용자 참여**: 일평균 세션 시간 5분 이상
2. **탐색 깊이**: 세션당 평균 15개 이상 광고 조회
3. **저장률**: 활성 사용자 30% 이상이 1개 이상 광고 저장
4. **재방문율**: 주간 재방문율 40% 이상