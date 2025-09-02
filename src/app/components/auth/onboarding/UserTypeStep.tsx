// components/onboarding/UserTypeStep.tsx
'use client';

import { useOnboardingModal } from '@/app/stores/authStore';
import React from 'react';
import {
  GiGraduateCap,
  GiMusicalScore,
  GiTeacher,
  GiMicrophone,
} from 'react-icons/gi';
import { useTranslation } from '@/app/context/TranslationContext';

const UserTypeStep: React.FC = () => {
  const { data, updateData } = useOnboardingModal();
  const { t } = useTranslation({ sections: ['components/onboarding'] });

  const USER_TYPES = [
    {
      value: 'MUSIC_STUDENT',
      label: t('user_type_music_student'),
      description: t('user_type_music_student_desc'),
      icon: GiGraduateCap,
      color: 'bg-accent-blue',
    },
    {
      value: 'CASUAL_USER',
      label: t('user_type_casual_user'),
      description: t('user_type_casual_user_desc'),
      icon: GiMusicalScore,
      color: 'bg-accent-green',
    },
    {
      value: 'PROFESSIONAL',
      label: t('user_type_professional'),
      description: t('user_type_professional_desc'),
      icon: GiMicrophone,
      color: 'bg-accent-purple',
    },
    {
      value: 'TEACHER',
      label: t('user_type_teacher'),
      description: t('user_type_teacher_desc'),
      icon: GiTeacher,
      color: 'bg-accent-amber',
    },
  ] as const;

  const handleSelect = (userType: (typeof USER_TYPES)[number]['value']) => {
    updateData({ userType });
  };

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-theme-primary classical-title mb-3">
          {t('user_type_step_title')}
        </h3>
        <p className="text-theme-secondary max-w-lg mx-auto">
          {t('user_type_step_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {USER_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = data.userType === type.value;

          return (
            <button
              key={type.value}
              onClick={() => handleSelect(type.value)}
              className={`
                classical-card p-6 text-left transition-all duration-300
                hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-primary
                ${isSelected ? 'border-brand-primary shadow-theme-glow' : ''}
              `}
            >
              <div className="flex items-start space-x-4 relative">
                <div
                  className={`
                  w-12 h-12 ${type.color} bg-opacity-20 rounded-full 
                  flex items-center justify-center flex-shrink-0
                `}
                >
                  <Icon
                    className={`w-6 h-6 ${type.color.replace('bg-', 'text-')}`}
                  />
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-theme-primary mb-2">
                    {type.label}
                  </h4>
                  <p className="text-sm text-theme-secondary leading-relaxed">
                    {type.description}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute right-0 ">
                    <svg
                      className="w-4 h-4 text-theme-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-theme-tertiary">
          {t('user_type_step_footer')}
        </p>
      </div>
    </div>
  );
};

export default UserTypeStep;
