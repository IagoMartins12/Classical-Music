import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
const FormField = ({
  label,
  children,
  icon: Icon,
  description,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ComponentType<any>;
  description?: string;
}) => (
  <div className="space-y-2">
    <Inline
      as="label"
      gap={2}
      className="text-sm font-medium text-theme-secondary"
    >
      {Icon && <Icon className="w-4 h-4 text-theme-tertiary" />}
      <span>{label}</span>
    </Inline>
    {children}
    {description && (
      <Text papel="legenda" tom="fraco" as="p">
        {description}
      </Text>
    )}
  </div>
);

export default FormField;
