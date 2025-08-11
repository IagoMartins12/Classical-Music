//api/works/[workId]/route.ts - CORRIGIDO
import prisma from '@/app/libs/prismadb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { workId: string } } // 🔥 PEGAR DOS PARAMS, NÃO SEARCHPARAMS
) {
  try {
    let workId: string | null = params.workId; // 🔥 AQUI ESTÁ O workId CORRETO

    if (!workId) {
      const { searchParams } = new URL(request.url);
      workId = searchParams.get('workId');
    }

    console.log('🔍 [API-WORKS] workId recebido:', workId);

    if (!workId) {
      console.log('❌ [API-WORKS] workId não fornecido');
      return NextResponse.json(
        { error: 'ID da obra é obrigatório.' },
        { status: 400 }
      );
    }

    // 🔥 BUSCAR DADOS COMPLETOS DA OBRA
    const work = await prisma.work.findFirst({
      where: {
        id: workId,
      },
      select: {
        id: true,
        title: true,
        imslpPermlink: true,
        composer: {
          select: {
            id: true,
            name: true,
            fullName: true,
          },
        },
        // Adicione outros campos que você precisa
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!work) {
      console.log('❌ [API-WORKS] Obra não encontrada:', workId);
      return NextResponse.json(
        { error: 'Obra não encontrada.' },
        { status: 404 }
      );
    }

    console.log('✅ [API-WORKS] Obra encontrada:', work.title);

    return NextResponse.json({
      success: true,
      ...work, // 🔥 RETORNAR DADOS COMPLETOS DA OBRA
    });
  } catch (error) {
    console.error('❌ [API-WORKS] Erro ao buscar obra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
