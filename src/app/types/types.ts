import { composerHomeProps } from '../components/PopularComposers';

export interface RandomWorkOptions {
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

export interface Composers {
  birth: string;
  complete_name: string;
  death: string;
  epoch: string;
  id: string;
  name: string;
  portrait: string;
}

export interface CarouselItem {
  id: number;
  name: string;
  image: string;
}

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

export interface CarouselCardProps {
  item: composerHomeProps;
  isActive: boolean;
  isMobile: boolean;
}

export interface CarouselControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isAnimating: boolean;
}

export interface CarouselIndicatorsProps {
  totalSlides: number;
  currentIndex: number;
  onGoToSlide: (index: number) => void;
  isAnimating: boolean;
}

export interface CarouselContainerProps {
  children: React.ReactNode;
  currentIndex: number;
  itemsPerView: number;
  onDrag: (deltaX: number) => void;
  isAnimating: boolean;
}

export interface ModernCarouselProps {
  items: composerHomeProps[];
  itemsPerView?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}
