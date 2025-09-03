// app/api/uploads/composer/route.ts - ATUALIZADO COM NOVOS CAMPOS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import { logComposerCreate } from '@/app/utils/historyUtils';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';

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

    // 🆕 DADOS PARA CRIAÇÃO INCLUINDO NOVOS CAMPOS
    const createData = {
      name: body.name,
      fullName: body.fullName,
      alternativeNames: body.alternativeNames || null,
      birthDate: body.birthDate || null,
      deathDate: body.deathDate || null,
      portraitUrl: body.portraitUrl || null,
      epochId: body.epochId,
      epochName: body.epochName || null,
      bio: body.bio || null,
      imslpId: body.imslpId || null,
      permLinkImslp: body.permLinkImslp || null, // 🆕 NOVO CAMPO
      wikipediaLink: body.wikipediaLink || null,
      videoUrl: body.videoUrl || null, // 🆕 NOVO CAMPO
      nationality: body.nationality || null,
      instruments: body.instruments || null,
      imslpCategories: body.imslpCategories || null,
      primaryRoleId: body.primaryRoleId,
      roles: body.roles || null,
      dataSource: body.dataSource || 'none',
      createdBy: userId,
      isCustom: true,
      hasValidImage: !!body.portraitUrl,
      lastVerified: new Date(),
      dataCompleteness: calculateDataCompleteness(body),
    };

    // Criar compositor
    const composer = await prisma.composer.create({
      data: createData,
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
        videoUrl: composer.videoUrl, // 🆕 INCLUIR NO LOG
        permLinkImslp: composer.permLinkImslp, // 🆕 INCLUIR NO LOG
      },
      request
    );

    // Invalidar cache
    await revalidateUploadsCache(userId);
    const language = await getServerLanguageStatic();
    const message =
      language === 'pt'
        ? 'Compositor criado com sucesso!'
        : 'Composer created successfully!';
    return NextResponse.json({
      message: message,
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

// 🆕 FUNÇÃO HELPER ATUALIZADA PARA INCLUIR NOVOS CAMPOS
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
    'permLinkImslp', // 🆕 NOVO CAMPO
    'videoUrl', // 🆕 NOVO CAMPO
  ];

  const filledFields = fields.filter(
    (field) => data[field] && data[field].toString().trim().length > 0
  ).length;

  return Math.round((filledFields / fields.length) * 100);
}
