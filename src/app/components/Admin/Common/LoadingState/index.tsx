import { LoadingSpinner } from '@/app/components/animation/AnimatedComponents';
import { Card } from '@/app/components/ui/Card';

interface LoadingProps {
  loadingName: string;
}
const LoadingAdminState: React.FC<LoadingProps> = ({ loadingName }) => {
  return (
    <div className="fixed inset-0 bg-theme-overlay backdrop-blur-sm flex items-center justify-center z-50">
      <Card
        densidade="larga"
        className="flex items-center justify-center flex-col text-center"
      >
        <LoadingSpinner size="lg" />
        <p className="text-theme-primary font-medium mt-4">
          Carregando {loadingName}...
        </p>
      </Card>
    </div>
  );
};

export default LoadingAdminState;
