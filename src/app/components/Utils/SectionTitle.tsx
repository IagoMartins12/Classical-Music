interface SectionTitleProps {
  title: string;
}
const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return <h1>{title}</h1>;
};

export default SectionTitle;
