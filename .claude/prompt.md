# Claude Code 실행 프롬프트

> 아래 프롬프트를 Claude Code에 복사해서 사용하세요.
> **✅ 완료** 표시된 항목은 이미 구현되어 스킵 가능합니다.

---

## 📋 구현 진행 상태

| 단계 | 항목 | 상태 |
|------|------|------|
| 1 | 프로젝트 초기화 | ✅ 완료 |
| 2 | 탭 네비게이션 | ✅ 완료 |
| 3 | 홈 화면 | ✅ 완료 |
| 4 | 포맷 탐색 화면 | ✅ 완료 |
| 5 | 카테고리 탐색 화면 | ✅ 완료 |
| 6 | 광고 상세 화면 | ✅ 완료 (저장 버튼 연동 필요) |
| 7 | 검색 기능 | ⚠️ 부분 (별도 검색 화면 필요) |
| 8 | 저장/컬렉션 화면 | ⚠️ 부분 (컬렉션 CRUD 필요) |
| 9 | 설정 화면 | ✅ 완료 |
| 10 | Supabase 백엔드 | ❌ 미착수 |
| 11 | 광고 수익화 (AdMob) | ❌ 미착수 |

---

## ✅ 완료된 프롬프트 (스킵 가능)

### 🚀 프로젝트 초기화 - ✅ 완료
- Expo SDK 54+, TypeScript, NativeWind 설정 완료
- 모든 패키지 설치 완료

### 📱 탭 네비게이션 - ✅ 완료
- 5개 탭 (Home, Formats, Categories, Saved, Settings) 구현
- lucide-react-native 아이콘, 다크모드 지원

### 🎨 홈 화면 - ✅ 완료
- TrendSection, CategoryTrendCarousel 구현
- 검색바, 카테고리 필터, AdGrid 구현

### 📐 포맷 탐색 화면 - ✅ 완료
- 6개 포맷 탭 + 필터/정렬 기능
- 2열 그리드, 무한 스크롤 구조

### 📂 카테고리 탐색 화면 - ✅ 완료
- 12개 Tier-1 카테고리 그리드
- app/category/[id].tsx 카테고리별 광고 목록

### ⚙️ 설정 화면 - ✅ 완료
- 다크 모드 토글, 언어 설정 (uiStore 연동)
- 알림/이용약관/개인정보 UI 구현

---

## 🔧 수정 필요 프롬프트 (다음 실행)

### 📋 1. 광고 상세 저장 버튼 연동 (MVP 보완)

```
광고 상세 화면(app/ad/[id].tsx)의 저장 버튼을 savedStore와 연동해줘.

## 현재 상태
- 저장 버튼(Heart 아이콘)이 있지만 클릭해도 동작 안함
- savedStore는 이미 구현되어 있음 (stores/savedStore.ts)

## 수정 사항
1. useSavedStore import 추가
2. isAdSaved(ad.id)로 저장 여부 확인
3. 헤더 Heart 버튼 클릭 시 toggleSaveAd(ad.id) 호출
4. 하단 "저장" 버튼도 동일하게 연동
5. 저장된 상태면 Heart filled(빨간색), 아니면 outline(흰색)

## 파일
- app/ad/[id].tsx
```

---

### 📋 2. AdCard 북마크 기능 추가

```
AdCard 컴포넌트에 북마크 버튼을 추가해줘.

## 현재 상태
- AdCard에 북마크 아이콘이 없음
- 광고 카드 클릭은 상세 페이지로 이동

## 수정 사항
1. AdCard 우상단에 Heart 아이콘 버튼 추가
2. savedStore와 연동하여 저장/해제 토글
3. 저장 상태에 따라 아이콘 색상 변경 (filled red / outline gray)
4. 버튼 클릭 시 이벤트 버블링 방지 (카드 클릭과 분리)

## 파일
- components/ads/AdCard.tsx
```

---

## ⏭️ 다음 단계 프롬프트 (Phase 2-4)

### 🔍 검색 화면 구현 (Phase 2)

