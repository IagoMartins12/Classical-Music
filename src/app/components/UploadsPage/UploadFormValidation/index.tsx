// app/components/uploads/UploadFormValidation.tsx
'use client';

import { ValidationResult } from '@/app/utils/uploadValidation';
import {
  PiCheckCircle,
  PiInfo,
  PiWarning,
  PiWarningCircle,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
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
    if (score >= 80) return 'text-ok';
    if (score >= 60) return 'text-atencao';
    return 'text-erro';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Alta';
    if (score >= 60) return 'Média';
    return 'Baixa';
  };

  if (!validation.errors.length && !validation.warnings.length) {
    return (
      <div
        className={`bg-ok/10 border border-ok/20 rounded-lg p-4 ${className}`}
      >
        <Inline gap={2}>
          <PiCheckCircle className="w-5 h-5 text-ok" />
          <span className="text-sm font-medium text-ok">
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
              className="h-2 bg-erro rounded-full transition-all duration-500"
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
        <Stack
          gap={2}
          className="bg-erro/10 border border-erro/20 rounded-lg p-4"
        >
          <Inline gap={2}>
            <PiWarningCircle className="w-5 h-5 text-erro" />
            <span className="text-sm font-medium text-erro">
              Erros encontrados ({validation.errors.length})
            </span>
          </Inline>
          <ul className="space-y-1">
            {validation.errors.map((error, index) => (
              <li
                key={index}
                className="text-sm text-erro flex items-start space-x-2"
              >
                <span className="text-xs mt-1">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </Stack>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Stack
          gap={2}
          className="bg-atencao/10 border border-atencao/20 rounded-lg p-4"
        >
          <Inline gap={2}>
            <PiWarning className="w-5 h-5 text-atencao" />
            <span className="text-sm font-medium text-atencao">
              Avisos ({validation.warnings.length})
            </span>
          </Inline>
          <ul className="space-y-1">
            {validation.warnings.map((warning, index) => (
              <li
                key={index}
                className="text-sm text-atencao flex items-start space-x-2"
              >
                <span className="text-xs mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </Stack>
      )}

      {/* Data Quality */}
      <div className="bg-aviso/10 border border-aviso/20 rounded-lg p-4">
        <Inline gap={2} className="mb-2">
          <PiInfo className="w-5 h-5 text-aviso" />
          <span className="text-sm font-medium text-aviso">
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
              className="h-2 bg-erro rounded-full transition-all duration-500"
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
