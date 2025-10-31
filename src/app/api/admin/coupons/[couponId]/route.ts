// app/api/admin/coupons/[couponId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

/**
 * PUT /api/admin/coupons/[couponId]
 * Atualiza um cupom (apenas admins)
 */
export async function PUT(
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
    const body = await req.json();
    const {
      code,
      type,
      discountValue,
      maxDiscount,
      applicablePlans,
      validFrom,
      validUntil,
      maxUses,
      maxUsesPerUser,
      extraTrialDays,
      description,
      isActive,
    } = body;

    // Verificar se cupom existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    // Se mudou o código, verificar se não existe outro com o mesmo código
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: 'Código de cupom já existe' },
          { status: 400 }
        );
      }
    }

    // Atualizar cupom
    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        code: code ? code.toUpperCase() : undefined,
        type,
        discountValue:
          discountValue !== undefined ? parseFloat(discountValue) : undefined,
        maxDiscount:
          maxDiscount !== undefined
            ? maxDiscount
              ? parseFloat(maxDiscount)
              : null
            : undefined,
        applicablePlans:
          applicablePlans !== undefined ? applicablePlans : undefined,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        maxUses:
          maxUses !== undefined
            ? maxUses
              ? parseInt(maxUses)
              : null
            : undefined,
        maxUsesPerUser:
          maxUsesPerUser !== undefined ? parseInt(maxUsesPerUser) : undefined,
        extraTrialDays:
          extraTrialDays !== undefined
            ? extraTrialDays
              ? parseInt(extraTrialDays)
              : null
            : undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      coupon: updatedCoupon,
      message: 'Cupom atualizado com sucesso!',
    });
  } catch (error) {
    console.error('[PUT /api/admin/coupons/[couponId]] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cupom' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/coupons/[couponId]
 * Deleta um cupom (apenas admins)
 */
export async function DELETE(
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

    // Verificar se cupom existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        usages: true,
        subscriptions: true,
      },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se cupom foi usado
    if (existingCoupon.usedCount > 0) {
      return NextResponse.json(
        {
          error:
            'Não é possível deletar cupom que já foi usado. Desative-o ao invés disso.',
        },
        { status: 400 }
      );
    }

    // Deletar cupom
    await prisma.coupon.delete({
      where: { id: couponId },
    });

    return NextResponse.json({
      success: true,
      message: 'Cupom deletado com sucesso!',
    });
  } catch (error) {
    console.error('[DELETE /api/admin/coupons/[couponId]] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar cupom' },
      { status: 500 }
    );
  }
}
