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
    <label className="flex items-center space-x-2 text-sm font-medium text-theme-secondary">
      {Icon && <Icon className="w-4 h-4 text-theme-tertiary" />}
      <span>{label}</span>
    </label>
    {children}
    {description && (
      <p className="text-xs text-theme-tertiary">{description}</p>
    )}
  </div>
);

export default FormField;
