// app/api/admin/ads/check-conflict/route.ts - API corrigida com lógica simplificada
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

interface ConflictResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: string;
    constraint: string;
    message: string;
    conflictingAd: any;
    affectedFields: string[];
  }>;
  checkedConstraints: string[];
  summary: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ConflictResult | { error: string }>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 🆕 OBRIGATÓRIO agora
    const placement = searchParams.get('placement');
    const targetType = searchParams.get('targetType');
    const instrumentId = searchParams.get('instrumentId');
    const excludeId = searchParams.get('excludeId'); // Para edição
    const status = searchParams.get('status') || 'DRAFT';

    if (!type || !placement || !targetType) {
      return NextResponse.json(
        { error: 'Type, placement e targetType são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando conflitos com nova lógica:', {
      type,
      placement,
      targetType,
      instrumentId,
      excludeId,
      status,
    });

    const conflicts: ConflictResult['conflicts'] = [];
    const checkedConstraints: string[] = [];

    // 🔧 VERIFICAÇÃO ÚNICA: [type, placement, targetType, instrumentId]
    await checkMainConstraint(conflicts, checkedConstraints, {
      type,
      placement,
      targetType,
      instrumentId,
      excludeId,
      status,
    });

    // 🆕 VERIFICAÇÃO ADICIONAL: Apenas para status ACTIVE/SCHEDULED
    if (status === 'ACTIVE' || status === 'SCHEDULED') {
      await checkActiveConflicts(conflicts, checkedConstraints, {
        type,
        placement,
        targetType,
        instrumentId,
        excludeId,
        status,
      });
    }

    // 🆕 VERIFICAÇÃO DE LÓGICA DE NEGÓCIO
    await checkBusinessLogicConflicts(conflicts, checkedConstraints, {
      type,
      placement,
      targetType,
      instrumentId,
      excludeId,
      status,
    });

    const hasConflict = conflicts.length > 0;

    let summary = '';
    if (hasConflict) {
      summary = `⚠️ ${conflicts.length} conflito(s) encontrado(s): ${conflicts
        .map((c) => c.type)
        .join(', ')}`;
    } else {
      summary = `✅ Combinação válida: ${type} em ${placement} ${
        instrumentId ? 'para instrumento específico' : 'geral'
      }`;
    }

    console.log('📊 Resultado da verificação:', summary);

    return NextResponse.json({
      hasConflict,
      conflicts,
      checkedConstraints,
      summary,
    });
  } catch (error) {
    console.error('❌ Erro ao verificar conflitos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🔧 VERIFICAÇÃO PRINCIPAL: [type, placement, targetType, instrumentId]
async function checkMainConstraint(
  conflicts: ConflictResult['conflicts'],
  checkedConstraints: string[],
  params: any
) {
  const constraintName =
    'unique_ad_per_complete_combination [type, placement, targetType, instrumentId]';
  checkedConstraints.push(constraintName);

  const where: any = {
    type: params.type,
    placement: params.placement,
    targetType: params.targetType,
    instrumentId: params.instrumentId || null,
  };

  if (params.excludeId) {
    where.id = { not: params.excludeId };
  }

  console.log('🔍 Verificando constraint principal:', where);

  const existingAd = await prisma.advertisement.findFirst({
    where,
    include: {
      instrument: { select: { name: true } },
    },
  });

  if (existingAd) {
    const instrumentText = params.instrumentId
      ? `instrumento ${existingAd.instrument?.name}`
      : 'segmentação geral';

    const message = `Conflito encontrado: Já existe um anúncio do tipo "${params.type}" no posicionamento "${params.placement}" com ${instrumentText}. Cada combinação [tipo + posicionamento + segmentação] só pode ter um anúncio ativo.`;

    conflicts.push({
      type: 'CONSTRAINT_UNIQUE_COMBINATION',
      constraint: constraintName,
      message,
      conflictingAd: {
        id: existingAd.id,
        title: existingAd.title,
        status: existingAd.status,
        advertiserName: existingAd.advertiserName,
        type: existingAd.type,
        placement: existingAd.placement,
        targetType: existingAd.targetType,
        instrumentId: existingAd.instrumentId,
        instrumentName: existingAd.instrument?.name,
      },
      affectedFields: ['type', 'placement', 'targetType', 'instrumentId'],
    });
  }
}

// 🆕 VERIFICAÇÃO PARA ANÚNCIOS ATIVOS (adicional)
async function checkActiveConflicts(
  conflicts: ConflictResult['conflicts'],
  checkedConstraints: string[],
  params: any
) {
  const constraintName = 'business_rule_active_same_combination';
  checkedConstraints.push(constraintName);

  const where: any = {
    type: params.type,
    placement: params.placement,
    targetType: params.targetType,
    instrumentId: params.instrumentId || null,
    status: { in: ['ACTIVE', 'SCHEDULED'] },
  };

  if (params.excludeId) {
    where.id = { not: params.excludeId };
  }

  console.log('🔍 Verificando conflitos ACTIVE/SCHEDULED:', where);

  const existingAds = await prisma.advertisement.findMany({
    where,
    include: {
      instrument: { select: { name: true } },
    },
  });

  if (existingAds.length > 0) {
    const instrumentText = params.instrumentId
      ? `instrumento ${existingAds[0].instrument?.name}`
      : 'segmentação geral';

    const message = `Conflito de status: Já existe(m) ${existingAds.length} anúncio(s) ativo(s) ou agendado(s) com a mesma combinação (${params.type} + ${params.placement} + ${instrumentText}). Para ativar este anúncio, pause ou desative o conflitante.`;

    existingAds.forEach((existingAd, index) => {
      conflicts.push({
        type: 'BUSINESS_RULE_ACTIVE_SAME_COMBINATION',
        constraint: `${constraintName} #${index + 1}`,
        message: `${message} Anúncio ativo: "${existingAd.title}" (${existingAd.status})`,
        conflictingAd: {
          id: existingAd.id,
          title: existingAd.title,
          status: existingAd.status,
          advertiserName: existingAd.advertiserName,
          type: existingAd.type,
          placement: existingAd.placement,
          targetType: existingAd.targetType,
          instrumentId: existingAd.instrumentId,
          instrumentName: existingAd.instrument?.name,
        },
        affectedFields: [
          'type',
          'placement',
          'targetType',
          'instrumentId',
          'status',
        ],
      });
    });
  }
}

// 🆕 VERIFICAÇÃO DE LÓGICA DE NEGÓCIO
async function checkBusinessLogicConflicts(
  conflicts: ConflictResult['conflicts'],
  checkedConstraints: string[],
  params: any
) {
  const constraintName = 'business_logic_instrument_targeting';
  checkedConstraints.push(constraintName);

  // Verificação: Se é INSTRUMENT mas não tem instrumentId
  if (params.targetType === 'INSTRUMENT' && !params.instrumentId) {
    conflicts.push({
      type: 'BUSINESS_LOGIC_MISSING_INSTRUMENT',
      constraint: constraintName,
      message:
        'Erro de lógica: Tipo de segmentação é "INSTRUMENT" mas nenhum instrumento foi especificado.',
      conflictingAd: null,
      affectedFields: ['targetType', 'instrumentId'],
    });
  }

  // Verificação: Se não é INSTRUMENT mas tem instrumentId
  if (params.targetType !== 'INSTRUMENT' && params.instrumentId) {
    conflicts.push({
      type: 'BUSINESS_LOGIC_UNEXPECTED_INSTRUMENT',
      constraint: constraintName,
      message: `Erro de lógica: Tipo de segmentação é "${params.targetType}" mas um instrumento foi especificado. Instrumentos só devem ser especificados para targetType "INSTRUMENT".`,
      conflictingAd: null,
      affectedFields: ['targetType', 'instrumentId'],
    });
  }
}

// POST - Verificação detalhada para dados completos do anúncio
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role < 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const adData = await request.json();

    console.log('🔍 Verificação POST com dados completos:', adData);

    // 🔧 INCLUIR O TYPE nos parâmetros
    const searchParams = new URLSearchParams({
      type: adData.type || 'BANNER', // 🆕 OBRIGATÓRIO
      placement: adData.placement,
      targetType: adData.targetType,
      status: adData.status || 'DRAFT',
    });

    if (adData.instrumentId) {
      searchParams.append('instrumentId', adData.instrumentId);
    }

    if (adData.excludeId) {
      searchParams.append('excludeId', adData.excludeId);
    }

    // Reutilizar a lógica do GET
    const mockRequest = {
      url: `http://localhost?${searchParams.toString()}`,
    } as NextRequest;

    return await GET(mockRequest);
  } catch (error) {
    console.error('❌ Erro na verificação POST:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
