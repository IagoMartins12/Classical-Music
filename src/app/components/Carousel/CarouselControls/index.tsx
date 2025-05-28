import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

const CarouselControls: React.FC<CarouselControlsProps> = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isAnimating,
}) => {
  return (
    <>
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious || isAnimating}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl transform -translate-x-2 hover:translate-x-0"
      >
        <BiChevronLeft className="w-6 h-6 text-gray-700" />
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext || isAnimating}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl transform translate-x-2 hover:translate-x-0"
      >
        <BiChevronRight className="w-6 h-6 text-gray-700" />
      </button>
    </>
  );
};

export default CarouselControls;
