// app/api/work-scores/groups/route.ts - API para buscar grupos existentes de uma obra
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
}

interface GroupSuggestion {
  suggestedTitle: string;
  suggestedIndex: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
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

    console.log(
      `🔍 [GROUPS-API] Buscando grupos existentes para obra: ${workId}`
    );

    // 1️⃣ Buscar todas as partituras desta obra (incluindo do usuário)
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

    console.log(
      `📋 [GROUPS-API] Encontradas ${allWorkScores.length} partituras totais`
    );

    if (allWorkScores.length === 0) {
      return NextResponse.json({
        success: true,
        groups: [],
        userGroups: [],
        suggestions: [],
        hasExistingScores: false,
      });
    }

    // 2️⃣ Agrupar por groupIndex e groupTitle
    const groupsMap = new Map<string, ScoreGroup>();

    for (const score of allWorkScores) {
      const groupKey = `${score.groupIndex || 0}-${
        score.groupTitle || 'Sem Grupo'
      }`;
      const isUserUploaded = score.uploadedBy === userId;

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          groupIndex: score.groupIndex || 0,
          groupTitle: score.groupTitle || 'Sem Grupo',
          scoresCount: 0,
          scores: [],
          source: score.source,
          isUserUploaded,
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

      // Se tem pelo menos uma partitura do usuário, marcar como user uploaded
      if (isUserUploaded) {
        group.isUserUploaded = true;
      }
    }

    const allGroups = Array.from(groupsMap.values());
    const userGroups = allGroups.filter((group) => group.isUserUploaded);

    console.log(
      `📊 [GROUPS-API] Grupos encontrados: ${allGroups.length} total, ${userGroups.length} do usuário`
    );

    // 3️⃣ Gerar sugestões inteligentes baseadas nos padrões IMSLP
    const suggestions: GroupSuggestion[] = [];

    // 🧠 Análise inteligente dos grupos existentes
    const hasCompleteScore = allGroups.some(
      (g) =>
        g.groupTitle.toLowerCase().includes('complete') ||
        g.groupTitle.toLowerCase().includes('completa') ||
        g.groupTitle.toLowerCase().includes('full')
    );

    const hasIndividualParts = allGroups.some(
      (g) =>
        g.groupTitle.toLowerCase().includes('individual') ||
        g.groupTitle.toLowerCase().includes('separate') ||
        g.groupTitle.toLowerCase().includes('parts')
    );

    const hasArrangements = allGroups.some(
      (g) =>
        g.groupTitle.toLowerCase().includes('arrangement') ||
        g.groupTitle.toLowerCase().includes('arranjo')
    );

    // 🎯 Sugestões baseadas no padrão IMSLP
    if (hasCompleteScore && !hasIndividualParts) {
      suggestions.push({
        suggestedTitle: 'Partes Individuais',
        suggestedIndex: 1,
        reason:
          'Já existe uma partitura completa, esta pode ser uma parte individual',
        confidence: 'high',
      });
    }

    if (!hasCompleteScore && hasIndividualParts) {
      suggestions.push({
        suggestedTitle: 'Partitura Completa',
        suggestedIndex: 0,
        reason:
          'Existem partes individuais, esta pode ser a partitura completa',
        confidence: 'high',
      });
    }

    if (!hasArrangements && allGroups.length > 0) {
      suggestions.push({
        suggestedTitle: 'Arranjos',
        suggestedIndex: Math.max(...allGroups.map((g) => g.groupIndex)) + 1,
        reason: 'Criar nova seção para arranjos',
        confidence: 'medium',
      });
    }

    // Sugestão padrão se não há grupos
    if (allGroups.length === 0) {
      suggestions.push({
        suggestedTitle: 'Partitura Completa',
        suggestedIndex: 0,
        reason: 'Primeira partitura desta obra',
        confidence: 'high',
      });
    }

    return NextResponse.json({
      success: true,
      groups: allGroups,
      userGroups,
      suggestions,
      hasExistingScores: allGroups.length > 0,
      stats: {
        totalGroups: allGroups.length,
        userGroups: userGroups.length,
        totalScores: allWorkScores.length,
        userScores: allWorkScores.filter((s) => s.uploadedBy === userId).length,
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
