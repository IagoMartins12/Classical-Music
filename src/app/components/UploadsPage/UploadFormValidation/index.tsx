// app/components/uploads/UploadFormValidation.tsx
'use client';

import { ValidationResult } from '@/app/utils/uploadValidation';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
} from 'react-icons/fi';

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
        <div className="flex items-center space-x-2">
          <FiCheckCircle className="w-5 h-5 text-accent-green" />
          <span className="text-sm font-medium text-accent-green">
            Validação bem-sucedida
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-theme-secondary">
            Qualidade dos dados:{' '}
            <span className={`font-medium ${getQualityColor(dataQuality)}`}>
              {getQualityLabel(dataQuality)} ({dataQuality}%)
            </span>
          </span>
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
          <div className="flex items-center space-x-2 mb-2">
            <FiAlertCircle className="w-5 h-5 text-accent-red" />
            <span className="text-sm font-medium text-accent-red">
              Erros encontrados ({validation.errors.length})
            </span>
          </div>
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
          <div className="flex items-center space-x-2 mb-2">
            <FiAlertTriangle className="w-5 h-5 text-accent-amber" />
            <span className="text-sm font-medium text-accent-amber">
              Avisos ({validation.warnings.length})
            </span>
          </div>
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
        <div className="flex items-center space-x-2 mb-2">
          <FiInfo className="w-5 h-5 text-accent-blue" />
          <span className="text-sm font-medium text-accent-blue">
            Qualidade dos dados
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-theme-secondary">
            Pontuação:{' '}
            <span className={`font-medium ${getQualityColor(dataQuality)}`}>
              {getQualityLabel(dataQuality)} ({dataQuality}%)
            </span>
          </span>
          <div className="w-32 h-2 bg-theme-secondary rounded-full">
            <div
              className="h-2 bg-gradient-to-r from-accent-red via-accent-amber to-accent-green rounded-full transition-all duration-500"
              style={{ width: `${dataQuality}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-theme-tertiary mt-2">
          Dados mais completos melhoram a experiência dos usuários e a
          descoberta de conteúdo.
        </p>
      </div>
    </div>
  );
};

export default UploadFormValidation;
