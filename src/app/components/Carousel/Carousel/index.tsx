// app/components/Carousel/Carousel.tsx - Updated with theme system
import { useCallback, useEffect, useState } from 'react';
import CarouselControls from '../CarouselControls';
import CarouselContainer from '../CarouselContainer';
import CarouselCard from '../CarouselCard';
import useIsMobile from '@/app/hooks/useIsMobile';
import { ModernCarouselProps } from '@/app/types/types';
import useIsTablet from '@/app/hooks/useIsTablet';

const Carousel: React.FC<ModernCarouselProps> = ({
  items,
  itemsPerView = 4,
  autoPlay = false,
  autoPlayInterval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Ajustar itemsPerView baseado no dispositivo
  const responsiveItemsPerView = isMobile ? 1 : isTablet ? 2 : itemsPerView;
  const maxIndex = Math.max(0, items.length - responsiveItemsPerView);

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

  // const goToSlide = useCallback(
  //   (index: number) => {
  //     if (isAnimating) return;
  //     setIsAnimating(true);
  //     setCurrentIndex(Math.min(maxIndex, index));
  //     setTimeout(() => setIsAnimating(false), 500);
  //   },
  //   [isAnimating, maxIndex]
  // );

  // Drag handler otimizado para mobile/desktop
  const handleDrag = useCallback(
    (deltaX: number) => {
      if (isMobile) {
        // Mobile: sempre move apenas 1 item
        if (deltaX > 0 && currentIndex < maxIndex) {
          handleNext();
        } else if (deltaX < 0 && currentIndex > 0) {
          handlePrevious();
        }
      } else {
        // Desktop: comportamento original (pode mover vários)
        if (deltaX > 0 && currentIndex < maxIndex) {
          handleNext();
        } else if (deltaX < 0 && currentIndex > 0) {
          handlePrevious();
        }
      }
    },
    [currentIndex, maxIndex, handleNext, handlePrevious, isMobile]
  );

  return (
    <div className="w-full mx-auto sm:py-6">
      <div className="relative">
        {/* Container principal com tema */}
        <div className="relative overflow-hidden rounded-3xl py-8 px-2">
          {/* Background gradient usando tema */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-theme-elevated/30 to-transparent rounded-3xl"></div>

          <div className="relative">
            {/* Controles de navegação - escondidos no mobile */}
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
              itemsPerView={responsiveItemsPerView}
              onDrag={handleDrag}
              isAnimating={isAnimating}
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex-shrink-0 transition-all duration-500 ${
                    isMobile
                      ? 'px-4' // Mobile: padding uniforme
                      : index !== 0
                      ? 'px-3'
                      : 'pr-3 pl-6' // Desktop: comportamento original com padding do tema
                  }`}
                  style={{
                    width: isMobile
                      ? '100%' // Mobile: 100% da largura
                      : `${100 / responsiveItemsPerView}%`, // Desktop: dividido pelos itens
                  }}
                >
                  <CarouselCard
                    item={item}
                    isActive={
                      index >= currentIndex &&
                      index < currentIndex + responsiveItemsPerView
                    }
                  />
                </div>
              ))}
            </CarouselContainer>
          </div>
        </div>

        {/* Progress indicator - usando tema */}
        {/* {!isMobile && items.length > itemsPerView && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2 bg-theme-elevated/80 backdrop-blur-md border border-theme-primary rounded-full px-4 py-2 shadow-theme-sm">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-theme-secondary">
                {currentIndex + 1} -{' '}
                {Math.min(currentIndex + responsiveItemsPerView, items.length)}{' '}
                de {items.length}
              </span>
            </div>
          </div>
        )} */}

        {/* Mobile counter - mais simples */}
        {/* {isMobile && items.length > 1 && (
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              {Array.from({ length: items.length }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-brand-primary w-6'
                      : 'bg-theme-tertiary/50 hover:bg-theme-secondary'
                  }`}
                />
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Carousel;
