// app/api/admin/database/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// Converter JSON para CSV
function jsonToCsv(data: any[]): string {
  if (data.length === 0) return '';

  // Pegar todas as chaves únicas de todos os objetos
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys);

  // Criar header
  const csvRows = [headers.join(',')];

  // Adicionar dados
  data.forEach((item) => {
    const values = headers.map((header) => {
      const value = item[header];

      // Tratar valores especiais
      if (value === null || value === undefined) {
        return '';
      }

      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }

      // Escapar aspas e adicionar aspas se contiver vírgula
      const stringValue = String(value);
      if (
        stringValue.includes(',') ||
        stringValue.includes('"') ||
        stringValue.includes('\n')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    });

    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const format = searchParams.get('format') || 'json';
    const search = searchParams.get('search') || undefined;
    const sortField = searchParams.get('sortField') || undefined;
    const sortDirection =
      (searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc';

    if (!model) {
      return NextResponse.json(
        { error: 'Model não especificado' },
        { status: 400 }
      );
    }

    const modelName = model.charAt(0).toLowerCase() + model.slice(1);
    // @ts-expect-error: Probably don't have modelName
    const prismaModel = prisma[modelName];

    if (!prismaModel) {
      return NextResponse.json(
        { error: `Model ${model} não encontrado` },
        { status: 404 }
      );
    }

    // Construir where clause
    const where: any = {};

    if (search) {
      const searchFields = [
        'name',
        'title',
        'firstName',
        'lastName',
        'email',
        'username',
        'displayName',
      ];
      where.OR = searchFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    // Construir orderBy - verificar se o campo existe
    let orderBy: any = {};

    if (sortField) {
      orderBy = { [sortField]: sortDirection };
    } else {
      // Lista de models que não têm createdAt
      const modelsWithoutCreatedAt = [
        'Account',
        'Session',
        'UserInstrument',
        'Annotation',
        'FavoriteWork',
        'FavoriteComposer',
        'FavoriteScore',
        'WantToLearn',
        'Learned',
        'ScoreFavoriteStats',
        'BlogArticleCategory',
        'BlogArticleTag',
        'BlogCommentLike',
        'BlogLike',
        'BlogBookmark',
        'AnnotationHelpfulVote',
        'TeacherStudent',
        'CouponUsage',
        'NewsletterCampaignSend',
        'EventReminder',
      ];

      orderBy = modelsWithoutCreatedAt.includes(model)
        ? { id: 'desc' }
        : { createdAt: 'desc' };
    }

    // Buscar TODOS os registros (sem paginação para exportação)
    const records = await prismaModel.findMany({
      where,
      orderBy,
      take: 10000, // Limite de segurança
    });

    // Preparar resposta baseado no formato
    if (format === 'csv') {
      const csv = jsonToCsv(records);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${model}_${new Date().toISOString()}.csv"`,
        },
      });
    } else {
      // JSON
      const json = JSON.stringify(records, null, 2);

      return new NextResponse(json, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${model}_${new Date().toISOString()}.json"`,
        },
      });
    }
  } catch (error) {
    console.error('Erro na API de export:', error);
    return NextResponse.json(
      {
        error: 'Erro ao exportar dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
