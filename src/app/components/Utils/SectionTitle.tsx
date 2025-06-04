import Link from 'next/link';

interface SectionTitleProps {
  title: string;
}
const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return (
    <div className="flex justify-between">
      <h1 className="text-2xl font-bold text-shadow-yellow-400">{title}</h1>
      <Link
        href={'/composers'}
        className="hover:text-blue-700 transition-colors text-blue-600 underline"
      >
        Ver todos compositores
      </Link>
    </div>
  );
};

export default SectionTitle;
