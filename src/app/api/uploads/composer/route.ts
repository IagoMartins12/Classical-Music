// app/api/uploads/composer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { logComposerCreate } from '@/app/utils/historyUtils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validações básicas
    if (!body.name || !body.fullName || !body.epochId || !body.primaryRoleId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Verificar se época e papel existem
    const [epoch, role] = await Promise.all([
      prisma.epoch.findUnique({ where: { id: body.epochId } }),
      prisma.role.findUnique({ where: { id: body.primaryRoleId } }),
    ]);

    if (!epoch) {
      return NextResponse.json(
        { error: 'Época não encontrada' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { error: 'Papel não encontrado' },
        { status: 400 }
      );
    }

    console.log('BODY', body);

    // Criar compositor
    const composer = await prisma.composer.create({
      data: {
        ...body,
        createdBy: userId,
        isCustom: true,
        dataSource: body.dataSource || 'none',

        hasValidImage: !!body.portraitUrl,
        lastVerified: new Date(),
        dataCompleteness: calculateDataCompleteness(body),
      },
      include: {
        epoch: { select: { name: true } },
        primaryRole: { select: { name: true } },
      },
    });

    // 🆕 Registrar no histórico
    await logComposerCreate(
      userId,
      composer.id,
      {
        name: composer.name,
        fullName: composer.fullName,
        epochName: composer.epoch.name,
        primaryRole: composer.primaryRole.name,
        nationality: composer.nationality,
        birthDate: composer.birthDate,
        deathDate: composer.deathDate,
      },
      request
    );

    // Invalidar cache
    await revalidateUploadsCache(userId);

    return NextResponse.json({
      message: 'Compositor criado com sucesso!',
      composer,
    });
  } catch (error) {
    console.error('Erro ao criar compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função helper para calcular completude dos dados
function calculateDataCompleteness(data: any): number {
  const fields = [
    'name',
    'fullName',
    'birthDate',
    'deathDate',
    'portraitUrl',
    'bio',
    'nationality',
    'instruments',
  ];

  const filledFields = fields.filter(
    (field) => data[field] && data[field].toString().trim().length > 0
  ).length;

  return Math.round((filledFields / fields.length) * 100);
}
