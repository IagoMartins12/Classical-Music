// app/libs/database/prismaSchemaExtractor.ts
import { Prisma } from '@prisma/client';
import { getModelSecurityConfig } from './databaseConfig';

/**
 * Extrai informações completas de um modelo do Prisma
 * Retorna TODOS os campos, tipos, enums, relações, etc.
 */

export interface PrismaFieldInfo {
  name: string;
  type: string;
  kind: 'scalar' | 'object' | 'enum' | 'unsupported';
  isList: boolean;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  isReadOnly: boolean;
  hasDefaultValue: boolean;
  default?: any;
  isGenerated: boolean;
  isUpdatedAt: boolean;
  relationName?: string;
  relationFromFields?: string[];
  relationToFields?: string[];
  relationOnDelete?: string;
  relationOnUpdate?: string;
  documentation?: string;

  // 🆕 CAMPOS DE SEGURANÇA
  isSensitive?: boolean;
  isEditableByConfig?: boolean;
  requiresConfirmation?: boolean;
}

export interface PrismaModelInfo {
  name: string;
  dbName?: string;
  fields: PrismaFieldInfo[];
  primaryKey?: string | string[];
  uniqueFields: string[][];
  uniqueIndexes: string[][];
  isGenerated: boolean;
  documentation?: string;
}

/**
 * Extrai todos os modelos e seus campos do Prisma
 */
export function extractPrismaModels(): PrismaModelInfo[] {
  const models: PrismaModelInfo[] = [];

  const dmmf = Prisma.dmmf;

  if (!dmmf || !dmmf.datamodel) {
    console.error('DMMF não disponível');
    return [];
  }

  for (const model of dmmf.datamodel.models) {
    const securityConfig = getModelSecurityConfig(model.name);

    // Converter arrays readonly para arrays mutáveis
    const primaryKey = model.primaryKey?.fields
      ? Array.isArray(model.primaryKey.fields)
        ? [...model.primaryKey.fields]
        : [model.primaryKey.fields]
      : undefined;

    const uniqueFields = model.uniqueFields
      ? model.uniqueFields.map((field) => [...field] as string[])
      : [];

    const uniqueIndexes = model.uniqueIndexes
      ? model.uniqueIndexes.map((idx) => [...idx.fields] as string[])
      : [];

    const modelInfo: PrismaModelInfo = {
      name: model.name,
      dbName: model.dbName || undefined,
      fields: [],
      primaryKey,
      uniqueFields,
      uniqueIndexes,
      isGenerated: model.isGenerated || false,
      documentation: model.documentation || undefined,
    };

    for (const field of model.fields) {
      // Converter arrays readonly para arrays mutáveis
      const relationFromFields = field.relationFromFields
        ? ([...field.relationFromFields] as string[])
        : undefined;

      const relationToFields = field.relationToFields
        ? ([...field.relationToFields] as string[])
        : undefined;

      const fieldInfo: PrismaFieldInfo = {
        name: field.name,
        type: field.type,
        kind: field.kind as any,
        isList: field.isList,
        isRequired: field.isRequired,
        isUnique: field.isUnique,
        isId: field.isId,
        isReadOnly: field.isReadOnly || false,
        hasDefaultValue: field.hasDefaultValue,
        default: field.default,
        isGenerated: field.isGenerated || false,
        isUpdatedAt: field.isUpdatedAt || false,
        documentation: field.documentation || undefined,

        // 🆕 SEGURANÇA
        isSensitive: securityConfig.sensitiveFields.includes(field.name),
        isEditableByConfig: !securityConfig.nonEditableFields.includes(
          field.name
        ),
        requiresConfirmation: securityConfig.requireConfirmation.includes(
          field.name
        ),
      };

      if (field.relationName) {
        fieldInfo.relationName = field.relationName;
        fieldInfo.relationFromFields = relationFromFields;
        fieldInfo.relationToFields = relationToFields;
        fieldInfo.relationOnDelete = field.relationOnDelete;
        fieldInfo.relationOnUpdate = field.relationOnUpdate;
      }

      modelInfo.fields.push(fieldInfo);
    }

    models.push(modelInfo);
  }

  return models;
}

/**
 * Extrai informações de um modelo específico
 */
export function extractModelInfo(modelName: string): PrismaModelInfo | null {
  const models = extractPrismaModels();
  return models.find((m) => m.name === modelName) || null;
}

/**
 * Extrai todos os enums do Prisma
 */
export function extractPrismaEnums(): Record<string, string[]> {
  const enums: Record<string, string[]> = {};

  const dmmf = Prisma.dmmf;

  if (!dmmf || !dmmf.datamodel) {
    return enums;
  }

  for (const enumDef of dmmf.datamodel.enums) {
    enums[enumDef.name] = enumDef.values.map((v) => v.name);
  }

  return enums;
}

/**
 * Verifica se um campo é editável (combinando regras do Prisma + config)
 */
