// app/libs/invoiceGenerator.ts
import {
  formatPrice,
  getPlanName,
  getBillingPeriodName,
} from './subscriptionConstants';

/**
 * Interface de dados da nota fiscal
 */
export interface InvoiceData {
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;

  // Cliente
  customerName: string;
  customerEmail: string;
  customerDocument: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZipCode?: string;

  // Serviço
  serviceName: string;
  serviceDescription: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;

  // Empresa
  companyName: string;
  companyDocument: string;
  companyAddress: string;

  // Payment info
  paymentMethod?: string;
  paidAt?: Date;
}

/**
 * Gera número único de nota fiscal
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  return `NF-${year}-${timestamp}${random}`;
}

/**
 * Gera HTML da nota fiscal para PDF
 */
export function generateInvoiceHTML(data: InvoiceData): string {
  const {
    invoiceNumber,
    issueDate,
    dueDate,
    customerName,
    customerEmail,
    customerDocument,
    customerAddress,
    customerCity,
    customerState,
    customerZipCode,
    serviceName,
    serviceDescription,
    amount,
    taxAmount,
    totalAmount,
    companyName,
    companyDocument,
    companyAddress,
    paymentMethod,
    paidAt,
  } = data;

  const isPaid = !!paidAt;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nota Fiscal - ${invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
          padding: 20px;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #6366f1;
        }
        
        .company-info h1 {
          font-size: 28px;
          color: #6366f1;
          margin-bottom: 5px;
        }
        
        .company-info p {
          font-size: 14px;
          color: #666;
        }
        
        .invoice-info {
          text-align: right;
        }
        
        .invoice-number {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        
        .invoice-status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          ${
            isPaid
              ? 'background: #10b981; color: white;'
              : 'background: #f59e0b; color: white;'
          }
        }
        
        .dates {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .date-box {
          padding: 15px;
          background: #f9fafb;
          border-radius: 6px;
        }
        
        .date-box label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .date-box .value {
          font-size: 16px;
          color: #333;
          margin-top: 5px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .info-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }
        
        .info-item label {
          font-size: 12px;
          color: #666;
          display: block;
          margin-bottom: 5px;
        }
        
        .info-item .value {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
        
        .service-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .service-table th {
          background: #f9fafb;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .service-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        
        .totals {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 14px;
        }
        
        .total-row.final {
          font-size: 18px;
          font-weight: bold;
          color: #6366f1;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .invoice-container {
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1>${companyName}</h1>
            <p>CNPJ: ${companyDocument}</p>
            <p>${companyAddress}</p>
          </div>
          <div class="invoice-info">
            <div class="invoice-number">${invoiceNumber}</div>
            <div class="invoice-status">${isPaid ? 'Pago' : 'Pendente'}</div>
          </div>
        </div>
        
        <!-- Dates -->
        <div class="dates">
          <div class="date-box">
            <label>Data de Emissão</label>
            <div class="value">${issueDate.toLocaleDateString('pt-BR')}</div>
          </div>
          <div class="date-box">
            <label>Data de Vencimento</label>
            <div class="value">${dueDate.toLocaleDateString('pt-BR')}</div>
          </div>
        </div>
        
        <!-- Customer Info -->
        <div class="section">
          <div class="section-title">Dados do Cliente</div>
          <div class="info-grid">
            <div class="info-item">
              <label>Nome</label>
              <div class="value">${customerName}</div>
            </div>
            <div class="info-item">
              <label>CPF/CNPJ</label>
              <div class="value">${customerDocument}</div>
            </div>
            <div class="info-item">
              <label>Email</label>
              <div class="value">${customerEmail}</div>
            </div>
            ${
              customerAddress
                ? `
            <div class="info-item">
              <label>Endereço</label>
              <div class="value">${customerAddress}${customerCity ? `, ${customerCity}` : ''}${customerState ? ` - ${customerState}` : ''}${customerZipCode ? ` - ${customerZipCode}` : ''}</div>
            </div>
            `
                : ''
            }
          </div>
        </div>
        
        <!-- Services -->
        <div class="section">
          <div class="section-title">Serviços</div>
          <table class="service-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th style="text-align: right;">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${serviceName}</strong><br>
                  <span style="color: #666; font-size: 12px;">${serviceDescription}</span>
                </td>
                <td style="text-align: right;">${formatPrice(amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Totals -->
        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatPrice(amount)}</span>
          </div>
          ${
            taxAmount > 0
              ? `
          <div class="total-row">
            <span>Impostos</span>
            <span>${formatPrice(taxAmount)}</span>
          </div>
          `
              : ''
          }
          <div class="total-row final">
            <span>Total</span>
            <span>${formatPrice(totalAmount)}</span>
          </div>
        </div>
        
        ${
          isPaid
            ? `
        <div class="section">
          <div class="section-title">Informações de Pagamento</div>
          <div class="info-grid">
            <div class="info-item">
              <label>Método de Pagamento</label>
              <div class="value">${paymentMethod || 'N/A'}</div>
            </div>
            <div class="info-item">
              <label>Data do Pagamento</label>
              <div class="value">${paidAt?.toLocaleDateString('pt-BR') || 'N/A'}</div>
            </div>
          </div>
        </div>
        `
            : ''
        }
        
        <!-- Footer -->
        <div class="footer">
          <p>Este documento é uma nota fiscal simplificada gerada eletronicamente.</p>
          <p>Para dúvidas, entre em contato: suporte@opusatlas.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Prepara dados da nota fiscal a partir de uma assinatura
 */
export function prepareInvoiceData(
  subscription: any,
  payment: any,
  user: any
): InvoiceData {
  const serviceName = `Assinatura ${getPlanName(subscription.planType)}`;
  const serviceDescription = subscription.billingPeriod
    ? `Plano ${getPlanName(subscription.planType)} - ${getBillingPeriodName(subscription.billingPeriod)}`
    : `Plano ${getPlanName(subscription.planType)}`;

  return {
    invoiceNumber: generateInvoiceNumber(),
    issueDate: new Date(),
    dueDate: payment.createdAt,

    customerName:
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    customerEmail: user.email,
    customerDocument: '000.000.000-00', // TODO: Buscar do usuário quando implementado
    customerAddress: user.city || undefined,
    customerCity: user.city || undefined,
    customerState: user.state || undefined,
    customerZipCode: undefined,

    serviceName,
    serviceDescription,
    amount: payment.amount,
    taxAmount: 0,
    totalAmount: payment.finalAmount,

    companyName: 'Opus Atlas Ltda',
    companyDocument: '00.000.000/0000-00',
    companyAddress: 'São Paulo, SP - Brasil',

    paymentMethod: payment.paymentMethod,
    paidAt: payment.paidAt,
  };
}
