// app/api/uploads/composer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      fullName,
      otherName,
      alternativeNames,
      namesInOtherLangs,
      pseudonyms,
      birthDate,
      deathDate,
      portraitUrl,
      epochId,
      bio,
      diverseInfo,
      externalLinks,
      imslpId,
      wikipediaLink,
      nationality,
      instruments,
      imslpCategories,
      primaryRoleId,
      roles,
    } = body;

    // Validação básica
    if (!name || !fullName || !epochId || !primaryRoleId) {
      return NextResponse.json(
        {
          error:
            'Campos obrigatórios: nome, nome completo, época e papel principal',
        },
        { status: 400 }
      );
    }

    // Verificar se o epoch e role existem
    const [epoch, role] = await Promise.all([
      prisma.epoch.findUnique({ where: { id: epochId } }),
      prisma.role.findUnique({ where: { id: primaryRoleId } }),
    ]);

    if (!epoch || !role) {
      return NextResponse.json(
        {
          error: 'Época ou papel não encontrado',
        },
        { status: 400 }
      );
    }

    // Verificar se já existe um compositor com esse nome
    const existingComposer = await prisma.composer.findFirst({
      where: {
        OR: [
          { name: name },
          { fullName: fullName },
          ...(imslpId ? [{ imslpId: imslpId }] : []),
        ],
      },
    });

    if (existingComposer) {
      return NextResponse.json(
        {
          error: 'Já existe um compositor com esse nome ou ID IMSLP',
        },
        { status: 409 }
      );
    }

    // Criar o compositor
    const composer = await prisma.composer.create({
      data: {
        name,
        fullName,
        otherName,
        alternativeNames,
        namesInOtherLangs,
        pseudonyms,
        birthDate,
        deathDate,
        portraitUrl,
        epochId,
        epochName: epoch.name,
        bio,
        diverseInfo,
        externalLinks,
        imslpId,
        wikipediaLink,
        nationality,
        instruments,
        imslpCategories,
        primaryRoleId,
        roles,
        permLinkImslp: imslpId ? `https://imslp.org/wiki/${imslpId}` : null,
        // Campos para rastreamento
        createdBy: session.user.id, // Assumindo que você adicionará este campo
        isCustom: !imslpId, // Assumindo que você adicionará este campo
        hasValidImage: !!portraitUrl,
        dataCompleteness: calculateDataCompleteness(body),
      },
      include: {
        epoch: { select: { name: true } },
        primaryRole: { select: { name: true } },
      },
    });

    // Invalidar cache
    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      composer,
      message: 'Compositor criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar compositor:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

// Função auxiliar para calcular completude dos dados
export function calculateDataCompleteness(data: any): number {
  const fields = [
    'name',
    'fullName',
    'birthDate',
    'deathDate',
    'portraitUrl',
    'bio',
    'nationality',
    'instruments',
    'wikipediaLink',
  ];

  const filledFields = fields.filter(
    (field) => data[field] && data[field].trim()
  );
  return Math.round((filledFields.length / fields.length) * 100);
}
