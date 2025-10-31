// app/api/admin/coupons/[couponId]/toggle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

/**
 * PATCH /api/admin/coupons/[couponId]/toggle
 * Alterna status ativo/inativo de um cupom (apenas admins)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user || user.role < 1) {
      return NextResponse.json(
        { error: 'Sem permissão de administrador' },
        { status: 403 }
      );
    }

    const { couponId } = await params;

    // Buscar cupom
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    // Alternar status
    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        isActive: !coupon.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      isActive: updatedCoupon.isActive,
      message: updatedCoupon.isActive
        ? 'Cupom ativado com sucesso!'
        : 'Cupom desativado com sucesso!',
    });
  } catch (error) {
    console.error('[PATCH /api/admin/coupons/[couponId]/toggle] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao alterar status do cupom' },
      { status: 500 }
    );
  }
}
