import { CarouselIndicatorsProps } from '@/app/types/types';

const CarouselIndicators: React.FC<CarouselIndicatorsProps> = ({
  totalSlides,
  currentIndex,
  onGoToSlide,
  isAnimating,
}) => {
  return (
    <div className="flex justify-center mt-8 space-x-3">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => onGoToSlide(index)}
          disabled={isAnimating}
          className={`h-3 rounded-full transition-all duration-500 hover:scale-125 ${
            index === currentIndex
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 w-10 shadow-lg'
              : 'bg-gray-300 hover:bg-gray-400 w-3'
          }`}
        />
      ))}
    </div>
  );
};

export default CarouselIndicators;
