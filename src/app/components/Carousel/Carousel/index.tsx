import { useCallback, useEffect, useState } from 'react';
import CarouselControls from '../CarouselControls';
import CarouselContainer from '../CarouselContainer';
import CarouselCard from '../CarouselCard';
import CarouselIndicators from '../CarouselIndicators';

const Carousel: React.FC<ModernCarouselProps> = ({
  items,
  itemsPerView = 4,
  autoPlay = false,
  autoPlayInterval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const maxIndex = Math.max(0, items.length - itemsPerView);

  // Auto play
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      if (!isAnimating) {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, maxIndex, isAnimating]);

  const handlePrevious = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, maxIndex]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentIndex(Math.min(maxIndex, index));
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating, maxIndex]
  );

  const handleDrag = useCallback(
    (deltaX: number) => {
      if (deltaX > 0 && currentIndex < maxIndex) {
        handleNext();
      } else if (deltaX < 0 && currentIndex > 0) {
        handlePrevious();
      }
    },
    [currentIndex, maxIndex, handleNext, handlePrevious]
  );

  return (
    <div className="w-full mx-auto py-12">
      <div className="relative">
        {/* Container principal com gradiente */}
        <div className="relative overflow-hidden rounded-3xl py-8">
          <div className="relative">
            {/* Controles de navegação */}
            <CarouselControls
              onPrevious={handlePrevious}
              onNext={handleNext}
              canGoPrevious={currentIndex > 0}
              canGoNext={currentIndex < maxIndex}
              isAnimating={isAnimating}
            />

            {/* Container com drag */}
            <CarouselContainer
              currentIndex={currentIndex}
              itemsPerView={itemsPerView}
              onDrag={handleDrag}
              isAnimating={isAnimating}
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 px-4 transition-all duration-500"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <CarouselCard
                    item={item}
                    isActive={
                      index >= currentIndex &&
                      index < currentIndex + itemsPerView
                    }
                  />
                </div>
              ))}
            </CarouselContainer>
          </div>
        </div>

        {/* Indicadores */}
        <CarouselIndicators
          totalSlides={maxIndex + 1}
          currentIndex={currentIndex}
          onGoToSlide={goToSlide}
          isAnimating={isAnimating}
        />
      </div>
    </div>
  );
};

export default Carousel;
