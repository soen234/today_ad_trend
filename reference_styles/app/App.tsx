import { useState } from "react";
import { AdCard } from "./components/AdCard";
import { AdDetailModal } from "./components/AdDetailModal";
import { TrendSection } from "./components/TrendSection";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Mock data - 확장된 광고 데이터
const mockAds = [
  {
    id: "1",
    title: "2024 S/S 신상 컬렉션",
    brand: "루이비통",
    category: "패션",
    adType: "배너",
    imageUrl: "https://images.unsplash.com/photo-1760787545864-b468b6fe2c92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWR2ZXJ0aXNlbWVudHxlbnwxfHx8fDE3NjY2NDc4NDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    views: "1.2M",
    engagement: "8.4%",
    trending: true,
  },
  {
    id: "2",
    title: "갤럭시 S24 Ultra",
    brand: "삼성전자",
    category: "테크",
    adType: "동영상",
    imageUrl: "https://images.unsplash.com/photo-1628130235364-9e412ffaae5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZ2FkZ2V0fGVufDF8fHx8MTc2NjczMDQ5OHww&ixlib=rb-4.1.0&q=80&w=1080",
    views: "2.4M",
    engagement: "12.1%",
    trending: true,
  },
  {
    id: "3",
    title: "프리미엄 커피 원두",
    brand: "스타벅스",
    category: "식품",
    adType: "네이티브",
    imageUrl: "https://images.unsplash.com/photo-1581006855389-c17d881f3baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwYmV2ZXJhZ2V8ZW58MXx8fHwxNzY2NzI4MTk3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    views: "890K",
    engagement: "6.8%",
  },
  {
    id: "4",
    title: "리프팅 세럼 런칭",
    brand: "설화수",
    category: "뷰티",
    adType: "배너",
    imageUrl: "https://images.unsplash.com/photo-1590156221187-1710315f710b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3N8ZW58MXx8fHwxNzY2NjY1ODk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    views: "1.5M",
    engagement: "9.2%",
    trending: true,
  },
  {
    id: "5",
    title: "제주도 여행 패키지",
    brand: "여행박사",
    category: "여행",
    adType: "동영상",
    imageUrl: "https://images.unsplash.com/photo-1614088459293-5669fadc3448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbnxlbnwxfHx8fDE3NjY2NDc3ODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    views: "720K",
    engagement: "7.3%",
  },
  {
    id: "6",
    title: "카드 혜택 프로모션",
    brand: "KB국민카드",
    category: "금융",
    adType: "네이티브",
    imageUrl: "https://images.unsplash.com/photo-1643391448659-8e58f99958b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwYmFua2luZ3xlbnwxfHx8fDE3NjY3MTMxNjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    views: "650K",
    engagement: "5.9%",
  },
  {
    id: "7",
    title: "신작 게임 출시",
    brand: "넥슨",
    category: "게임",
    adType: "동영상",
    imageUrl: "https://images.unsplash.com/photo-1604846887565-640d2f52d564?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb25zb2xlfGVufDF8fHx8MTc2NjY1NjA4OXww&ixlib=rb-4.1.0&q=80&w=1080",
    views: "1.8M",
    engagement: "11.5%",
    trending: true,
  },
  {
    id: "8",
    title: "홈 인테리어 세일",
    brand: "이케아",
    category: "라이프스타일",
    adType: "배너",
    imageUrl: "https://images.unsplash.com/photo-1637747020120-74c5d5cbb4c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBob21lfGVufDF8fHx8MTc2NjczMDQ5OXww&ixlib=rb-4.1.0&q=80&w=1080",
    views: "540K",
    engagement: "6.2%",
  },
  // 추가 트렌드 광고들
  {
    id: "9",
    title: "프리미엄 스니커즈",
    brand: "나이키",
    category: "패션",
    adType: "동영상",
    imageUrl: "https://images.unsplash.com/photo-1656944227480-98180d2a5155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2VycyUyMHNob2VzfGVufDF8fHx8MTc2NjYxMTQwOXww&ixlib=rb-4.1.0&q=80&w=1080",
    views: "1.1M",
    engagement: "9.8%",
    trending: true,
  },
  {
    id: "10",
    title: "럭셔리 핸드백",
    brand: "구찌",
    category: "패션",
    adType: "배너",
    imageUrl: "https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9ufGVufDF8fHx8MTc2NjcxODIwNXww&ixlib=rb-4.1.0&q=80&w=1080",
    views: "980K",
    engagement: "7.5%",
  },
  {
    id: "11",
    title: "최신 노트북 출시",
    brand: "애플",
    category: "테크",
    adType: "배너",
    imageUrl: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjY3MjY1NTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    views: "2.1M",
    engagement: "10.3%",
  },
  {
    id: "12",
    title: "5G 스마트폰",
    brand: "LG전자",
    category: "테크",
    adType: "동영상",
    imageUrl: "https://images.unsplash.com/photo-1557817683-5cfe3620b05c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjY2NDU5MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    views: "1.7M",
    engagement: "8.9%",
    trending: true,
  },
  {
    id: "13",
    title: "프리미엄 원두 커피",
    brand: "블루보틀",
    category: "식품",
    adType: "배너",
    imageUrl: "https://images.unsplash.com/photo-1614639938587-ec36a68ac904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY29mZmVlfGVufDF8fHx8MTc2NjczMjU4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    views: "750K",
    engagement: "6.5%",
  },
  {
    id: "14",
    title: "레스토랑 프로모션",
    brand: "아웃백",
    category: "식품",
    adType: "네이티브",
    imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NjY2OTM3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    views: "620K",
    engagement: "5.8%",
  },
  {
    id: "15",
    title: "스킨케어 신제품",
    brand: "라네즈",
    category: "뷰티",
    adType: "동영상",
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHByb2R1Y3R8ZW58MXx8fHwxNzY2NzI1OTIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    views: "1.3M",
    engagement: "8.7%",
  },
  {
    id: "16",
    title: "메이크업 컬렉션",
    brand: "맥",
    category: "뷰티",
    adType: "배너",
    imageUrl: "https://images.unsplash.com/photo-1718972771654-47be8f36e0fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBiZWF1dHl8ZW58MXx8fHwxNzY2NjI3ODE1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    views: "1.1M",
    engagement: "7.9%",
    trending: true,
  },
];

