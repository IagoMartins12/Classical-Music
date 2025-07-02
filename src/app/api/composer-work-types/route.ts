// app/api/composer-work-types/route.ts - API para contagens dos workTypes
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const { composerId } = await request.json();

    // Validação básica
    if (!composerId) {
      return NextResponse.json(
        { error: 'Compositor ID é obrigatório' },
        { status: 400 }
      );
    }

    // Validação do ID do compositor (MongoDB ObjectId)
    if (typeof composerId !== 'string' || composerId.length !== 24) {
      return NextResponse.json(
        { error: 'ID do compositor inválido' },
        { status: 400 }
      );
    }

    // Buscar contagens agrupadas por workType
    const workTypeCounts = await prisma.work.groupBy({
      by: ['workType'],
      where: {
        composerId: composerId,
      },
      _count: {
        workType: true,
      },
    });

    // Transformar em objeto { workType: count }
    const countsObject: Record<string, number> = {};
    workTypeCounts.forEach((item) => {
      if (item.workType) {
        countsObject[item.workType] = item._count.workType;
      }
    });

    return NextResponse.json({
      workTypeCounts: countsObject,
      totalTypes: workTypeCounts.length,
    });
  } catch (error) {
    console.error('Erro na API de work-types do compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET method para compatibilidade
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const composerId = searchParams.get('composerId');

    if (!composerId) {
      return NextResponse.json(
        { error: 'Compositor ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar contagens agrupadas por workType
    const workTypeCounts = await prisma.work.groupBy({
      by: ['workType'],
      where: {
        composerId: composerId,
      },
      _count: {
        workType: true,
      },
    });

    // Transformar em objeto { workType: count }
    const countsObject: Record<string, number> = {};
    workTypeCounts.forEach((item) => {
      if (item.workType) {
        countsObject[item.workType] = item._count.workType;
      }
    });

    return NextResponse.json({
      workTypeCounts: countsObject,
      totalTypes: workTypeCounts.length,
    });
  } catch (error) {
    console.error('Erro na API GET de work-types do compositor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
