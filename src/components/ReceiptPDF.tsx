import React, { useRef, useCallback } from 'react';
import generatePDF, { Margin } from 'react-to-pdf';
import { Download, Share2, FileText } from 'lucide-react';
import { SaleItem, PaymentMethod } from '../types';

export interface ReceiptData {
  saleId: string;
  date: Date;
  items: SaleItem[];
  clientName?: string;
  clientPhone?: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
}

interface ReceiptPDFProps {
  data: ReceiptData;
  trigger?: 'button' | 'auto';
  onGenerated?: () => void;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  money: 'Dinheiro',
  card_credit: 'Cartão de Crédito',
  card_debit: 'Cartão de Débito',
  pix: 'PIX',
  transfer: 'Transferência',
};

function ReceiptContent({ data }: { data: ReceiptData }) {
  let storeInfo: Record<string, string> = {};
  try {
    storeInfo = JSON.parse(localStorage.getItem('zm_store_info') || '{}');
  } catch {}

  const discountAmount = (data.subtotal * data.discount) / 100;

  let extraClientHtml = null;
  if (data.notes) {
    const match = data.notes.match(/\[client_data\](.*)/);
    if (match) {
      try {
        const clientData = JSON.parse(match[1]);
        extraClientHtml = (
          <>
            {clientData.channel && <div>Canal: {clientData.channel}</div>}
            {clientData.cpf && <div>CPF/CNPJ: {clientData.cpf}</div>}
            {clientData.email && <div>Email: {clientData.email}</div>}
            {clientData.address && <div>Endereço: {clientData.address}</div>}
          </>
        );
      } catch { /* ignore */ }
    }
  }

  return (
    <div style={{
      fontFamily: "'Courier New', monospace",
      padding: '15px',
      maxWidth: '350px',
      margin: '0 auto',
      fontSize: '12px',
      color: '#333',
      background: '#fff',
    }}>
      {/* Logo */}
      {storeInfo.logoUrl && (
        <div style={{ textAlign: 'center' }}>
          <img
            src={storeInfo.logoUrl}
            alt="Logo"
            style={{ maxWidth: 80, maxHeight: 80, margin: '0 auto 8px', display: 'block' }}
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Store info */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
        {storeInfo.name || 'ZM Store'}
      </div>
      {storeInfo.cnpj && <div style={{ textAlign: 'center', fontSize: 10 }}>CNPJ: {storeInfo.cnpj}</div>}
      {storeInfo.phone && <div style={{ textAlign: 'center', fontSize: 10 }}>{storeInfo.phone}</div>}
      {storeInfo.address && (
        <div style={{ textAlign: 'center', fontSize: 10 }}>
          {storeInfo.address} - {storeInfo.city || ''}/{storeInfo.state || ''}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '2px solid #333', margin: '8px 0' }} />
      <div style={{ textAlign: 'center', fontWeight: 'bold' }}>COMPROVANTE DE VENDA</div>
      <div style={{ borderTop: '2px solid #333', margin: '8px 0' }} />

      {/* Sale info */}
      <div style={{ margin: '8px 0' }}>
        <div style={{ fontSize: 10 }}>Venda: <span style={{ fontWeight: 'bold' }}>{data.saleId}</span></div>
        <div style={{ fontSize: 10 }}>
          Data: {data.date.toLocaleDateString('pt-BR')}{' '}
          {data.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
        {data.clientName && (
          <div style={{ fontSize: 10 }}>
            Cliente: <span style={{ fontWeight: 'bold' }}>{data.clientName}</span>
          </div>
        )}
        {data.clientPhone && <div style={{ fontSize: 10 }}>Tel: {data.clientPhone}</div>}
        <div style={{ fontSize: 10 }}>{extraClientHtml}</div>
      </div>

      {/* Items divider */}
      <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }} />

      {/* Items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ fontSize: 10, color: '#666' }}>
            <th style={{ textAlign: 'left', paddingBottom: 3 }}>Item</th>
            <th style={{ textAlign: 'center', paddingBottom: 3 }}>Qtd</th>
            <th style={{ textAlign: 'right', paddingBottom: 3 }}>Preço</th>
            <th style={{ textAlign: 'right', paddingBottom: 3 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '4px 0', borderBottom: '1px dashed #ddd', fontSize: 12 }}>
                {item.productName}
              </td>
              <td style={{ padding: '4px 0', borderBottom: '1px dashed #ddd', textAlign: 'center', fontSize: 12 }}>
                {item.quantity}x
              </td>
              <td style={{ padding: '4px 0', borderBottom: '1px dashed #ddd', textAlign: 'right', fontSize: 12 }}>
                R$ {item.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style={{ padding: '4px 0', borderBottom: '1px dashed #ddd', textAlign: 'right', fontSize: 12, fontWeight: 'bold' }}>
                R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }} />
      <div style={{ textAlign: 'right' }}>
        <div>
          Subtotal: R$ {data.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {data.discount > 0 && (
          <div style={{ color: '#e11d48' }}>
            Desconto ({data.discount}%): -R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
        <div style={{
          fontSize: 16,
          fontWeight: 'bold',
          borderTop: '2px solid #333',
          paddingTop: 5,
          marginTop: 5,
        }}>
          TOTAL: R$ {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Payment */}
      <div style={{ borderTop: '1px dashed #333', margin: '8px 0' }} />
      <div style={{ fontSize: 10 }}>
        Pagamento: <span style={{ fontWeight: 'bold' }}>
          {paymentMethodLabels[data.paymentMethod] || data.paymentMethod}
        </span>
      </div>

      {data.notes && !data.notes.startsWith('[client_data]') && (
        <div style={{ fontSize: 10, marginTop: 5 }}>
          <strong>Obs:</strong> {data.notes}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '2px solid #333', margin: '8px 0' }} />
      <div style={{ textAlign: 'center', marginTop: 15, fontSize: 10, color: '#666' }}>
        <div style={{ fontWeight: 'bold' }}>Obrigado pela preferência!</div>
        {storeInfo.notes && <div>{storeInfo.notes}</div>}
        <div style={{ marginTop: 5 }}>
          {storeInfo.name || 'ZM Store'} - {storeInfo.phone || ''}
        </div>
      </div>
    </div>
  );
}

export default function ReceiptPDF({ data, trigger = 'button' }: ReceiptPDFProps) {
  const targetRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!targetRef.current) return;
    await generatePDF(targetRef, {
      method: 'save',
      filename: `recibo-${data.saleId}.pdf`,
      resolution: 2,
      page: {
        margin: Margin.NONE,
        format: [80, 297] as any,
        orientation: 'portrait',
      },
      canvas: { mimeType: 'image/png', qualityRatio: 1 },
    });
  }, [data.saleId]);

  const handleShare = useCallback(async () => {
    if (!targetRef.current) return;
    const pdf = await generatePDF(targetRef, {
      method: 'build',
      resolution: 2,
      page: {
        margin: Margin.NONE,
        format: [80, 297] as any,
        orientation: 'portrait',
      },
      canvas: { mimeType: 'image/png', qualityRatio: 1 },
    });

    const blob = pdf.output('blob');
    const file = new File([blob], `recibo-${data.saleId}.pdf`, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Recibo ${data.saleId}`,
        });
      } catch { /* user cancelled */ }
    } else {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  }, [data.saleId]);

  if (trigger === 'auto') {
    return (
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={targetRef}>
          <ReceiptContent data={data} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={targetRef}>
          <ReceiptContent data={data} />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Baixar PDF
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          Compartilhar
        </button>
      </div>
    </>
  );
}

export { ReceiptContent };
export type { ReceiptPDFProps };
