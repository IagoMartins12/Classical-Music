// app/api/auth/mobile/me/route.ts - Rota para buscar dados do usuário logado
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/libs/hybridAuth';

export const GET = withAuth(async (request: NextRequest, session) => {
  return NextResponse.json({
    success: true,
    user: session.user,
    authType: session.type,
  });
});
