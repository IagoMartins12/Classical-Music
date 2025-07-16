import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const instruments = await prisma.instrument.findMany();
    return NextResponse.json(instruments);
  } catch (error) {
    console.error('Erro ao buscar compositores (GET):', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
