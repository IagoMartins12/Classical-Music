// app/api/work-scores/groups/route.ts - API corrigida com agrupamento por usuário
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface ScoreGroup {
  groupIndex: number;
  groupTitle: string;
  scoresCount: number;
  scores: Array<{
    id: string;
    title: string;
    source: string;
    fileFormat: string;
    fileSize?: string | null;
    pageCount?: string | null;
  }>;
  source: 'IMSLP' | 'CUSTOM' | 'UPLOAD';
  isUserUploaded: boolean;
  uploadedBy?: string; // Para identificar o dono
}

interface GroupSuggestion {
  suggestedTitle: string;
  suggestedIndex: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'IMSLP' | 'USER_UPLOADED';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get('workId');
    const userId = session.user.id;

    if (!workId) {
      return NextResponse.json(
        { error: 'workId é obrigatório' },
        { status: 400 }
      );
    }

    // 1️⃣ Buscar todas as partituras desta obra
    const allWorkScores = await prisma.workScore.findMany({
      where: {
        workId,
        isActive: true,
      },
      orderBy: [{ groupIndex: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        source: true,
        sourceId: true,
        groupIndex: true,
        groupTitle: true,
        fileFormat: true,
        fileSize: true,
        pageCount: true,
        type: true,
        uploadedBy: true,
        createdAt: true,
      },
    });

    if (allWorkScores.length === 0) {
      return NextResponse.json({
        success: true,
        groups: [],
        userGroups: [],
        suggestions: [],
        hasExistingScores: false,
      });
    }

    // 2️⃣ Separar por fonte E por usuário
    const imslpScores = allWorkScores.filter(
      (score) => score.source === 'IMSLP'
    );
    const currentUserScores = allWorkScores.filter(
      (score) =>
        (score.source === 'CUSTOM' || score.source === 'UPLOAD') &&
        score.uploadedBy === userId
    );
    const otherUsersScores = allWorkScores.filter(
      (score) =>
        (score.source === 'CUSTOM' || score.source === 'UPLOAD') &&
        score.uploadedBy !== userId
    );

    // 3️⃣ Função para criar grupos por fonte/usuário
    const createGroupsFromScores = (
      scores: typeof allWorkScores,
      isUserUploaded: boolean,
      uploadedBy?: string
    ): ScoreGroup[] => {
      const groupsMap = new Map<string, ScoreGroup>();

      for (const score of scores) {
        const groupKey = `${score.groupIndex || 0}-${
          score.groupTitle || 'Sem Grupo'
        }`;

        if (!groupsMap.has(groupKey)) {
          groupsMap.set(groupKey, {
            groupIndex: score.groupIndex || 0,
            groupTitle: score.groupTitle || 'Sem Grupo',
            scoresCount: 0,
            scores: [],
            source: score.source,
            isUserUploaded,
            uploadedBy,
          });
        }

        const group = groupsMap.get(groupKey)!;
        group.scoresCount++;
        group.scores.push({
          id: score.id,
          title: score.title,
          source: score.source,
          fileFormat: score.fileFormat,
          fileSize: score.fileSize,
          pageCount: score.pageCount,
        });
      }

      return Array.from(groupsMap.values());
    };

    // 4️⃣ Criar grupos separados por fonte/usuário
    const imslpGroups = createGroupsFromScores(imslpScores, false);
    const userGroups = createGroupsFromScores(currentUserScores, true, userId);

    // Grupos de outros usuários (apenas para referência, não para seleção)
    const otherUsersGroupsMap = new Map<string, ScoreGroup[]>();
    for (const score of otherUsersScores) {
      const userKey = score.uploadedBy || 'unknown';
      if (!otherUsersGroupsMap.has(userKey)) {
        otherUsersGroupsMap.set(userKey, []);
      }
      // Não incluir na resposta, apenas para estatísticas
    }

    // 5️⃣ Gerar sugestões inteligentes baseadas nos grupos disponíveis para o usuário
    const suggestions: GroupSuggestion[] = [];
    const allUserAccessibleGroups = [...imslpGroups, ...userGroups];

    // 🧠 Análise inteligente dos grupos que o usuário pode acessar
    const hasCompleteScore = allUserAccessibleGroups.some(
      (g) =>
        g.groupTitle.toLowerCase().includes('complete') ||
        g.groupTitle.toLowerCase().includes('completa') ||
        g.groupTitle.toLowerCase().includes('full')
    );

    const hasIndividualParts = allUserAccessibleGroups.some(
      (g) =>
        g.groupTitle.toLowerCase().includes('individual') ||
        g.groupTitle.toLowerCase().includes('separate') ||
        g.groupTitle.toLowerCase().includes('parts')
    );

    const hasArrangements = allUserAccessibleGroups.some(
      (g) =>
        g.groupTitle.toLowerCase().includes('arrangement') ||
        g.groupTitle.toLowerCase().includes('arranjo')
    );

    // 🎯 Sugestões baseadas no padrão IMSLP (apenas para grupos do usuário)
    if (hasCompleteScore && !hasIndividualParts) {
      suggestions.push({
        suggestedTitle: 'Partes Individuais',
        suggestedIndex: Math.max(...userGroups.map((g) => g.groupIndex), 0) + 1,
        reason:
          'Já existe uma partitura completa, esta pode ser uma parte individual',
        confidence: 'high',
        source: 'USER_UPLOADED',
      });
    }

    if (!hasCompleteScore && hasIndividualParts) {
      suggestions.push({
        suggestedTitle: 'Partitura Completa',
        suggestedIndex: 0,
        reason:
          'Existem partes individuais, esta pode ser a partitura completa',
        confidence: 'high',
        source: 'USER_UPLOADED',
      });
    }

    if (!hasArrangements && allUserAccessibleGroups.length > 0) {
      const maxIndex = Math.max(
        ...allUserAccessibleGroups.map((g) => g.groupIndex),
        0
      );
      suggestions.push({
        suggestedTitle: 'Arranjos',
        suggestedIndex: maxIndex + 1,
        reason: 'Criar nova seção para arranjos',
        confidence: 'medium',
        source: 'USER_UPLOADED',
      });
    }

    // Sugestão padrão se não há grupos do usuário
    if (userGroups.length === 0) {
      suggestions.push({
        suggestedTitle: 'Partitura Completa',
        suggestedIndex: 0,
        reason: 'Primeira partitura sua para esta obra',
        confidence: 'high',
        source: 'USER_UPLOADED',
      });
    }

    return NextResponse.json({
      success: true,
      groups: imslpGroups, // Apenas grupos IMSLP (para referência)
      userGroups, // Apenas grupos do usuário atual (editáveis)
      suggestions,
      hasExistingScores: allWorkScores.length > 0,
      stats: {
        totalGroups: imslpGroups.length + userGroups.length,
        imslpGroups: imslpGroups.length,
        userGroups: userGroups.length,
        otherUsersGroups: otherUsersGroupsMap.size,
        totalScores: allWorkScores.length,
        userScores: currentUserScores.length,
        imslpScores: imslpScores.length,
        otherUsersScores: otherUsersScores.length,
      },
    });
  } catch (error) {
    console.error('❌ [GROUPS-API] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
