// app/api/uploads/score/route.ts - ATUALIZADO COM LÓGICA PERSONALIZADA
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
      workId,
      title,
      downloadUrl,
      fileSize,
      pageCount,
      fileFormat,
      editor,
      publisher,
      copyright,
      thumbnailUrl,
      notes,
      type,
      groupIndex,
      groupTitle,
      rating,
      ratingsCount,
      downloadCount,
      isCustom,
      customData,
      source, // 🆕 Adicionar source para diferenciar CUSTOM vs UPLOAD
    } = body;

    // Validação básica
    if (!workId || !title || !downloadUrl) {
      return NextResponse.json(
        {
          error: 'Campos obrigatórios: obra, título e URL do arquivo',
        },
        { status: 400 }
      );
    }

    // Verificar se a obra existe
    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        title: true,
        composer: { select: { name: true, fullName: true } },
      },
    });

    if (!work) {
      return NextResponse.json(
        {
          error: 'Obra não encontrada',
        },
        { status: 400 }
      );
    }

    // 🆕 Determinar source baseado no tipo de upload
    let scoreSource: 'CUSTOM' | 'UPLOAD' = 'CUSTOM';
    if (downloadUrl.startsWith('/uploads/')) {
      scoreSource = 'UPLOAD';
    } else if (source === 'UPLOAD') {
      scoreSource = 'UPLOAD';
    }

    // Gerar sourceId único para partituras personalizadas
    const sourceId = `${scoreSource.toLowerCase()}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Data atual no formato ISO
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const userName = session.user.name || session.user.email || 'Usuário';

    // Criar a partitura
    const score = await prisma.workScore.create({
      data: {
        workId,
        sourceId,
        source: scoreSource,
        title,
        downloadUrl,
        fileSize: fileSize || null,
        pageCount: pageCount || null,
        fileFormat: fileFormat || 'PDF',
        editor: editor || null,
        publisher: publisher || null,
        copyright: copyright || null,
        thumbnailUrl: thumbnailUrl || null,
        // 🆕 Campos específicos para partituras personalizadas
        uploadDate: currentDate,
        uploader: userName,
        uploadedBy: session.user.id,
        notes: notes || null,
        type: type || 'SCORES',
        groupIndex: groupIndex || 0,
        groupTitle: groupTitle || null,
        rating: rating || null,
        ratingsCount: ratingsCount || null,
        downloadCount: downloadCount || null,
        isCustom: true, // 🆕 Sempre true para partituras personalizadas
        customData,
        // Estados de controle
        isActive: true,
        processingStatus: 'COMPLETED',
        cacheVersion: '2.0-CUSTOM',
        // 🆕 Qualidade baseada na completude dos dados
        dataQuality: calculateDataQuality(
          fileSize,
          pageCount,
          editor,
          publisher
        ),
        verificationStatus: 'pending',
        // 🆕 Metadados para identificação
        lastVerified: new Date(),
        // 🆕 Priority baseado na completude
        priority: calculatePriority(fileSize, pageCount, editor, publisher),
      },
      include: {
        work: {
          select: {
            title: true,
            composer: { select: { name: true, fullName: true } },
          },
        },
      },
    });

    // Invalidar cache do usuário
    await revalidateUploadsCache(session.user.id);

    // 🆕 Log para debug
    console.log(`✅ [CUSTOM-SCORE] Nova partitura personalizada criada:`, {
      id: score.id,
      title: score.title,
      work: work.title,
      source: scoreSource,
      user: userName,
    });

    return NextResponse.json({
      success: true,
      score,
      message: `Partitura personalizada criada com sucesso`,
    });
  } catch (error) {
    console.error('❌ [CUSTOM-SCORE] Erro ao criar partitura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// 🆕 Função para calcular qualidade dos dados
function calculateDataQuality(
  fileSize?: string,
  pageCount?: string,
  editor?: string,
  publisher?: string
): 'high' | 'medium' | 'low' {
  let score = 0;

  if (fileSize) score += 1;
  if (pageCount) score += 1;
  if (editor) score += 1;
  if (publisher) score += 1;

  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

// 🆕 Função para calcular prioridade
function calculatePriority(
  fileSize?: string,
  pageCount?: string,
  editor?: string,
  publisher?: string
): number {
  let priority = 100; // Base priority

  if (fileSize) priority += 50;
  if (pageCount) priority += 30;
  if (editor) priority += 20;
  if (publisher) priority += 20;

  return priority;
}
