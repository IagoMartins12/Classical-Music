import { useCallback, useEffect, useState } from 'react';
import CarouselControls from '../CarouselControls';
import CarouselContainer from '../CarouselContainer';
import CarouselCard from '../CarouselCard';
import CarouselIndicators from '../CarouselIndicators';
import useIsMobile from '@/app/hooks/useIsMobile';

const Carousel: React.FC<ModernCarouselProps> = ({
  items,
  itemsPerView = 4,
  autoPlay = false,
  autoPlayInterval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useIsMobile();

  // Ajustar itemsPerView baseado no dispositivo
  const responsiveItemsPerView = isMobile ? 1 : itemsPerView;
  const maxIndex = Math.max(0, items.length - responsiveItemsPerView);

  console.log('ITEMS', items);
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
    <div className="w-full mx-auto py-4">
      <div className="relative">
        {/* Container principal com gradiente */}
        <div className="relative overflow-hidden rounded-3xl py-8">
          <div className="relative">
            {/* Controles de navegação - escondidos no mobile */}
            {!isMobile && (
              <CarouselControls
                onPrevious={handlePrevious}
                onNext={handleNext}
                canGoPrevious={currentIndex > 0}
                canGoNext={currentIndex < maxIndex}
                isAnimating={isAnimating}
              />
            )}

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
                      ? 'px-4'
                      : 'pr-4' // Desktop: comportamento original
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

        {/* Indicadores - diferentes para mobile e desktop */}
        {/* <CarouselIndicators
          totalSlides={maxIndex + 1}
          currentIndex={currentIndex}
          onGoToSlide={goToSlide}
          isAnimating={isAnimating}
        /> */}

        {/* Contador - apenas no desktop */}
        {/* {!isMobile && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {currentIndex + 1} -{' '}
                {Math.min(currentIndex + responsiveItemsPerView, items.length)}{' '}
                de {items.length}
              </span>
            </div>
          </div>
        )} */}

        {/* Contador mobile - mais simples */}
        {/* {isMobile && (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600 font-medium">
              {currentIndex + 1} de {items.length}
            </span>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Carousel;