```
검색 화면(app/search.tsx)을 구현해줘.

## 화면 구성
1. **검색 헤더**
   - 뒤로가기 버튼
   - 검색 입력 필드 (자동 포커스)
   - 취소 버튼

2. **검색 전 상태**
   - 최근 검색어 (로컬 스토리지 저장)
   - 인기 검색어 (목업)
   - 각 항목 클릭 시 검색 실행

3. **검색 결과**
   - 실시간 검색 (debounce 300ms)
   - 결과 그리드 (formats 화면과 동일)
   - 결과 개수 표시
   - 결과 없음 상태

4. **필터 옵션**
   - 포맷 필터
   - 카테고리 필터
   - 기간 필터

## 훅
- hooks/useSearch.ts: 검색 로직 + TanStack Query
- hooks/useSearchHistory.ts: AsyncStorage로 검색 히스토리 관리

## 최적화
- debounce 적용
- 검색어 2글자 이상일 때만 API 호출
```

---

### 💾 컬렉션 CRUD 기능 구현 (Phase 3)

```
저장된 광고 화면(saved.tsx)에 컬렉션 CRUD 기능을 추가해줘.

## 현재 상태
- "모든 저장" 탭: 정상 작동
- "내 컬렉션" 탭: UI만 있고 기능 없음
- savedStore는 광고 ID 배열만 관리

## 구현 사항

### 1. collectionsStore 생성 (stores/collectionsStore.ts)
interface Collection {
  id: string;
  name: string;
  description?: string;
  adIds: string[];
  createdAt: string;
}

- collections: Collection[]
- createCollection(name, description)
- deleteCollection(id)
- updateCollection(id, updates)
- addAdToCollection(collectionId, adId)
- removeAdFromCollection(collectionId, adId)
- AsyncStorage persist

### 2. 컬렉션 생성 모달
- "새 컬렉션 만들기" 버튼 클릭 시 모달 표시
- 이름 입력 필드 (필수)
- 설명 입력 필드 (선택)
- 생성/취소 버튼

### 3. 컬렉션 목록 표시
- 각 컬렉션 카드: 이름, 광고 개수
- 클릭 시 app/collection/[id].tsx로 이동

### 4. app/collection/[id].tsx 생성
- 컬렉션 내 광고 그리드
- 헤더에 컬렉션 이름
- 편집/삭제 옵션

## 파일
- stores/collectionsStore.ts (신규)
- app/(tabs)/saved.tsx (수정)
- app/collection/[id].tsx (신규)
```

---

### 🗄️ Supabase 백엔드 설정 (Phase 2)

```
Supabase 백엔드를 설정하고 앱과 연동해줘.

## 데이터베이스 스키마

### ads 테이블
- id: uuid (PK)
- advertiser_name: text (NOT NULL)
- advertiser_logo_url: text
- creative_type: text ('image', 'video', 'playable')
- creative_url: text (NOT NULL)
- thumbnail_url: text
- ad_format: text ('banner', 'interstitial', 'rewarded', 'native', 'playable', 'app_open')
- category_tier1: text (NOT NULL)
- category_tier2: text
- platform: text[] (['ios', 'android', 'web'])
- first_seen_at: timestamptz
- last_seen_at: timestamptz
- view_count: integer (DEFAULT 0)
- created_at: timestamptz

### categories 테이블
- id: text (PK)
- name_ko: text
- name_en: text
- tier: integer (1 or 2)
- parent_id: text (FK → categories.id)
- icon_name: text
- display_order: integer

### collections 테이블
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- name: text
- description: text
- is_public: boolean
- created_at: timestamptz

### saved_ads 테이블
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- ad_id: uuid (FK → ads)
- collection_id: uuid (FK → collections)
- saved_at: timestamptz
- UNIQUE(user_id, ad_id, collection_id)

## Row Level Security (RLS)
- ads: 모든 사용자 읽기 가능
- collections: 본인 것만 읽기/쓰기
- saved_ads: 본인 것만 읽기/쓰기

## 시드 데이터
- categories 테이블에 12개 Tier-1 카테고리 삽입
- ads 테이블에 20개 샘플 광고 삽입

## 앱 연동
- lib/supabase.ts 설정
- types/database.ts 타입 생성 (npx supabase gen types)
- 환경 변수 설정 (.env)
```

---

### 💰 광고 수익화 - AdMob 기본 설정 (Phase 4)

