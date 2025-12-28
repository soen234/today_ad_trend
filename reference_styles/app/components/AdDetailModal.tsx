import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Eye, TrendingUp, Heart, Share2, ExternalLink, Calendar } from "lucide-react";
import { motion } from "motion/react";

interface AdDetailModalProps {
  ad: {
    id: string;
    title: string;
    brand: string;
    category: string;
    adType: string;
    imageUrl: string;
    views: string;
    engagement: string;
    trending?: boolean;
  } | null;
  open: boolean;
  onClose: () => void;
}

export function AdDetailModal({ ad, open, onClose }: AdDetailModalProps) {
  if (!ad) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {ad.title}
            {ad.trending && (
              <Badge className="bg-red-500 hover:bg-red-600 animate-pulse">
                트렌딩
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
          >
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">브랜드</p>
              <p className="font-medium">{ad.brand}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">카테고리</p>
              <p className="font-medium">{ad.category}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">광고 타입</p>
              <p className="font-medium">{ad.adType}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">게시일</p>
              <p className="font-medium">2024.12.20</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-blue-50 p-4 rounded-lg text-center"
            >
              <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl text-blue-600 mb-1">{ad.views}</p>
              <p className="text-xs text-gray-600">조회수</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-green-50 p-4 rounded-lg text-center"
            >
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl text-green-600 mb-1">{ad.engagement}</p>
              <p className="text-xs text-gray-600">참여율</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-purple-50 p-4 rounded-lg text-center"
            >
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl text-purple-600 mb-1">7일</p>
              <p className="text-xs text-gray-600">게시 기간</p>
            </motion.div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="mb-3">광고 설명</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {ad.brand}의 최신 {ad.category} 광고 캠페인입니다. 
              이번 캠페인은 타겟 고객층에게 높은 호응을 얻고 있으며, 
              특히 {ad.adType} 형식의 크리에이티브가 효과적으로 메시지를 전달하고 있습니다.
              지난 주 대비 참여율이 지속적으로 상승하고 있어 주목할 만한 광고 사례로 평가받고 있습니다.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1" variant="default">
              <Heart className="w-4 h-4 mr-2" />
              즐겨찾기
            </Button>
            <Button className="flex-1" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              공유하기
            </Button>
            <Button variant="outline" size="icon">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
