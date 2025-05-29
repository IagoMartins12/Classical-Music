interface SectionTitleProps {
  title: string;
}
const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return <h1 className="text-2xl font-bold text-shadow-yellow-400">{title}</h1>;
};

export default SectionTitle;