```
Ad Trend Viewer 앱에 AdMob Mediation을 통한 광고 수익화를 구현해줘.

## 1. AdMob SDK 설정

### app.json 설정
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-xxxxx~xxxxx",
          "iosAppId": "ca-app-pub-xxxxx~xxxxx"
        }
      ]
    ]
  }
}

### lib/admob.ts 생성
- 개발/프로덕션 환경별 Ad Unit ID 관리
- 테스트 ID (개발용):
  - Banner iOS: ca-app-pub-3940256099942544/2934735716
  - Banner Android: ca-app-pub-3940256099942544/6300978111
  - Interstitial iOS: ca-app-pub-3940256099942544/4411468910
  - Interstitial Android: ca-app-pub-3940256099942544/1033173712
  - Rewarded iOS: ca-app-pub-3940256099942544/1712485313
  - Rewarded Android: ca-app-pub-3940256099942544/5224354917

## 2. 광고 컴포넌트 구현

### components/monetization/BannerAd.tsx
- ANCHORED_ADAPTIVE_BANNER 사이즈 사용
- 화면 하단 고정 배치

### components/monetization/InterstitialAd.tsx (훅으로 구현)
- hooks/useInterstitialAd.ts
- 광고 로드/표시 로직
- 닫힘 후 자동 재로드

### components/monetization/RewardedAd.tsx (훅으로 구현)
- hooks/useRewardedAd.ts
- 보상 콜백 처리
- 로딩 상태 관리

## 3. 광고 배치

### Banner 광고
- 홈 화면 하단 고정
- 포맷/카테고리 탐색 화면 하단 고정

### Interstitial 광고
- 광고 상세 화면 종료 시 (3회 조회마다 1회)
- stores/adStore.ts로 빈도 제한 관리

### Rewarded 광고
- "광고 10개 더 보기" 버튼 클릭 시
- 설정 화면에 "광고 시청하고 프리미엄 기능 사용" 옵션

## 4. 빈도 제한 (Frequency Capping)

### stores/adStore.ts
- Zustand + AsyncStorage persist
- interstitialCount: 시간당 최대 3회
- lastInterstitialTime: 마지막 노출 시간
- canShowInterstitial(): 노출 가능 여부 확인

## 5. 사용자 경험 가이드라인
- 광고 로딩 중 스켈레톤 UI 표시
- 광고 로드 실패 시 graceful fallback (빈 공간 또는 숨김)
- Rewarded 광고는 항상 사용자 선택으로만 노출
```

---

### 📊 광고 수익화 - Native 광고 (Phase 4)

```
Ad Trend Viewer 앱에 Native 광고를 피드에 삽입해줘.

## 요구사항

### Native 광고 컴포넌트
- components/monetization/NativeAd.tsx
- 광고 카드와 유사한 스타일로 디자인
- "Sponsored" 또는 "광고" 라벨 표시

### 피드 내 삽입 로직
- 광고 목록 10개마다 1개의 Native 광고 삽입
- hooks/useAdsWithNativeAd.ts 훅 생성:
  - 기존 useAds 훅 확장
  - 데이터 배열에 Native 광고 아이템 삽입
  - 타입: { type: 'ad', data: Ad } | { type: 'native_ad' }

### AdGrid 컴포넌트 수정
- components/ads/AdGrid.tsx
- renderItem에서 type 체크하여 분기 렌더링
- Native 광고 아이템은 NativeAd 컴포넌트로 렌더링

### 스타일
- 일반 광고 카드와 동일한 크기
- 배경색 약간 다르게 (gray-100)
- "AD" 배지 우상단에 표시
```

---

### 🚀 광고 수익화 - App Open 광고 (Phase 4)

