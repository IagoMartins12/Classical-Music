// app/api/admin/coupons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

/**
 * GET /api/admin/coupons
 * Lista todos os cupons (apenas admins)
 */
export async function GET() {
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

    // Buscar todos os cupons
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular estatísticas
    const stats = {
      total: coupons.length,
      active: coupons.filter((c) => c.isActive).length,
      inactive: coupons.filter((c) => !c.isActive).length,
      expired: coupons.filter((c) => new Date(c.validUntil) < new Date())
        .length,
      totalUsed: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    };

    return NextResponse.json({
      success: true,
      coupons,
      stats,
    });
  } catch (error) {
    console.error('[GET /api/admin/coupons] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cupons' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/coupons
 * Cria um novo cupom (apenas admins)
 */
export async function POST(req: NextRequest) {
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

    // Validações
    if (!code || !type || discountValue === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Verificar se código já existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Código de cupom já existe' },
        { status: 400 }
      );
    }

    // Criar cupom
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        discountValue: parseFloat(discountValue),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        applicablePlans: applicablePlans || [],
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        maxUses: maxUses ? parseInt(maxUses) : null,
        maxUsesPerUser: parseInt(maxUsesPerUser) || 1,
        extraTrialDays: extraTrialDays ? parseInt(extraTrialDays) : null,
        description: description || null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({
      success: true,
      coupon,
      message: 'Cupom criado com sucesso!',
    });
  } catch (error) {
    console.error('[POST /api/admin/coupons] Error:', error);
    return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 });
  }
}
