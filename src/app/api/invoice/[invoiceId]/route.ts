// app/api/invoice/[invoiceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import {
  generateInvoiceHTML,
  prepareInvoiceData,
} from '@/app/libs/invoiceGenerator';

/**
 * GET /api/invoice/[invoiceId]
 * Retorna o HTML da nota fiscal para download/visualização
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { invoiceId } = await params;

    // Buscar invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
        payment: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é dono da nota fiscal
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Apenas o dono ou admin pode acessar
    if (invoice.subscription.userId !== user.id && user.role < 1) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar esta nota fiscal' },
        { status: 403 }
      );
    }

    // Se já tem PDF salvo, retornar URL
    if (invoice.pdfUrl) {
      return NextResponse.json({
        success: true,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
          status: invoice.status,
          paidAt: invoice.paidAt,
        },
        pdfUrl: invoice.pdfUrl,
      });
    }

    // Gerar HTML da nota fiscal
    const invoiceData = prepareInvoiceData(
      invoice.subscription,
      invoice.payment,
      invoice.subscription.user
    );

    const html = generateInvoiceHTML({
      ...invoiceData,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      amount: invoice.amount,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerDocument: invoice.customerDocument,
      customerAddress: invoice.customerAddress || undefined,
      customerCity: invoice.customerCity || undefined,
      customerState: invoice.customerState || undefined,
      customerZipCode: invoice.customerZipCode || undefined,
      paidAt: invoice.paidAt || undefined,
    });

    // Retornar HTML diretamente (pode ser renderizado no navegador)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="nota-fiscal-${invoice.invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/invoice/[invoiceId]] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar nota fiscal' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invoice/[invoiceId]?format=json
 * Retorna dados da nota fiscal em JSON
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { invoiceId } = await params;

    // Buscar invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
        payment: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissão
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (invoice.subscription.userId !== user.id && user.role < 1) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        status: invoice.status,
        amount: invoice.amount,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.totalAmount,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        customerDocument: invoice.customerDocument,
        description: invoice.description,
        pdfUrl: invoice.pdfUrl,
      },
      subscription: {
        planType: invoice.subscription.planType,
        billingPeriod: invoice.subscription.billingPeriod,
      },
      payment: {
        paymentMethod: invoice.payment.paymentMethod,
        status: invoice.payment.status,
        paidAt: invoice.payment.paidAt,
      },
    });
  } catch (error) {
    console.error('[POST /api/invoice/[invoiceId]] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar nota fiscal' },
      { status: 500 }
    );
  }
}
