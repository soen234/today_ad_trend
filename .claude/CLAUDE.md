# CLAUDE.md - Ad Trend Viewer Project

> 이 파일은 Claude Code가 프로젝트 컨텍스트를 이해하고 일관된 코드를 생성하도록 돕는 프로젝트 규칙 문서입니다.

## 참조 문서
- @.claude/PRD.md - 제품 요구사항 문서 (기능 명세, 화면 구성, 수익화 전략)

## 프로젝트 개요

**Ad Trend Viewer**는 광고 트렌드를 탐색하고 분석할 수 있는 React Native(Expo) 모바일 앱입니다.

---

## 기술 스택

### 필수 기술
- **Framework**: React Native with Expo (SDK 54+)
- **Language**: TypeScript (strict mode)
- **Routing**: Expo Router (파일 기반 라우팅)
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: Zustand (전역 상태), TanStack Query (서버 상태)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Ad Monetization**: Google AdMob Mediation → AppLovin MAX (스케일업 시)

### 패키지 의존성
```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "expo-router": "~4.0.0",
    "nativewind": "^4.0.0",
    "react-native-reanimated": "~3.10.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "expo-image": "~2.0.0",
    "lucide-react-native": "^0.460.0",
    "react-hook-form": "^7.54.0",
    "react-native-google-mobile-ads": "^14.0.0"
  }
}
```

---

## 프로젝트 구조

```
ad-trend-viewer/
├── app/                      # Expo Router 페이지
│   ├── (tabs)/               # 탭 네비게이션 그룹
│   │   ├── _layout.tsx       # 탭 레이아웃
│   │   ├── index.tsx         # 홈 화면
│   │   ├── formats.tsx       # 광고 포맷 탐색
│   │   ├── categories.tsx    # 카테고리 탐색
│   │   ├── saved.tsx         # 저장된 광고
│   │   └── settings.tsx      # 설정
│   ├── ad/
│   │   └── [id].tsx          # 광고 상세 화면
│   ├── category/
│   │   └── [id].tsx          # 카테고리별 광고 목록
│   ├── search.tsx            # 검색 화면
│   └── _layout.tsx           # 루트 레이아웃
├── components/               # 재사용 컴포넌트
│   ├── ui/                   # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   ├── ads/                  # 광고 콘텐츠 관련 컴포넌트
│   │   ├── AdCard.tsx
│   │   ├── AdGrid.tsx
│   │   ├── AdCarousel.tsx
│   │   └── AdDetailSheet.tsx
│   ├── monetization/         # 광고 수익화 컴포넌트
│   │   ├── BannerAd.tsx
│   │   ├── InterstitialAd.tsx
│   │   ├── RewardedAd.tsx
│   │   ├── NativeAd.tsx
│   │   └── AppOpenAd.tsx
│   ├── categories/           # 카테고리 컴포넌트
│   │   ├── CategoryGrid.tsx
│   │   └── CategoryCard.tsx
│   └── layout/               # 레이아웃 컴포넌트
│       ├── Header.tsx
│       └── TabBar.tsx
├── hooks/                    # 커스텀 훅
│   ├── useAds.ts
│   ├── useCategories.ts
│   ├── useCollections.ts
│   ├── useSearch.ts
│   └── useAdMob.ts           # 광고 SDK 훅
├── lib/                      # 유틸리티 & 설정
│   ├── supabase.ts           # Supabase 클라이언트
│   ├── admob.ts              # AdMob 설정 & 유틸리티
│   ├── constants.ts          # 상수 정의
│   └── utils.ts              # 헬퍼 함수
├── stores/                   # Zustand 스토어
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── adStore.ts            # 광고 상태 관리
├── types/                    # TypeScript 타입 정의
│   ├── database.ts           # Supabase 타입
│   ├── admob.ts              # AdMob 타입
│   └── index.ts
└── assets/                   # 정적 에셋
```

---

## 코딩 컨벤션

### TypeScript
- 모든 파일은 `.tsx` 또는 `.ts` 확장자 사용
- `any` 타입 사용 금지 - 명시적 타입 정의 필수
- 인터페이스는 `I` 접두사 없이 명명 (예: `Ad`, `Category`)
- 타입은 `Type` 접미사 사용 가능 (예: `AdFormatType`)

