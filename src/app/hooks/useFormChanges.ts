// hooks/useFormChanges.ts
'use client';

import { useMemo } from 'react';

/**
 * 🎯 PARA MODAIS DE CRIAÇÃO - Detecta se campos não estão vazios
 */
export const useFormChanges = (formData: any, excludeFields: string[] = []) => {
  return useMemo(() => {
    return Object.entries(formData).some(([key, value]) => {
      if (excludeFields.includes(key)) return false;

      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'boolean') return value !== false;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
  }, [formData, excludeFields]);
};

/**
 * 🎯 PARA MODAIS DE EDIÇÃO - Compara com dados originais
 */
export const useFormChangesFromOriginal = (
  formData: any,
  originalData: any,
  excludeFields: string[] = []
) => {
  return useMemo(() => {
    if (!originalData) return false;

    return Object.entries(formData).some(([key, value]) => {
      if (excludeFields.includes(key)) return false;

      const originalValue = originalData[key];

      // Comparação específica por tipo
      if (Array.isArray(value) && Array.isArray(originalValue)) {
        return JSON.stringify(value) !== JSON.stringify(originalValue);
      }

      if (typeof value === 'string' && typeof originalValue === 'string') {
        return value.trim() !== originalValue.trim();
      }

      return value !== originalValue;
    });
  }, [formData, originalData, excludeFields]);
};

/**
 * 🎯 HOOK INTELIGENTE - Detecta automaticamente se é criação ou edição
 */
export const useSmartFormChanges = (
  formData: any,
  originalData?: any, // Se fornecido = modo edição
  excludeFields: string[] = []
) => {
  return useMemo(() => {
    // Se tem dados originais = modo edição
    if (originalData) {
      return Object.entries(formData).some(([key, value]) => {
        if (excludeFields.includes(key)) return false;

        const originalValue = originalData[key];

        if (value === originalValue) false;

        if (Array.isArray(value) && Array.isArray(originalValue)) {
          return JSON.stringify(value) !== JSON.stringify(originalValue);
        }

        if (typeof value === 'string' && typeof originalValue === 'string') {
          return value.trim() !== originalValue.trim();
        }

        return value !== originalValue;
      });
    }

    // Se não tem dados originais = modo criação
    return Object.entries(formData).some(([key, value]) => {
      if (excludeFields.includes(key)) return false;

      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'boolean') return value !== false;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
  }, [formData, originalData, excludeFields]);
};

/**
 * 🎯 DETECTA MUDANÇAS APENAS EM CAMPOS ESPECÍFICOS
 */
export const useFieldChanges = (formData: any, includeFields: string[]) => {
  return useMemo(() => {
    return includeFields.some((field) => {
      const value = formData[field];
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'boolean') return value !== false;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
  }, [formData, includeFields]);
};

/**
 * 🎯 DETECTA PROCESSOS EM ANDAMENTO
 */
export const useProcessChanges = (...processes: boolean[]) => {
  return processes.some(Boolean);
};
