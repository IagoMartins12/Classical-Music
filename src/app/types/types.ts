interface RandomWorkOptions {
  popularwork?: number;
  recommendedwork?: number;
  popularcomposer?: number;
  recommendedcomposer?: number;
  genre?: string;
  epoch?: string;
  composer?: string; // IDs separados por vírgula
  composer_not?: string;
  work?: string;
}

interface Composers {
  birth: string;
  complete_name: string;
  death: string;
  epoch: string;
  id: string;
  name: string;
  portrait: string;
}

interface CarouselItem {
  id: number;
  name: string;
  image: string;
}

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

interface CarouselCardProps {
  item: Composers;
  isActive: boolean;
}

interface CarouselControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isAnimating: boolean;
}

interface CarouselIndicatorsProps {
  totalSlides: number;
  currentIndex: number;
  onGoToSlide: (index: number) => void;
  isAnimating: boolean;
}

interface CarouselContainerProps {
  children: React.ReactNode;
  currentIndex: number;
  itemsPerView: number;
  onDrag: (deltaX: number) => void;
  isAnimating: boolean;
}

interface ModernCarouselProps {
  items: Composers[];
  itemsPerView?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}