```typescript
// ✅ Good
interface Ad {
  id: string;
  advertiserName: string;
  creativeUrl: string;
}

// ❌ Bad
interface IAd {
  id: any;
  advertiser_name: string;
}
```

### 컴포넌트 작성 규칙
- 함수형 컴포넌트 + 화살표 함수 사용
- Props 인터페이스는 컴포넌트명 + `Props` 접미사
- 컴포넌트 파일은 PascalCase

```typescript
// ✅ Good
interface AdCardProps {
  ad: Ad;
  onPress?: () => void;
  showBookmark?: boolean;
}

export const AdCard = ({ ad, onPress, showBookmark = true }: AdCardProps) => {
  return (
    <Pressable onPress={onPress} className="bg-white rounded-xl p-3">
      {/* ... */}
    </Pressable>
  );
};

// ❌ Bad
export function AdCard(props: any) {
  return <View>...</View>;
}
```

### NativeWind 스타일링
- 인라인 className 사용
- 복잡한 조건부 스타일은 `clsx` 또는 템플릿 리터럴 사용
- 공통 스타일은 컴포넌트화

```typescript
// ✅ Good
<View className="flex-1 bg-gray-50 dark:bg-gray-900">
  <Text className={`text-lg font-bold ${isActive ? 'text-blue-500' : 'text-gray-700'}`}>
    {title}
  </Text>
</View>

// ❌ Bad - StyleSheet 사용 지양
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' }
});
```

### 상태 관리
- 서버 데이터: TanStack Query 사용
- 클라이언트 전역 상태: Zustand 사용
- 로컬 상태: useState/useReducer

```typescript
// TanStack Query - 서버 데이터 페칭
export const useAds = (format?: AdFormat) => {
  return useQuery({
    queryKey: ['ads', format],
    queryFn: () => fetchAds(format),
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// Zustand - 전역 UI 상태
export const useUIStore = create<UIState>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
```

---

## 데이터 타입 정의

### 핵심 타입
```typescript
// types/index.ts

export type AdFormat = 
  | 'banner' 
  | 'interstitial' 
  | 'rewarded' 
  | 'native' 
  | 'playable' 
  | 'app_open';

export type Platform = 'ios' | 'android' | 'web';

export interface Ad {
  id: string;
  advertiserName: string;
  advertiserLogoUrl: string | null;
  creativeType: 'image' | 'video' | 'playable';
  creativeUrl: string;
  thumbnailUrl: string | null;
  adFormat: AdFormat;
  categoryTier1: string;
  categoryTier2: string | null;
  platform: Platform[];
  firstSeenAt: string;
  lastSeenAt: string;
  viewCount: number;
}

export interface Category {
  id: string;
  nameKo: string;
  nameEn: string;
  tier: 1 | 2;
  parentId: string | null;
  iconName: string;
  displayOrder: number;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  adCount?: number;
}
```

---

## 파일 네이밍 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `AdCard.tsx`, `CategoryGrid.tsx` |
| 훅 | camelCase + use 접두사 | `useAds.ts`, `useSearch.ts` |
| 유틸리티 | camelCase | `utils.ts`, `formatDate.ts` |
| 상수 | camelCase (파일), UPPER_SNAKE_CASE (변수) | `constants.ts`, `AD_FORMATS` |
| 타입 | camelCase (파일), PascalCase (타입명) | `database.ts`, `interface Ad` |
| 페이지 (Expo Router) | kebab-case 또는 camelCase | `[id].tsx`, `formats.tsx` |

---