```
Ad Trend Viewer 앱에 App Open 광고를 구현해줘.

## 요구사항

### App Open 광고 로직
- hooks/useAppOpenAd.ts
- 앱이 백그라운드에서 포그라운드로 돌아올 때 노출
- 조건: 백그라운드 30초 이상 경과 시에만

### AppState 감지
- react-native의 AppState API 사용
- 백그라운드 진입 시간 기록
- 포그라운드 복귀 시 시간 차이 계산

### stores/adStore.ts 확장
- lastBackgroundTime: 백그라운드 진입 시간
- canShowAppOpen(): 30초 이상 경과 여부 체크

### app/_layout.tsx에 적용
- 루트 레이아웃에서 AppState 리스너 등록
- App Open 광고 로드 및 표시 로직

### 제한사항
- 세션당 1회만 노출
- 앱 최초 실행 시에는 노출하지 않음
- 사용자가 액션 중일 때는 노출하지 않음 (예: 폼 입력 중)
```

---

### 🔄 AppLovin MAX 전환 (스케일업 시 - Optional)

```
Ad Trend Viewer 앱의 광고 SDK를 AdMob에서 AppLovin MAX로 전환해줘.

## 전환 배경
- DAU 10,000+ 도달
- 더 높은 수익 최적화 필요
- In-App Bidding 활용

## 전환 작업

### 1. 패키지 교체
- 제거: react-native-google-mobile-ads
- 설치: react-native-applovin-max

### 2. app.json 설정 변경
{
  "expo": {
    "plugins": [
      ["react-native-applovin-max", {
        "sdkKey": "YOUR_SDK_KEY"
      }]
    ]
  }
}

### 3. lib/admob.ts → lib/applovin.ts 리팩토링
- MAX SDK 초기화
- Ad Unit ID 교체 (MAX 대시보드에서 생성)
- 메디에이션 네트워크는 MAX 대시보드에서 설정

### 4. 훅 수정
- useInterstitialAd.ts: AppLovinMAX.InterstitialAd 사용
- useRewardedAd.ts: AppLovinMAX.RewardedAd 사용
- useBannerAd.ts: AppLovinMAX.BannerAd 사용

### 5. 메디에이션 네트워크 설정 (MAX 대시보드)
- Google AdMob 어댑터 추가
- Meta Audience Network 어댑터 추가
- Unity Ads 어댑터 추가 (Rewarded 특화)
- InMobi 어댑터 추가 (Native 특화)

### 6. 테스트
- 각 네트워크별 테스트 광고 노출 확인
- Waterfall/Bidding 정상 동작 확인
- eCPM 비교 분석
```

---

## ✅ 최종 점검 (모든 Phase 완료 후)

```
Ad Trend Viewer 앱 최종 점검을 해줘.

## 체크리스트
1. 모든 화면 정상 렌더링 확인
2. 탭 네비게이션 동작 확인
3. 화면 간 이동 (라우팅) 확인
4. 다크 모드 전환 확인
5. 로딩/에러 상태 처리 확인
6. 목업 데이터 정상 표시 확인

## 코드 품질
1. TypeScript 에러 없음
2. ESLint 경고 해결
3. 불필요한 console.log 제거
4. 주석 정리

## 최적화
1. 이미지 캐싱 확인 (expo-image)
2. 리스트 가상화 확인 (FlatList)
3. 불필요한 리렌더링 방지 (memo, useMemo)

## 광고 수익화 점검
1. Banner 광고 정상 노출 (하단 고정)
2. Interstitial 광고 로드/표시 확인
3. Rewarded 광고 보상 콜백 동작 확인
4. Native 광고 피드 삽입 확인
5. 빈도 제한 (Frequency Capping) 동작 확인
6. 광고 로드 실패 시 graceful fallback 확인
7. 테스트 광고 ID로 동작 확인 (프로덕션 ID 교체 전)

## 문서화
1. README.md 업데이트
2. 환경 변수 문서화 (.env.example)
3. 주요 컴포넌트 JSDoc 주석
4. 광고 Ad Unit ID 문서화

문제가 있으면 수정하고, 앱을 실행할 수 있는 상태로 만들어줘.
```

---

## 💡 사용 팁

1. **단계별 진행**: 위 프롬프트를 순서대로 하나씩 실행
2. **컨텍스트 유지**: CLAUDE.md와 PRD 파일을 프로젝트 루트에 유지
3. **반복 개선**: 결과물이 마음에 안 들면 구체적으로 수정 요청
4. **오류 해결**: 에러 발생 시 에러 메시지와 함께 수정 요청
5. **확장**: 각 기능별로 세부 요구사항 추가 가능