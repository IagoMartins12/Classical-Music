// app/api/admin/database/schema/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  extractModelInfo,
  extractPrismaEnums,
  getDisplayableFields,
  getAllFields,
  getEditableFields,
  getSearchableFields,
  isFieldEditable,
  getInputType,
  getFilterOperators,
} from '@/app/libs/database/prismaSchemaExtractor';
import { getModelSecurityConfig } from '@/app/libs/database/databaseConfig';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const includeAllFields = searchParams.get('includeAll') === 'true'; // 🆕 Flag para incluir sensíveis

    if (!model) {
      return NextResponse.json(
        { error: 'Model não especificado' },
        { status: 400 }
      );
    }

    // Extrair informações do modelo usando DMMF
    const modelInfo = extractModelInfo(model);

    if (!modelInfo) {
      return NextResponse.json(
        { error: `Model ${model} não encontrado` },
        { status: 404 }
      );
    }

    // Obter configuração de segurança
    const securityConfig = getModelSecurityConfig(model);

    // Extrair todos os enums disponíveis
    const enums = extractPrismaEnums();

    // Processar campos para adicionar informações extras
    const processedFields = modelInfo.fields.map((field) => {
      const isEditable = isFieldEditable(field);
      const inputType = getInputType(field);
      const filterOperators = getFilterOperators(field);

      return {
        ...field,
        isEditable,
        inputType,
        filterOperators,
        // Se for enum, adicionar as opções
        enumValues: field.kind === 'enum' ? enums[field.type] : undefined,
      };
    });

    // 🆕 Campos exibíveis (excluindo sensíveis por padrão)
    const displayableFields = includeAllFields
      ? getAllFields(model)
      : getDisplayableFields(model);

    // Campos editáveis (para formulários)
    const editableFields = getEditableFields(model);

    // Campos pesquisáveis
    const searchableFields = getSearchableFields(model);

    // 🆕 Campos que exigem confirmação
    const confirmationFields = processedFields
      .filter((f) => f.requiresConfirmation)
      .map((f) => f.name);

    return NextResponse.json({
      success: true,
      schema: {
        name: modelInfo.name,
        dbName: modelInfo.dbName,
        fields: processedFields,
        primaryKey: modelInfo.primaryKey,
        uniqueFields: modelInfo.uniqueFields,
        uniqueIndexes: modelInfo.uniqueIndexes,
        documentation: modelInfo.documentation,
      },
      displayableFields,
      editableFields,
      searchableFields,
      confirmationFields, // 🆕
      securityConfig, // 🆕
      enums,
      totalFields: modelInfo.fields.length,
      totalDisplayableFields: displayableFields.length,
      totalEditableFields: editableFields.length,
      totalSensitiveFields: securityConfig.sensitiveFields.length, // 🆕
    });
  } catch (error) {
    console.error('Erro na API de schema:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
