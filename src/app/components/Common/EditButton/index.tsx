// app/components/Common/EditButton.tsx
'use client';

import { FiEdit } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface EditButtonProps {
  entityType: 'composer' | 'work' | 'score' | 'article';
  entityId: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function EditButton({
  entityType,
  entityId,
  variant = 'ghost',
  size = 'md',
  className = '',
}: EditButtonProps) {
  const router = useRouter();

  const goToEditPage = () => {
    let url = `/uploads/${entityType}/${entityId}/edit`;

    if (entityType === 'article') {
      url = `/blog/admin/articles/${entityId}/edit`;
    }
    router.push(url);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botão principal */}
      <button
        onClick={goToEditPage}
        className={`
                    ${sizeClasses[size]}
                    ${
                      variant === 'minimal'
                        ? 'bg-transparent border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-theme-primary'
                        : 'bg-interactive-hover border border-theme-primary text-theme-primary hover:bg-brand-primary/20 hover:border-brand-primary hover:text-brand-primary'
                    }
                    rounded-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group
                  `}
        title="Editar"
      >
        <FiEdit
          className={`${iconSizes[size]} group-hover:rotate-12 transition-transform duration-300`}
        />
      </button>
    </div>
  );
}
