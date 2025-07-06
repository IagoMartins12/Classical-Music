// app/api/uploads/composer/route.ts - ATUALIZADO
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

    // Validação básica obrigatória
    if (!name || !fullName || !epochId || !primaryRoleId) {
      return NextResponse.json(
        {
          error:
            'Campos obrigatórios: nome, nome completo, época e papel principal',
        },
        { status: 400 }
      );
    }

    // Validar formato de data se fornecido
    if (birthDate && !isValidDateFormatAPI(birthDate)) {
      return NextResponse.json(
        {
          error:
            'Data de nascimento deve estar no formato dd/mm/aaaa ou yyyy-mm-dd',
        },
        { status: 400 }
      );
    }

    if (deathDate && !isValidDateFormatAPI(deathDate)) {
      return NextResponse.json(
        {
          error: 'Data de morte deve estar no formato dd/mm/aaaa ou yyyy-mm-dd',
        },
        { status: 400 }
      );
    }

    // Validar que data de morte não é anterior ao nascimento
    if (birthDate && deathDate && !isValidDateRangeAPI(birthDate, deathDate)) {
      return NextResponse.json(
        {
          error: 'Data de morte não pode ser anterior à data de nascimento',
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

    // Verificar se os papéis secundários existem (se fornecidos)
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

    // Verificar duplicatas por nome, IMSLP ID ou Wikipedia link
    const duplicateConditions = [];

    // Verificar por IMSLP ID se fornecido
    if (imslpId) {
      const cleanImslpId = imslpId.trim();
      duplicateConditions.push(
        { imslpId: cleanImslpId },
        { permLinkImslp: cleanImslpId },
        { permLinkImslp: { contains: cleanImslpId } }
      );
    }

    // Verificar por Wikipedia link se fornecido
    if (wikipediaLink) {
      duplicateConditions.push({ wikipediaLink: wikipediaLink.trim() });
    }

    const existingComposer = await prisma.composer.findFirst({
      where: {
        OR: duplicateConditions,
      },
    });

    if (existingComposer) {
      let duplicateReason = '';
      if (
        existingComposer.name === name.trim() ||
        existingComposer.fullName === fullName.trim()
      ) {
        duplicateReason = 'nome';
      } else if (
        existingComposer.imslpId === imslpId?.trim() ||
        existingComposer.permLinkImslp?.includes(imslpId?.trim() || '')
      ) {
        duplicateReason = 'link do IMSLP';
      } else if (existingComposer.wikipediaLink === wikipediaLink?.trim()) {
        duplicateReason = 'link da Wikipedia';
      }

      return NextResponse.json(
        {
          error: `Já existe um compositor com esse ${duplicateReason}: ${existingComposer.fullName}`,
        },
        { status: 409 }
      );
    }

    // Processar cargos secundários
    let finalRoles = roles;
    if (secondaryRoles && secondaryRoles.length > 0) {
      finalRoles = secondaryRoles.join(', ');
    }

    // Converter datas para formato de armazenamento (dd/mm/yyyy)
    const formattedBirthDate = formatDateForStorage(birthDate);
    const formattedDeathDate = formatDateForStorage(deathDate);

    // Criar o compositor
    const composer = await prisma.composer.create({
      data: {
        name: name.trim(),
        fullName: fullName.trim(),
        otherName: otherName?.trim() || null,
        alternativeNames: alternativeNames?.trim() || null,
        pseudonyms: pseudonyms?.trim() || null,
        birthDate: formattedBirthDate,
        deathDate: formattedDeathDate,
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

        // Campos para rastreamento
        createdBy: session.user.id,
        isCustom: dataSource === 'none',
        hasValidImage: !!portraitUrl,
        dataCompleteness: calculateDataCompleteness(body),
        lastVerified: new Date(),

        // Metadados da fonte
        dataSource: dataSource,
        pageQuality:
          dataSource !== 'none' ? body.pageQuality || 'medium' : null,
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

// PUT para atualizar compositor
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const composerId = url.pathname.split('/').pop();

    if (!composerId) {
      return NextResponse.json(
        { error: 'ID do compositor é obrigatório' },
        { status: 400 }
      );
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
      where: { id: composerId },
    });

    if (!existingComposer) {
      return NextResponse.json(
        { error: 'Compositor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões (apenas o criador ou admin pode editar)
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

    // Validações similares ao POST
    if (!name || !fullName || !epochId || !primaryRoleId) {
      return NextResponse.json(
        {
          error:
            'Campos obrigatórios: nome, nome completo, época e papel principal',
        },
        { status: 400 }
      );
    }

    // Validar formato de data se fornecido
    if (birthDate && !isValidDateFormatAPI(birthDate)) {
      return NextResponse.json(
        {
          error:
            'Data de nascimento deve estar no formato dd/mm/aaaa ou yyyy-mm-dd',
        },
        { status: 400 }
      );
    }

    if (deathDate && !isValidDateFormatAPI(deathDate)) {
      return NextResponse.json(
        {
          error: 'Data de morte deve estar no formato dd/mm/aaaa ou yyyy-mm-dd',
        },
        { status: 400 }
      );
    }

    // Validar que data de morte não é anterior ao nascimento
    if (birthDate && deathDate && !isValidDateRangeAPI(birthDate, deathDate)) {
      return NextResponse.json(
        {
          error: 'Data de morte não pode ser anterior à data de nascimento',
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
        id: { not: composerId }, // Excluir o compositor atual
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

    // Converter datas para formato de armazenamento (dd/mm/yyyy)
    const formattedBirthDate = formatDateForStorage(birthDate);
    const formattedDeathDate = formatDateForStorage(deathDate);

    // Atualizar o compositor
    const updatedComposer = await prisma.composer.update({
      where: { id: composerId },
      data: {
        name: name.trim(),
        fullName: fullName.trim(),
        otherName: otherName?.trim() || null,
        alternativeNames: alternativeNames?.trim() || null,
        pseudonyms: pseudonyms?.trim() || null,
        birthDate: formattedBirthDate,
        deathDate: formattedDeathDate,
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

// Função para validar formato de data para API (aceita dd/mm/yyyy e yyyy-mm-dd)
function isValidDateFormatAPI(dateString: string): boolean {
  if (!dateString) return true;

  // Formato yyyy-mm-dd (HTML5 date input)
  const htmlDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (htmlDateRegex.test(dateString)) {
    const date = new Date(dateString);
    const [year, month, day] = dateString.split('-').map(Number);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  // Formato dd/mm/yyyy
  const ddmmyyyyRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (ddmmyyyyRegex.test(dateString)) {
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  // Formato apenas ano
  const yearOnlyRegex = /^\d{4}$/;
  if (yearOnlyRegex.test(dateString)) {
    const year = parseInt(dateString);
    return year >= 1000 && year <= new Date().getFullYear() + 100;
  }

  return false;
}

// Função para validar range de datas
function isValidDateRangeAPI(birthDate: string, deathDate: string): boolean {
  if (!birthDate || !deathDate) return true;

  const birth = parseDate(birthDate);
  const death = parseDate(deathDate);

  if (!birth || !death) return false;

  return death >= birth;
}

// Função para fazer parse de data em diferentes formatos
function parseDate(dateString: string): Date | null {
  if (!dateString) return null;

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString);
  }

  // dd/mm/yyyy
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // yyyy
  if (/^\d{4}$/.test(dateString)) {
    return new Date(parseInt(dateString), 0, 1);
  }

  return null;
}

// Função para formatar data para armazenamento (sempre dd/mm/yyyy)
function formatDateForStorage(dateString: string): string | null {
  if (!dateString) return null;

  // Se está em formato yyyy-mm-dd, converter para dd/mm/yyyy
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  // Se já está em dd/mm/yyyy, retornar como está
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('/');
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Se é apenas ano, usar 01/01/yyyy
  if (/^\d{4}$/.test(dateString)) {
    return `01/01/${dateString}`;
  }

  return dateString;
}

// Função auxiliar para calcular completude dos dados (mantida igual)
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
