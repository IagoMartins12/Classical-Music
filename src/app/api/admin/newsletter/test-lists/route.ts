// app/api/admin/newsletter/test-lists/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Listar todas as listas de teste
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Construir filtros
    const where: any = {};

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (isActive !== null && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    // Construir ordenação
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Buscar listas de teste
    const testLists = await prisma.testEmailList.findMany({
      where,
      orderBy,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calcular estatísticas
    const stats = {
      total: testLists.length,
      active: testLists.filter((list) => list.isActive).length,
      inactive: testLists.filter((list) => !list.isActive).length,
      totalEmails: testLists.reduce((sum, list) => sum + list.totalEmails, 0),
      totalUses: testLists.reduce((sum, list) => sum + list.timesUsed, 0),
    };

    return NextResponse.json({
      success: true,
      lists: testLists.map((list) => ({
        ...list,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
        lastUsed: list.lastUsed?.toISOString() || null,
      })),
      stats,
    });
  } catch (error) {
    console.error('Erro ao buscar listas de teste:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova lista de teste
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      emails = [],
      color = '#6366f1',
      isActive = true,
    } = body;

    // Validações básicas
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório (mínimo 2 caracteres)' },
        { status: 400 }
      );
    }

    if (emails && !Array.isArray(emails)) {
      return NextResponse.json(
        { success: false, error: 'Emails deve ser um array' },
        { status: 400 }
      );
    }

    // Validar emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(
      (email: string) => !emailRegex.test(email)
    );

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Emails inválidos encontrados',
          invalidEmails: invalidEmails.slice(0, 5), // Mostrar apenas os primeiros 5
        },
        { status: 400 }
      );
    }

    // Verificar se nome já existe
    const existingList = await prisma.testEmailList.findFirst({
      where: {
        name: name.trim(),
        createdBy: session.user.id,
      },
    });

    if (existingList) {
      return NextResponse.json(
        { success: false, error: 'Já existe uma lista com este nome' },
        { status: 409 }
      );
    }

    if (!Array.isArray(emails) || !emails.every((e) => typeof e === 'string')) {
      return NextResponse.json({
        success: false,
        message: 'Lista de emails inválidas!',
      });
    }
    // Normalizar emails (remover duplicatas e converter para lowercase)
    const normalizedEmails: string[] = [
      ...new Set(emails.map((email: string) => email.toLowerCase().trim())),
    ];

    // Criar lista de teste
    const testList = await prisma.testEmailList.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        emails: normalizedEmails,
        color: color || '#6366f1',
        isActive,
        totalEmails: normalizedEmails.length,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Lista de teste criada com sucesso!',
      list: {
        ...testList,
        createdAt: testList.createdAt.toISOString(),
        updatedAt: testList.updatedAt.toISOString(),
        lastUsed: null,
      },
    });
  } catch (error) {
    console.error('Erro ao criar lista de teste:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar múltiplas listas
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { listIds } = body;

    if (!listIds || !Array.isArray(listIds) || listIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'IDs das listas são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se todas as listas existem e pertencem ao usuário ou se é super admin
    const listsToDelete = await prisma.testEmailList.findMany({
      where: {
        id: { in: listIds },
        // Apenas o criador ou super admin pode deletar
        ...(session.user.role !== 2 && { createdBy: session.user.id }),
      },
    });

    if (listsToDelete.length !== listIds.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Algumas listas não foram encontradas ou você não tem permissão',
        },
        { status: 404 }
      );
    }

    // Deletar listas
    const result = await prisma.testEmailList.deleteMany({
      where: {
        id: { in: listIds },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} lista(s) deletada(s) com sucesso!`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Erro ao deletar listas de teste:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