export function isFieldEditable(field: PrismaFieldInfo): boolean {
  if (field.isId) return false;
  if (field.isReadOnly) return false;
  if (field.isGenerated) return false;
  if (field.isUpdatedAt) return false;
  if (field.name === 'createdAt') return false;

  if (field.kind === 'object' && field.isList) return false;

  if (field.isEditableByConfig === false) return false;

  return true;
}

/**
 * Obtém os campos visíveis (não-relações de lista) para exibição em tabela
 */
export function getDisplayableFields(modelName: string): PrismaFieldInfo[] {
  const modelInfo = extractModelInfo(modelName);
  if (!modelInfo) return [];

  return modelInfo.fields.filter((field) => {
    if (field.isSensitive) return false;
    if (field.kind === 'object' && field.isList) return false;
    return true;
  });
}

/**
 * Obtém TODOS os campos do modelo
 */
export function getAllFields(modelName: string): PrismaFieldInfo[] {
  const modelInfo = extractModelInfo(modelName);
  if (!modelInfo) return [];

  return modelInfo.fields.filter((field) => {
    if (field.kind === 'object' && field.isList) return false;
    return true;
  });
}

/**
 * Obtém campos editáveis para formulários
 */
export function getEditableFields(modelName: string): PrismaFieldInfo[] {
  const modelInfo = extractModelInfo(modelName);
  if (!modelInfo) return [];

  return modelInfo.fields.filter(isFieldEditable);
}

/**
 * Obtém campos pesquisáveis (String)
 */
export function getSearchableFields(modelName: string): string[] {
  const modelInfo = extractModelInfo(modelName);
  if (!modelInfo) return [];

  return modelInfo.fields
    .filter(
      (field) =>
        field.kind === 'scalar' &&
        field.type === 'String' &&
        !field.isList &&
        !field.isSensitive
    )
    .map((field) => field.name);
}

/**
 * Obtém tipo de input apropriado para um campo
 */
export function getInputType(field: PrismaFieldInfo): string {
  if (field.isSensitive) return 'password';

  if (field.kind === 'enum') return 'select';
  if (field.type === 'Boolean') return 'checkbox';
  if (field.type === 'DateTime') return 'datetime-local';
  if (field.type === 'Int' || field.type === 'Float') return 'number';
  if (field.type === 'String' && field.name.includes('email')) return 'email';
  if (field.type === 'String' && field.name.includes('url')) return 'url';
  if (field.type === 'String') return 'text';
  if (field.kind === 'object' && !field.isList) return 'relation';

  return 'text';
}

/**
 * Formata valor para exibição
 */
export function formatFieldValue(value: any, field: PrismaFieldInfo): string {
  if (field.isSensitive) {
    return '••••••••';
  }

  if (value === null || value === undefined) return '-';

  if (field.type === 'DateTime') {
    return new Date(value).toLocaleString('pt-BR');
  }

  if (field.type === 'Boolean') {
    return value ? 'Sim' : 'Não';
  }

  if (Array.isArray(value)) {
    return `[${value.length} itens]`;
  }

  if (typeof value === 'object' && field.kind === 'object') {
    return '[Relação]';
  }

  if (typeof value === 'object') {
    return '[Object]';
  }

  return String(value);
}

/**
 * Obtém operadores de filtro para um campo
 */
export function getFilterOperators(
  field: PrismaFieldInfo
): Array<{ value: string; label: string }> {
  if (field.isSensitive) {
    return [];
  }

  if (field.type === 'String') {
    return [
      { value: 'equals', label: 'Igual a' },
      { value: 'contains', label: 'Contém' },
      { value: 'startsWith', label: 'Começa com' },
      { value: 'endsWith', label: 'Termina com' },
      { value: 'not', label: 'Diferente de' },
    ];
  }

  if (field.type === 'Int' || field.type === 'Float') {
    return [
      { value: 'equals', label: 'Igual a' },
      { value: 'gt', label: 'Maior que' },
      { value: 'gte', label: 'Maior ou igual' },
      { value: 'lt', label: 'Menor que' },
      { value: 'lte', label: 'Menor ou igual' },
      { value: 'not', label: 'Diferente de' },
    ];
  }

  if (field.type === 'DateTime') {
    return [
      { value: 'equals', label: 'Igual a' },
      { value: 'gt', label: 'Depois de' },
      { value: 'gte', label: 'A partir de' },
      { value: 'lt', label: 'Antes de' },
      { value: 'lte', label: 'Até' },
    ];
  }

  if (field.type === 'Boolean') {
    return [{ value: 'equals', label: 'Igual a' }];
  }

  if (field.kind === 'enum') {
    return [
      { value: 'equals', label: 'Igual a' },
      { value: 'not', label: 'Diferente de' },
      { value: 'in', label: 'Em' },
      { value: 'notIn', label: 'Não em' },
    ];
  }

  return [{ value: 'equals', label: 'Igual a' }];
}
