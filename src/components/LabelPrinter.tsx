import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Product } from '../types';
import { X, Printer, Download, CheckSquare, Square, Tag } from 'lucide-react';
import generatePDF, { Margin } from 'react-to-pdf';

interface LabelPrinterProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

interface LabelItem {
  product: Product;
  quantity: number;
  qrDataUrl: string;
  barcodeDataUrl: string;
}

function ProductLabel({ item }: { item: LabelItem }) {
  return (
    <div style={{
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '8px',
      width: '170px',
      height: '100px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontSize: 10,
      fontFamily: "'Arial', sans-serif",
      background: '#fff',
      pageBreakInside: 'avoid',
    }}>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: 11, lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.product.name}
        </div>
        {item.product.category && (
          <div style={{ color: '#6b7280', fontSize: 9, marginTop: 1 }}>{item.product.category}</div>
        )}
      </div>

      <div style={{ fontWeight: 'bold', fontSize: 14, color: '#059669' }}>
        R$ {item.product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
        <svg ref={(el) => {
          if (el && !el.querySelector('rect')) {
            try {
              JsBarcode(el, item.product.code || 'SEM-CODIGO', {
                format: 'CODE128',
                width: 1.2,
                height: 25,
                displayValue: true,
                fontSize: 8,
                margin: 0,
              });
            } catch { /* invalid code */ }
          }
        }} style={{ maxWidth: 80, maxHeight: 30 }} />
        <img src={item.qrDataUrl} alt="QR" style={{ width: 30, height: 30 }} />
      </div>
    </div>
  );
}

export default function LabelPrinter({ products, isOpen, onClose }: LabelPrinterProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [labelItems, setLabelItems] = useState<LabelItem[]>([]);
  const [copies, setCopies] = useState(1);
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const allSelected = selectedIds.size === products.length && products.length > 0;
  const someSelected = selectedIds.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const toggleProduct = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!isOpen || selectedIds.size === 0) {
      setLabelItems([]);
      return;
    }

    let cancelled = false;
    const selected = products.filter(p => selectedIds.has(p.id));

    Promise.all(selected.map(async (product) => {
      const qrDataUrl = await QRCode.toDataURL(product.code || product.id, {
        width: 60,
        margin: 0,
      });
      return { product, quantity: 1, qrDataUrl, barcodeDataUrl: '' };
    })).then(items => {
      if (!cancelled) {
        const expanded: LabelItem[] = [];
        items.forEach(item => {
          for (let i = 0; i < copies; i++) {
            expanded.push({ ...item });
          }
        });
        setLabelItems(expanded);
      }
    });

    return () => { cancelled = true; };
  }, [isOpen, selectedIds, copies, products]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!printRef.current) return;
    setGenerating(true);
    try {
      await generatePDF(printRef, {
        method: 'save',
        filename: 'etiquetas-produtos.pdf',
        resolution: 2,
        page: {
          margin: Margin.MEDIUM,
          format: 'a4',
          orientation: 'portrait',
        },
        canvas: { mimeType: 'image/png', qualityRatio: 1 },
      });
    } finally {
      setGenerating(false);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-slate-800">Etiquetas de Produtos</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 cursor-pointer"
            >
              {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {allSelected ? 'Desmarcar todas' : 'Selecionar todas'}
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Cópias:</span>
              <input
                type="number"
                min={1}
                max={10}
                value={copies}
                onChange={e => setCopies(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-center text-sm"
              />
            </div>

            <span className="text-xs text-slate-400">
              {selectedIds.size} produto(s) selecionado(s) × {copies} cópia(s) = {labelItems.length} etiqueta(s)
            </span>
          </div>

          {/* Product selection grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {products.filter(p => !p.archived).map(product => (
              <label
                key={product.id}
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  selectedIds.has(product.id)
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(product.id)}
                  onChange={() => toggleProduct(product.id)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{product.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{product.code || 'Sem código'}</div>
                </div>
                <div className="text-sm font-bold text-emerald-600">
                  R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </label>
            ))}
          </div>

          {/* Label preview */}
          {labelItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Pré-visualização</h3>
              <div
                ref={printRef}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  justifyContent: 'flex-start',
                }}
              >
                {labelItems.map((item, i) => (
                  <React.Fragment key={`${item.product.id}-${i}`}>
                    <ProductLabel item={item} />
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button
            onClick={handlePrint}
            disabled={labelItems.length === 0}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={labelItems.length === 0 || generating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {generating ? 'Gerando...' : 'Baixar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
