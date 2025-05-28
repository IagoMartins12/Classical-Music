import LazyImage from '../../LazyImage';

const CarouselCard: React.FC<CarouselCardProps> = ({ item, isActive }) => {
  return (
    <div className="group cursor-pointer select-none">
      <div
        className={`relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-500 ${
          isActive
            ? 'group-hover:shadow-2xl group-hover:-translate-y-3 group-hover:scale-105'
            : 'opacity-70 scale-95'
        }`}
      >
        <div className="aspect-square relative">
          <LazyImage
            src={item.portrait}
            alt={item.name}
            className="w-full h-full rounded-t-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-gray-800 text-center group-hover:text-blue-600 transition-colors duration-300 text-lg">
            {item.name}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;
