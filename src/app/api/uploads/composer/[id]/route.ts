// app/api/uploads/composer/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Buscar compositor específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const composer = await prisma.composer.findUnique({
      where: { id: params.id },
      include: {
        epoch: { select: { id: true, name: true } },
        primaryRole: { select: { id: true, name: true } },
      },
    });

    if (!composer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ composer });
  } catch (error) {
    console.error('Erro ao buscar compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar compositor
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
      secondaryRoles,
      dataSource = 'none',
    } = body;

    // Verificar se o compositor existe
    const existingComposer = await prisma.composer.findUnique({
      where: { id: params.id },
    });

    if (!existingComposer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (
      existingComposer.createdBy !== session.user.id &&
      user?.role !== 1 &&
      user?.role !== 2
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este compositor' },
        { status: 403 }
      );
    }

    // Validações
    if (!name || !fullName || !epochId || !primaryRoleId) {
      return NextResponse.json(
        {
          error:
            'Campos obrigatórios: nome, nome completo, época e papel principal',
        },
        { status: 400 }
      );
    }

    // Validar formato de data estendido
    if (birthDate && !isValidExtendedDateFormat(birthDate)) {
      return NextResponse.json(
        {
          error:
            'Data de nascimento deve estar no formato dd/mm/aaaa ou formato extenso (ex: 27 de janeiro de 1756)',
        },
        { status: 400 }
      );
    }

    if (deathDate && !isValidExtendedDateFormat(deathDate)) {
      return NextResponse.json(
        {
          error:
            'Data de morte deve estar no formato dd/mm/aaaa ou formato extenso (ex: 5 de dezembro de 1791)',
        },
        { status: 400 }
      );
    }

    // Verificar se epoch e role existem
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

    // Verificar se os papéis secundários existem
    if (secondaryRoles && secondaryRoles.length > 0) {
      const existingRoles = await prisma.role.findMany({
        where: { id: { in: secondaryRoles } },
      });

      if (existingRoles.length !== secondaryRoles.length) {
        return NextResponse.json(
          {
            error: 'Um ou mais papéis secundários não foram encontrados',
          },
          { status: 400 }
        );
      }
    }

    // Verificar duplicatas excluindo o compositor atual
    const duplicateConditions = [];

    duplicateConditions.push(
      { name: name.trim() },
      { fullName: fullName.trim() }
    );

    if (imslpId) {
      const cleanImslpId = imslpId.trim();
      duplicateConditions.push(
        { imslpId: cleanImslpId },
        { permLinkImslp: cleanImslpId },
        { permLinkImslp: { contains: cleanImslpId } }
      );
    }

    if (wikipediaLink) {
      duplicateConditions.push({ wikipediaLink: wikipediaLink.trim() });
    }

    const duplicateComposer = await prisma.composer.findFirst({
      where: {
        OR: duplicateConditions,
        id: { not: params.id }, // Excluir o compositor atual
      },
    });

    if (duplicateComposer) {
      let duplicateReason = '';
      if (
        duplicateComposer.name === name.trim() ||
        duplicateComposer.fullName === fullName.trim()
      ) {
        duplicateReason = 'nome';
      } else if (
        duplicateComposer.imslpId === imslpId?.trim() ||
        duplicateComposer.permLinkImslp?.includes(imslpId?.trim() || '')
      ) {
        duplicateReason = 'link do IMSLP';
      } else if (duplicateComposer.wikipediaLink === wikipediaLink?.trim()) {
        duplicateReason = 'link da Wikipedia';
      }

      return NextResponse.json(
        {
          error: `Já existe outro compositor com esse ${duplicateReason}: ${duplicateComposer.fullName}`,
        },
        { status: 409 }
      );
    }

    // Processar cargos secundários
    let finalRoles = roles;
    if (secondaryRoles && secondaryRoles.length > 0) {
      finalRoles = secondaryRoles.join(', ');
    }

    // Atualizar o compositor
    const updatedComposer = await prisma.composer.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        fullName: fullName.trim(),
        otherName: otherName?.trim() || null,
        alternativeNames: alternativeNames?.trim() || null,
        pseudonyms: pseudonyms?.trim() || null,
        birthDate: birthDate?.trim() || null,
        deathDate: deathDate?.trim() || null,
        portraitUrl: portraitUrl?.trim() || null,
        epochId,
        epochName: epoch.name,
        bio: bio?.trim() || null,
        diverseInfo: diverseInfo?.trim() || null,
        externalLinks: externalLinks?.trim() || null,
        imslpId: imslpId?.trim() || null,
        wikipediaLink: wikipediaLink?.trim() || null,
        nationality: nationality?.trim() || null,
        instruments: instruments?.trim() || null,
        imslpCategories: imslpCategories?.trim() || null,
        primaryRoleId,
        roles: finalRoles?.trim() || null,
        permLinkImslp: imslpId
          ? `https://imslp.org/wiki/${imslpId.trim()}`
          : null,
        hasValidImage: !!portraitUrl,
        dataCompleteness: calculateDataCompleteness(body),
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
        dataSource: dataSource,
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
      composer: updatedComposer,
      message: 'Compositor atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar compositor:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

// DELETE - Excluir compositor
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o compositor existe
    const existingComposer = await prisma.composer.findUnique({
      where: { id: params.id },
    });

    if (!existingComposer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (
      existingComposer.createdBy !== session.user.id &&
      user?.role !== 1 &&
      user?.role !== 2
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir este compositor' },
        { status: 403 }
      );
    }

    // Verificar se há obras associadas
    const worksCount = await prisma.work.count({
      where: { composerId: params.id },
    });

    if (worksCount > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir este compositor pois há ${worksCount} obra(s) associada(s)`,
        },
        { status: 400 }
      );
    }

    // Excluir o compositor
    await prisma.composer.delete({
      where: { id: params.id },
    });

    // Invalidar cache
    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Compositor excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir compositor:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

// Função para validar formato de data estendido
function isValidExtendedDateFormat(dateString: string): boolean {
  if (!dateString) return true;

  // Formato dd/mm/yyyy
  const ddmmyyyyRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (ddmmyyyyRegex.test(dateString)) {
    return true;
  }

  // Formato apenas ano
  const yearOnlyRegex = /^\d{4}$/;
  if (yearOnlyRegex.test(dateString)) {
    return true;
  }

  // Lista de meses válidos em inglês e português
  const validMonths = [
    // Inglês
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
    'jan',
    'feb',
    'mar',
    'apr',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
    // Português
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];

  const monthsPattern = validMonths.join('|');

  // Formato extenso: "27 de janeiro de 1756" ou "27 January 1756" ou "January 27, 1756"
  const extendedFormats = [
    // Português: "27 de janeiro de 1756"
    new RegExp(
      `^\\d{1,2}\\s+(de\\s+)?(${monthsPattern})\\s+(de\\s+)?\\d{4}$`,
      'i'
    ),
    // Inglês: "27 January 1756" ou "January 27, 1756"
    new RegExp(`^\\d{1,2}\\s+(${monthsPattern})\\s+\\d{4}$`, 'i'),
    new RegExp(`^(${monthsPattern})\\s+\\d{1,2},?\\s+\\d{4}$`, 'i'),
    // Apenas mês e ano: "janeiro de 1756" ou "January 1756"
    new RegExp(`^(${monthsPattern})\\s+(de\\s+)?\\d{4}$`, 'i'),
  ];

  return extendedFormats.some((regex) => regex.test(dateString.trim()));
}

// Função auxiliar para calcular completude dos dados
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
    'wikipediaLink',
    'otherName',
    'alternativeNames',
    'diverseInfo',
    'externalLinks',
    'imslpCategories',
    'imslpId',
  ];

  const filledFields = fields.filter(
    (field) => data[field] && data[field].toString().trim()
  );

  return Math.round((filledFields.length / fields.length) * 100);
}