## Supabase 쿼리 패턴

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// hooks/useAds.ts
export const fetchAds = async (format?: AdFormat, category?: string) => {
  let query = supabase
    .from('ads')
    .select('*')
    .order('last_seen_at', { ascending: false });

  if (format) {
    query = query.eq('ad_format', format);
  }
  
  if (category) {
    query = query.eq('category_tier1', category);
  }

  const { data, error } = await query.limit(20);
  
  if (error) throw error;
  return data;
};
```

---

## 에러 핸들링

- TanStack Query의 에러 상태 활용
- 사용자 친화적 에러 메시지 표시
- Sentry 연동 (프로덕션)

```typescript
export const AdGrid = () => {
  const { data, isLoading, error } = useAds();

  if (isLoading) return <AdGridSkeleton />;
  
  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-red-500 text-center">
          광고를 불러오는 중 문제가 발생했습니다.
        </Text>
        <Button onPress={() => refetch()}>다시 시도</Button>
      </View>
    );
  }

  return <FlatList data={data} renderItem={...} />;
};
```

---

## 성능 최적화

1. **이미지 최적화**: `expo-image` 사용 (캐싱 내장)
2. **리스트 최적화**: `FlashList` 고려
3. **메모이제이션**: `React.memo`, `useMemo`, `useCallback` 적절히 사용
4. **번들 분석**: Metro 번들러 분석 활용

---

## 환경 변수

`.env` 파일 구조:
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AdMob (app.json에서도 설정 필요)
EXPO_PUBLIC_ADMOB_APP_ID_IOS=ca-app-pub-xxxxx~xxxxx
EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=ca-app-pub-xxxxx~xxxxx
```

---

## 📢 광고 SDK 통합 (AdMob Mediation)

### Ad Unit IDs 설정
```typescript
// lib/admob.ts
export const AD_UNIT_IDS = {
  banner: {
    ios: __DEV__ ? 'ca-app-pub-3940256099942544/2934735716' : 'ca-app-pub-xxxxx/xxxxx',
    android: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-xxxxx/xxxxx',
  },
  interstitial: {
    ios: __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-xxxxx/xxxxx',
    android: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-xxxxx/xxxxx',
  },
  rewarded: {
    ios: __DEV__ ? 'ca-app-pub-3940256099942544/1712485313' : 'ca-app-pub-xxxxx/xxxxx',
    android: __DEV__ ? 'ca-app-pub-3940256099942544/5224354917' : 'ca-app-pub-xxxxx/xxxxx',
  },
  native: {
    ios: __DEV__ ? 'ca-app-pub-3940256099942544/3986624511' : 'ca-app-pub-xxxxx/xxxxx',
    android: __DEV__ ? 'ca-app-pub-3940256099942544/2247696110' : 'ca-app-pub-xxxxx/xxxxx',
  },
  appOpen: {
    ios: __DEV__ ? 'ca-app-pub-3940256099942544/5575463023' : 'ca-app-pub-xxxxx/xxxxx',
    android: __DEV__ ? 'ca-app-pub-3940256099942544/9257395921' : 'ca-app-pub-xxxxx/xxxxx',
  },
};
```

### app.json 설정
```json
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
```

### Banner 광고 컴포넌트
```typescript
// components/monetization/BannerAd.tsx
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { AD_UNIT_IDS } from '@/lib/admob';

interface BannerAdProps {
  size?: BannerAdSize;
}

export const AdBanner = ({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }: BannerAdProps) => {
  const unitId = Platform.select({
    ios: AD_UNIT_IDS.banner.ios,
    android: AD_UNIT_IDS.banner.android,
  })!;

  return (
    <BannerAd
      unitId={unitId}
      size={size}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
};
```

### Interstitial 광고 훅
```typescript
// hooks/useAdMob.ts
import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { AD_UNIT_IDS } from '@/lib/admob';

export const useInterstitialAd = () => {
  const [loaded, setLoaded] = useState(false);
  
  const unitId = Platform.select({
    ios: AD_UNIT_IDS.interstitial.ios,
    android: AD_UNIT_IDS.interstitial.android,
  })!;
  
  const interstitial = InterstitialAd.createForAdRequest(unitId);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      interstitial.load(); // 다음 광고 미리 로드
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const showAd = () => {
    if (loaded) {
      interstitial.show();
    }
  };

  return { loaded, showAd };
};
```

