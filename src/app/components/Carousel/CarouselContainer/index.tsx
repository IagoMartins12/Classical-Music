// app/components/Carousel/CarouselContainer.tsx - Updated with theme system
import { useCallback, useRef, useState } from 'react';

interface CarouselContainerProps {
  children: React.ReactNode;
  currentIndex: number;
  itemsPerView: number;
  onDrag: (deltaX: number) => void;
  isAnimating: boolean;
}

const CarouselContainer: React.FC<CarouselContainerProps> = ({
  children,
  currentIndex,
  itemsPerView,
  onDrag,
  isAnimating,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isAnimating) return;
      setIsDragging(true);
      setStartX(e.pageX);
      setCurrentX(e.pageX);
      setStartTime(Date.now());
      setDragOffset(0);
      e.preventDefault();
    },
    [isAnimating]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const x = e.pageX;
      const deltaX = startX - x;
      setCurrentX(x);
      setDragOffset(deltaX);
    },
    [isDragging, startX]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    const endTime = Date.now();
    const timeDiff = endTime - startTime;
    const distance = Math.abs(dragOffset);
    const velocity = distance / timeDiff; // pixels por ms

    const slideWidth = containerRef.current
      ? containerRef.current.offsetWidth / itemsPerView
      : 0;

    // Calcular slides a mover baseado na velocidade
    let slidesToMove = Math.round(velocity * 5); // Ajuste o multiplicador conforme necessário

    // Garantir que pelo menos um slide seja movido se a distância for significativa
    if (slidesToMove === 0 && distance > slideWidth * 0.3) {
      slidesToMove = 1;
    }

    // Limitar o número máximo de slides a mover
    slidesToMove = Math.min(slidesToMove, 3);

    if (slidesToMove > 0) {
      onDrag(dragOffset > 0 ? slidesToMove : -slidesToMove);
    }

    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, dragOffset, startTime, itemsPerView, onDrag]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleMouseUp();
    }
  }, [isDragging, handleMouseUp]);

  // Touch Events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isAnimating) return;
      const touch = e.touches[0];
      setIsDragging(true);
      setStartX(touch.pageX);
      setCurrentX(touch.pageX);
      setStartTime(Date.now());
      setDragOffset(0);
    },
    [isAnimating]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      const touch = e.touches[0];
      const x = touch.pageX;
      const deltaX = startX - x;
      setCurrentX(x);
      setDragOffset(deltaX);
    },
    [isDragging, startX]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    const endTime = Date.now();
    const timeDiff = endTime - startTime;
    const distance = Math.abs(dragOffset);
    const velocity = distance / timeDiff;

    const slideWidth = containerRef.current
      ? containerRef.current.offsetWidth / itemsPerView
      : 0;
    let slidesToMove = Math.round(Math.abs(dragOffset) / (slideWidth * 0.25)); // 25% para touch (mais sensível)

    // Touch tem velocidade diferente
    if (velocity > 0.3) {
      slidesToMove = Math.max(slidesToMove, Math.ceil(velocity * 3));
    }

    slidesToMove = Math.min(slidesToMove, 4); // Touch pode mover até 4 slides

    if (slidesToMove > 0) {
      onDrag(dragOffset > 0 ? slidesToMove : -slidesToMove);
    }

    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, dragOffset, startTime, itemsPerView, onDrag]);

  // Calcular transform com drag offset em tempo real
  const getTransform = () => {
    const baseTransform = -currentIndex * (100 / itemsPerView);
    if (isDragging && containerRef.current) {
      const slideWidth = containerRef.current.offsetWidth / itemsPerView;
      const dragPercent = (dragOffset / slideWidth) * (100 / itemsPerView);
      return baseTransform - dragPercent;
    }
    return baseTransform;
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`flex transition-transform ease-out select-none ${
          isDragging
            ? 'cursor-grabbing duration-75'
            : 'cursor-grab duration-500'
        }`}
        style={{
          transform: `translateX(${getTransform()}%)`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Indicador visual de drag - AGORA COM TEMA */}
      {isDragging && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-theme-elevated/90 backdrop-blur-md border border-theme-primary text-theme-primary px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-3 shadow-theme-glow">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
            <span>
              {Math.abs(dragOffset) > 50
                ? `Solte para mover ${Math.min(
                    Math.ceil(Math.abs(dragOffset) / 100),
                    3
                  )} slide(s)`
                : 'Arraste para navegar'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselContainer;
