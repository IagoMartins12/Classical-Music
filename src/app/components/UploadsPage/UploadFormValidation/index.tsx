// app/components/uploads/UploadFormValidation.tsx
'use client';

import { ValidationResult } from '@/app/utils/uploadValidation';
import {
  PiCheckCircle,
  PiInfo,
  PiWarning,
  PiWarningCircle,
} from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface UploadFormValidationProps {
  validation: ValidationResult;
  dataQuality: number;
  className?: string;
}

const UploadFormValidation = ({
  validation,
  dataQuality,
  className = '',
}: UploadFormValidationProps) => {
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-accent-green';
    if (score >= 60) return 'text-accent-amber';
    return 'text-accent-red';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Alta';
    if (score >= 60) return 'Média';
    return 'Baixa';
  };

  if (!validation.errors.length && !validation.warnings.length) {
    return (
      <div
        className={`bg-accent-green/10 border border-accent-green/20 rounded-lg p-4 ${className}`}
      >
        <Inline gap={2}>
          <PiCheckCircle className="w-5 h-5 text-accent-green" />
          <span className="text-sm font-medium text-accent-green">
            Validação bem-sucedida
          </span>
        </Inline>
        <div className="mt-2 flex items-center justify-between">
          <Text papel="rotulo" tom="suave">
            Qualidade dos dados:{' '}
            <span className={`font-medium ${getQualityColor(dataQuality)}`}>
              {getQualityLabel(dataQuality)} ({dataQuality}%)
            </span>
          </Text>
          <div className="w-24 h-2 bg-theme-secondary rounded-full">
            <div
              className="h-2 bg-gradient-to-r from-accent-red via-accent-amber to-accent-green rounded-full transition-all duration-500"
              style={{ width: `${dataQuality}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4">
          <Inline gap={2} className="mb-2">
            <PiWarningCircle className="w-5 h-5 text-accent-red" />
            <span className="text-sm font-medium text-accent-red">
              Erros encontrados ({validation.errors.length})
            </span>
          </Inline>
          <ul className="space-y-1">
            {validation.errors.map((error, index) => (
              <li
                key={index}
                className="text-sm text-accent-red flex items-start space-x-2"
              >
                <span className="text-xs mt-1">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-lg p-4">
          <Inline gap={2} className="mb-2">
            <PiWarning className="w-5 h-5 text-accent-amber" />
            <span className="text-sm font-medium text-accent-amber">
              Avisos ({validation.warnings.length})
            </span>
          </Inline>
          <ul className="space-y-1">
            {validation.warnings.map((warning, index) => (
              <li
                key={index}
                className="text-sm text-accent-amber flex items-start space-x-2"
              >
                <span className="text-xs mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Quality */}
      <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4">
        <Inline gap={2} className="mb-2">
          <PiInfo className="w-5 h-5 text-accent-blue" />
          <span className="text-sm font-medium text-accent-blue">
            Qualidade dos dados
          </span>
        </Inline>
        <div className="flex items-center justify-between">
          <Text papel="rotulo" tom="suave">
            Pontuação:{' '}
            <span className={`font-medium ${getQualityColor(dataQuality)}`}>
              {getQualityLabel(dataQuality)} ({dataQuality}%)
            </span>
          </Text>
          <div className="w-32 h-2 bg-theme-secondary rounded-full">
            <div
              className="h-2 bg-gradient-to-r from-accent-red via-accent-amber to-accent-green rounded-full transition-all duration-500"
              style={{ width: `${dataQuality}%` }}
            />
          </div>
        </div>
        <Text papel="legenda" tom="fraco" as="p" className="mt-2">
          Dados mais completos melhoram a experiência dos usuários e a
          descoberta de conteúdo.
        </Text>
      </div>
    </div>
  );
};

export default UploadFormValidation;
