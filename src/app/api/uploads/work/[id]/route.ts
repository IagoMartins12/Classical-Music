// app/api/uploads/work/[id]/route.ts - VERSÃO MELHORADA COM VALIDAÇÃO
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateUploadsCache } from '@/app/requests/upload';
import {
  filterValidCategories,
  VALID_PORTUGUESE_WORKGENRES,
} from '@/app/utils/valid-categories-and-genres';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const work = await prisma.work.findUnique({
      where: { id: params.id },
      include: {
        composer: { select: { name: true, fullName: true } },
        instrument: { select: { name: true } },
        epoch: { select: { name: true } },
      },
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = work.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json({ work });
  } catch (error) {
    console.error('Erro ao buscar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🔄 Atualizando obra:', params.id);
    console.log('📋 Categorias recebidas:', body.categoryNames);
    console.log('🎵 Gêneros recebidos:', body.workGenresArr);

    // Buscar obra existente
    const existingWork = await prisma.work.findUnique({
      where: { id: params.id },
    });

    if (!existingWork) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = existingWork.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Processar e validar categorias
    let processedCategoryNames: string[] = [];
    if (Array.isArray(body.categoryNames)) {
      processedCategoryNames = filterValidCategories(body.categoryNames);
    } else if (typeof body.categoryNames === 'string') {
      const categoryArray = body.categoryNames
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
      processedCategoryNames = filterValidCategories(categoryArray);
    }

    console.log('✅ Categorias válidas processadas:', processedCategoryNames);

    // Processar e validar gêneros
    let processedWorkGenres: string[] = [];
    if (Array.isArray(body.workGenresArr)) {
      processedWorkGenres = body.workGenresArr.filter((genre: string) => {
        const isValid = VALID_PORTUGUESE_WORKGENRES.has(
          genre.toLowerCase().trim()
        );
        if (!isValid) {
          console.log(`⚠️ Gênero inválido ignorado: ${genre}`);
        }
        return isValid;
      });
    } else if (typeof body.workGenresArr === 'string') {
      const genreArray = body.workGenresArr
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      processedWorkGenres = genreArray.filter((genre: string) => {
        const isValid = VALID_PORTUGUESE_WORKGENRES.has(
          genre.toLowerCase().trim()
        );
        if (!isValid) {
          console.log(`⚠️ Gênero inválido ignorado: ${genre}`);
        }
        return isValid;
      });
    }

    // Se não há gêneros válidos, manter os existentes ou usar "não definido"
    if (processedWorkGenres.length === 0) {
      processedWorkGenres =
        existingWork.workGenresArr.length > 0
          ? existingWork.workGenresArr
          : ['não definido'];
    }

    console.log('✅ Gêneros válidos processados:', processedWorkGenres);

    // Processar tags do IMSLP
    const processedImslpTags = Array.isArray(body.imslpTags)
      ? body.imslpTags
      : typeof body.imslpTags === 'string'
      ? body.imslpTags
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
      : [];

    // Atualizar obra
    const updatedWork = await prisma.work.update({
      where: { id: params.id },
      data: {
        ...body,
        categoryNames: processedCategoryNames,
        workGenresArr: processedWorkGenres,
        imslpTags: processedImslpTags,
        updatedAt: new Date(),
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
      },
      include: {
        composer: { select: { name: true, fullName: true } },
        instrument: { select: { name: true } },
        epoch: { select: { name: true } },
      },
    });

    console.log('✅ Obra atualizada com sucesso:', updatedWork.title);
    console.log('📊 Estatísticas da obra:');
    console.log(`   - Categorias: ${updatedWork.categoryNames.length}`);
    console.log(`   - Gêneros: ${updatedWork.workGenresArr.length}`);
    console.log(`   - Tags IMSLP: ${updatedWork.imslpTags.length}`);

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      work: updatedWork,
      message: 'Obra atualizada com sucesso',
      stats: {
        categoriesCount: updatedWork.categoryNames.length,
        genresCount: updatedWork.workGenresArr.length,
        tagsCount: updatedWork.imslpTags.length,
        validationChanges: {
          categoriesFiltered:
            body.categoryNames?.length - processedCategoryNames.length || 0,
          genresFiltered:
            body.workGenresArr?.length - processedWorkGenres.length || 0,
        },
      },
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar obra existente
    const existingWork = await prisma.work.findUnique({
      where: { id: params.id },
      include: {
        cachedScores: { select: { id: true } },
        annotations: { select: { id: true } },
        favoriteBy: { select: { id: true } },
        wantToLearners: { select: { id: true } },
        learners: { select: { id: true } },
      },
    });

    if (!existingWork) {
      return NextResponse.json(
        { error: 'Obra não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissões
    const isAdmin = session.user.role === 2;
    const isOwner = existingWork.createdBy === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Verificar se tem dados associados
    const hasAssociatedData =
      existingWork.cachedScores.length > 0 ||
      existingWork.annotations.length > 0 ||
      existingWork.favoriteBy.length > 0 ||
      existingWork.wantToLearners.length > 0 ||
      existingWork.learners.length > 0;

    if (hasAssociatedData && !isAdmin) {
      return NextResponse.json(
        {
          error:
            'Não é possível excluir obra com dados associados. Contate um administrador.',
        },
        { status: 400 }
      );
    }

    // Deletar obra (cascade irá deletar dados relacionados)
    await prisma.work.delete({
      where: { id: params.id },
    });

    await revalidateUploadsCache(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Obra excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
