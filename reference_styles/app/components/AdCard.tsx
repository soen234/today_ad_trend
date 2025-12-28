import { Badge } from "./ui/badge";
import { Eye, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface AdCardProps {
  id: string;
  title: string;
  brand: string;
  category: string;
  adType: string;
  imageUrl: string;
  views: string;
  engagement: string;
  trending?: boolean;
  onClick: () => void;
}

export function AdCard({
  title,
  brand,
  category,
  adType,
  imageUrl,
  views,
  engagement,
  trending,
  onClick,
}: AdCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <motion.img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        {trending && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1,
            }}
            className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs">트렌딩</span>
          </motion.div>
        )}
        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 hover:bg-white shadow-md">
          {adType}
        </Badge>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="text-white text-sm bg-black/70 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            자세히 보기
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="truncate mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{brand}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{views}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{engagement}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}