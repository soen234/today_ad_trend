import { Card } from "./ui/card";
import { TrendingUp, Eye, Zap } from "lucide-react";
import { CategoryTrendCarousel } from "./CategoryTrendCarousel";

interface TrendData {
  category: string;
  growth: string;
  count: number;
  color: string;
  bgColor: string;
}

interface TrendAd {
  id: string;
  title: string;
  brand: string;
  imageUrl: string;
  engagement: string;
}

interface TrendSectionProps {
  trendAds: { [key: string]: TrendAd[] };
  onAdClick: (id: string) => void;
}

const trendData: TrendData[] = [
  { category: "패션", growth: "+32%", count: 156, color: "bg-purple-500", bgColor: "bg-gradient-to-br from-purple-500 to-purple-600" },
  { category: "테크", growth: "+28%", count: 142, color: "bg-blue-500", bgColor: "bg-gradient-to-br from-blue-500 to-blue-600" },
  { category: "뷰티", growth: "+25%", count: 128, color: "bg-pink-500", bgColor: "bg-gradient-to-br from-pink-500 to-pink-600" },
  { category: "식품", growth: "+18%", count: 98, color: "bg-green-500", bgColor: "bg-gradient-to-br from-green-500 to-green-600" },
];

export function TrendSection({ trendAds, onAdClick }: TrendSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          이번 주 트렌드
        </h2>
        <p className="text-sm text-gray-600">
          가장 많은 주목을 받고 있는 광고 카테고리를 확인하세요
        </p>
      </div>

      {/* Category Trend Carousels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trendData.map((trend, index) => (
          <CategoryTrendCarousel
            key={trend.category}
            category={trend.category}
            ads={trendAds[trend.category] || []}
            color={trend.bgColor}
            onAdClick={onAdClick}
          />
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="mb-2">주간 하이라이트</h3>
            <p className="text-sm text-gray-700 mb-3">
              이번 주 가장 높은 조회수를 기록한 광고는 <strong>테크 카테고리</strong>의 새로운 스마트폰 광고입니다. 
              동영상 형식의 광고가 전주 대비 <strong>45% 증가</strong>한 참여율을 보이고 있습니다.
            </p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-600">총 조회수: </span>
                <span className="font-medium">2.4M</span>
              </div>
              <div>
                <span className="text-gray-600">평균 참여율: </span>
                <span className="font-medium">8.5%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}