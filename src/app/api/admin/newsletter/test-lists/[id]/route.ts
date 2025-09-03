// app/api/admin/newsletter/test-lists/[id]/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
interface Params {
  id: string;
}
// GET - Buscar lista específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Buscar lista de teste
    const testList = await prisma.testEmailList.findUnique({
      where: { id },
    });

    if (!testList) {
      return NextResponse.json(
        { success: false, error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      list: {
        ...testList,
        createdAt: testList.createdAt.toISOString(),
        updatedAt: testList.updatedAt.toISOString(),
        lastUsed: testList.lastUsed?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar lista de teste:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar lista específica
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, emails, color, isActive } = body;

    // Verificar se lista existe
    const existingList = await prisma.testEmailList.findUnique({
      where: { id },
    });

    if (!existingList) {
      return NextResponse.json(
        { success: false, error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissão (apenas criador ou super admin)
    if (session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para editar esta lista' },
        { status: 403 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};

    // Validar e atualizar nome se fornecido
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'Nome deve ter pelo menos 2 caracteres' },
          { status: 400 }
        );
      }

      // Verificar se novo nome já existe (exceto para a própria lista)
      const nameConflict = await prisma.testEmailList.findFirst({
        where: {
          name: name.trim(),
          id: { not: id },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          { success: false, error: 'Já existe uma lista com este nome' },
          { status: 409 }
        );
      }

      updateData.name = name.trim();
    }

    // Atualizar descrição se fornecida
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    // Validar e atualizar emails se fornecidos
    if (emails !== undefined) {
      if (!Array.isArray(emails)) {
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
            invalidEmails: invalidEmails.slice(0, 5),
          },
          { status: 400 }
        );
      }

      // Normalizar emails
      const normalizedEmails = [
        ...new Set(emails.map((email: string) => email.toLowerCase().trim())),
      ];

      updateData.emails = normalizedEmails;
      updateData.totalEmails = normalizedEmails.length;
    }

    // Atualizar cor se fornecida
    if (color !== undefined) {
      updateData.color = color || '#6366f1';
    }

    // Atualizar status se fornecido
    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    // Atualizar lista
    const updatedList = await prisma.testEmailList.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Lista atualizada com sucesso!',
      list: {
        ...updatedList,
        createdAt: updatedList.createdAt.toISOString(),
        updatedAt: updatedList.updatedAt.toISOString(),
        lastUsed: updatedList.lastUsed?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar lista de teste:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar lista específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar se lista existe
    const existingList = await prisma.testEmailList.findUnique({
      where: { id },
    });

    if (!existingList) {
      return NextResponse.json(
        { success: false, error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissão (apenas criador ou super admin)
    if (session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para deletar esta lista' },
        { status: 403 }
      );
    }

    // Deletar lista
    await prisma.testEmailList.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Lista deletada com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao deletar lista de teste:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Ações especiais (duplicate, toggle status, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    // Verificar se lista existe
    const existingList = await prisma.testEmailList.findUnique({
      where: { id },
    });

    if (!existingList) {
      return NextResponse.json(
        { success: false, error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'duplicate':
        // Duplicar lista
        const duplicatedList = await prisma.testEmailList.create({
          data: {
            name: `${existingList.name} (Cópia)`,
            description: existingList.description,
            emails: existingList.emails,
            color: existingList.color,
            isActive: existingList.isActive,
            totalEmails: existingList.totalEmails,
            timesUsed: 0, // 🔧 CORREÇÃO: Nova lista começa com 0 usos
            // 🔧 CORREÇÃO: Não definir lastUsed para nova lista
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Lista duplicada com sucesso!',
          list: {
            ...duplicatedList,
            createdAt: duplicatedList.createdAt.toISOString(),
            updatedAt: duplicatedList.updatedAt.toISOString(),
            lastUsed: null, // 🔧 CORREÇÃO: Garantir que é null
          },
        });
      case 'toggle-status':
        // Alterar status ativo/inativo
        const toggledList = await prisma.testEmailList.update({
          where: { id },
          data: { isActive: !existingList.isActive },
        });

        return NextResponse.json({
          success: true,
          message: `Lista ${
            toggledList.isActive ? 'ativada' : 'desativada'
          } com sucesso!`,
          list: {
            ...toggledList,
            createdAt: toggledList.createdAt.toISOString(),
            updatedAt: toggledList.updatedAt.toISOString(),
            lastUsed: toggledList.lastUsed?.toISOString() || null,
          },
        });

      case 'clear-emails':
        // Limpar todos os emails da lista
        const clearedList = await prisma.testEmailList.update({
          where: { id },
          data: {
            emails: [],
            totalEmails: 0,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Emails da lista removidos com sucesso!',
          list: {
            ...clearedList,
            createdAt: clearedList.createdAt.toISOString(),
            updatedAt: clearedList.updatedAt.toISOString(),
            lastUsed: clearedList.lastUsed?.toISOString() || null,
          },
        });

      case 'add-emails':
        // Adicionar emails à lista
        const { newEmails } = body;

        if (!Array.isArray(newEmails)) {
          return NextResponse.json(
            { success: false, error: 'Novos emails devem ser um array' },
            { status: 400 }
          );
        }

        // Validar novos emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidNewEmails = newEmails.filter(
          (email: string) => !emailRegex.test(email)
        );

        if (invalidNewEmails.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'Emails inválidos encontrados',
              invalidEmails: invalidNewEmails.slice(0, 5),
            },
            { status: 400 }
          );
        }

        // Combinar emails existentes com novos (sem duplicatas)
        const combinedEmails = [
          ...new Set([
            ...existingList.emails,
            ...newEmails.map((email: string) => email.toLowerCase().trim()),
          ]),
        ];

        const updatedListWithEmails = await prisma.testEmailList.update({
          where: { id },
          data: {
            emails: combinedEmails,
            totalEmails: combinedEmails.length,
          },
        });

        return NextResponse.json({
          success: true,
          message: `${newEmails.length} email(s) adicionado(s) à lista!`,
          addedCount: newEmails.length,
          totalCount: combinedEmails.length,
          list: {
            ...updatedListWithEmails,
            createdAt: updatedListWithEmails.createdAt.toISOString(),
            updatedAt: updatedListWithEmails.updatedAt.toISOString(),
            lastUsed: updatedListWithEmails.lastUsed?.toISOString() || null,
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na ação da lista de teste:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
