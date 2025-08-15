//api/works/[workId]/route.ts - CORRIGIDO
import prisma from '@/app/libs/prismadb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string }> } // 🔥 PEGAR DOS PARAMS, NÃO SEARCHPARAMS
) {
  try {
    const { workId } = await params;
    let workIdVariable: string | null = workId; // 🔥 AQUI ESTÁ O workId CORRETO

    if (!workIdVariable) {
      const { searchParams } = new URL(request.url);
      workIdVariable = searchParams.get('workId');
    }

    console.log('🔍 [API-WORKS] workId recebido:', workIdVariable);

    if (!workIdVariable) {
      console.log('❌ [API-WORKS] workId não fornecido');
      return NextResponse.json(
        { error: 'ID da obra é obrigatório.' },
        { status: 400 }
      );
    }

    // 🔥 BUSCAR DADOS COMPLETOS DA OBRA
    const work = await prisma.work.findFirst({
      where: {
        id: workIdVariable,
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
      console.log('❌ [API-WORKS] Obra não encontrada:', workIdVariable);
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
