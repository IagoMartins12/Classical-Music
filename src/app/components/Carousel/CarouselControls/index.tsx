// app/components/Carousel/CarouselControls.tsx - Updated with theme system
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

interface CarouselControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isAnimating: boolean;
}

const CarouselControls: React.FC<CarouselControlsProps> = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isAnimating,
}) => {
  return (
    <>
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious || isAnimating}
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 z-20 
          w-12 h-12 
          bg-theme-elevated/95 backdrop-blur-md
          border border-theme-primary
          hover:border-brand-primary hover:bg-interactive-hover
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-theme-primary disabled:hover:bg-theme-elevated
          rounded-full 
          shadow-theme-md hover:shadow-theme-glow
          transition-all duration-300 
          hover:scale-110 hover:-translate-x-1
          transform -translate-x-3
          group
        `}
        aria-label="Compositor anterior"
      >
        <BiChevronLeft className="w-6 h-6 text-theme-primary group-hover:text-brand-primary transition-colors mx-auto" />

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext || isAnimating}
        className={`
          absolute right-0 top-1/2 -translate-y-1/2 z-20 
          w-12 h-12 
          bg-theme-elevated/95 backdrop-blur-md
          border border-theme-primary
          hover:border-brand-primary hover:bg-interactive-hover
          disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-theme-primary disabled:hover:bg-theme-elevated
          rounded-full 
          shadow-theme-md hover:shadow-theme-glow
          transition-all duration-300 
          hover:scale-110 hover:translate-x-1
          transform translate-x-3
          group
        `}
        aria-label="Próximo compositor"
      >
        <BiChevronRight className="w-6 h-6 text-theme-primary group-hover:text-brand-primary transition-colors mx-auto" />

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>
    </>
  );
};

export default CarouselControls;
