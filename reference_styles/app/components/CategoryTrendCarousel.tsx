import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";

interface TrendAd {
  id: string;
  title: string;
  brand: string;
  imageUrl: string;
  engagement: string;
}

interface CategoryTrendCarouselProps {
  category: string;
  ads: TrendAd[];
  color: string;
  onAdClick: (id: string) => void;
}

export function CategoryTrendCarousel({
  category,
  ads,
  color,
  onAdClick,
}: CategoryTrendCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const currentAd = ads[currentIndex];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className={`${color} p-4`}>
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="mb-1">{category}</h3>
            <p className="text-xs opacity-90">{ads.length}개의 인기 광고</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Carousel Content */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={currentAd.imageUrl}
            alt={currentAd.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => onAdClick(currentAd.id)}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Navigation Buttons */}
        {ads.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={prev}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={next}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="p-4"
      >
        <h4 className="mb-1 truncate">{currentAd.title}</h4>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">{currentAd.brand}</p>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{currentAd.engagement}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