### Rewarded 광고 훅
```typescript
// hooks/useAdMob.ts (계속)
import { RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

export const useRewardedAd = (onReward: () => void) => {
  const [loaded, setLoaded] = useState(false);
  
  const unitId = Platform.select({
    ios: AD_UNIT_IDS.rewarded.ios,
    android: AD_UNIT_IDS.rewarded.android,
  })!;
  
  const rewarded = RewardedAd.createForAdRequest(unitId);

  useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        onReward(); // 보상 지급 콜백
      }
    );

    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  const showAd = () => {
    if (loaded) {
      rewarded.show();
    }
  };

  return { loaded, showAd };
};
```

### 광고 노출 규칙
```typescript
// stores/adStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdState {
  // Interstitial 빈도 제한
  interstitialCount: number;
  lastInterstitialTime: number;
  incrementInterstitial: () => void;
  canShowInterstitial: () => boolean;
  
  // App Open 제한
  lastAppOpenTime: number;
  setLastAppOpenTime: (time: number) => void;
  canShowAppOpen: () => boolean;
}

export const useAdStore = create<AdState>()(
  persist(
    (set, get) => ({
      interstitialCount: 0,
      lastInterstitialTime: 0,
      
      incrementInterstitial: () => set((state) => ({
        interstitialCount: state.interstitialCount + 1,
        lastInterstitialTime: Date.now(),
      })),
      
      // 시간당 최대 3회, 광고 조회 3회마다 1회
      canShowInterstitial: () => {
        const { interstitialCount, lastInterstitialTime } = get();
        const hourAgo = Date.now() - 60 * 60 * 1000;
        
        if (lastInterstitialTime < hourAgo) {
          set({ interstitialCount: 0 });
          return true;
        }
        
        return interstitialCount < 3;
      },
      
      lastAppOpenTime: 0,
      setLastAppOpenTime: (time) => set({ lastAppOpenTime: time }),
      
      // 백그라운드 30초 이상 후에만 노출
      canShowAppOpen: () => {
        const { lastAppOpenTime } = get();
        return Date.now() - lastAppOpenTime > 30 * 1000;
      },
    }),
    {
      name: 'ad-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 메디에이션 설정 (AdMob → AppLovin MAX 전환 시)
```typescript
// lib/admob.ts - AppLovin MAX로 전환 시
// 1. react-native-google-mobile-ads 제거
// 2. react-native-applovin-max 설치
// 3. 아래 코드로 교체

/*
import AppLovinMAX from 'react-native-applovin-max';

export const initializeMAX = async () => {
  await AppLovinMAX.initialize('YOUR_SDK_KEY');
  
  // 메디에이션 네트워크 설정은 MAX 대시보드에서 진행
  // AdMob, Meta Audience Network, Unity Ads 등 추가
};
*/
```

### SSP별 권장 지면 매핑

| 지면 | 1순위 SSP | 2순위 SSP | 예상 eCPM |
|------|----------|----------|----------|
| Banner | AdMob | Meta Audience | $0.5~$2.5 |
| Interstitial | AdMob | InMobi | $4.5~$4.8 |
| Rewarded | Unity Ads | AppLovin | $10~$30 |
| Native | InMobi | Meta Audience | $3~$8 |
| App Open | AdMob | - | $3~$6 |

---

## Git 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 스타일/포맷팅 변경
docs: 문서 수정
chore: 빌드/설정 변경
```

예시:
```
feat: AdCard 컴포넌트 북마크 기능 추가
fix: 카테고리 필터 초기화 버그 수정
refactor: useAds 훅 쿼리 키 구조 개선
```

---

## 테스트

- 단위 테스트: Jest + React Native Testing Library
- E2E 테스트: Maestro (권장)

---

## 주의사항

1. **절대 경로 import**: `@/` 별칭 사용
2. **한국어 주석**: 복잡한 로직에 한국어 주석 권장
3. **타입 안전성**: Supabase 자동 생성 타입 활용
4. **반응형**: 다양한 디바이스 크기 고려

---

## 참고 문서

- [Expo Router 문서](https://docs.expo.dev/router/introduction/)
- [NativeWind 문서](https://www.nativewind.dev/)
- [TanStack Query 문서](https://tanstack.com/query/latest)
- [Supabase 문서](https://supabase.com/docs)
- [Zustand 문서](https://docs.pmnd.rs/zustand/getting-started/introduction)