const categories = ["전체", "패션", "테크", "식품", "뷰티", "여행", "금융", "게임", "라이프스타일"];
const adTypes = ["전체", "배너", "동영상", "네이티브", "인터스티셜"];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedAdType, setSelectedAdType] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAd, setSelectedAd] = useState<typeof mockAds[0] | null>(null);

  // Filter ads based on category, ad type, and search
  const filteredAds = mockAds.filter((ad) => {
    const matchesCategory = selectedCategory === "전체" || ad.category === selectedCategory;
    const matchesAdType = selectedAdType === "전체" || ad.adType === selectedAdType;
    const matchesSearch = 
      searchQuery === "" ||
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesAdType && matchesSearch;
  });

  // 카테고리별 트렌드 광고 준비
  const trendAds = {
    "패션": mockAds.filter(ad => ad.category === "패션").slice(0, 3),
    "테크": mockAds.filter(ad => ad.category === "테크").slice(0, 3),
    "뷰티": mockAds.filter(ad => ad.category === "뷰티").slice(0, 3),
    "식품": mockAds.filter(ad => ad.category === "식품").slice(0, 3),
  };

  const handleAdClick = (id: string) => {
    const ad = mockAds.find(a => a.id === id);
    if (ad) setSelectedAd(ad);
  };

  // 카테고리별 광고 개수
  const getCategoryCount = (category: string) => {
    if (category === "전체") return mockAds.length;
    return mockAds.filter(ad => ad.category === category).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl">애드 트렌드</h1>
                <p className="text-sm text-gray-600">광고 트렌드를 한눈에 확인하세요</p>
              </div>
            </motion.div>
          </div>
          
          {/* Search */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="브랜드 또는 광고명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trend Section */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <TrendSection trendAds={trendAds} onAdClick={handleAdClick} />
        </motion.div>

        {/* Tabs for Ad Types */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Tabs value={selectedAdType} onValueChange={setSelectedAdType} className="mb-8">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
              {adTypes.map((type) => (
                <TabsTrigger key={type} value={type} className="whitespace-nowrap">
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-sm text-gray-600 mb-3">카테고리</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.div
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                  <span className="ml-1.5 text-xs opacity-70">
                    {getCategoryCount(category)}
                  </span>
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={filteredAds.length}
        >
          <p className="text-sm text-gray-600">
            총 <span className="font-medium text-gray-900">{filteredAds.length}개</span>의 광고
          </p>
        </motion.div>

        {/* Ad Gallery */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${selectedCategory}-${selectedAdType}-${searchQuery}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <AdCard {...ad} onClick={() => handleAdClick(ad.id)} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredAds.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="mb-2">검색 결과가 없습니다</h3>
            <p className="text-sm text-gray-600">다른 검색어나 필터를 시도해보세요</p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>광고 데이터는 매일 업데이트됩니다 • 2024 애드 트렌드</p>
          </div>
        </div>
      </footer>

      {/* Ad Detail Modal */}
      <AdDetailModal
        ad={selectedAd}
        open={!!selectedAd}
        onClose={() => setSelectedAd(null)}
      />
    </div>
  );
}
