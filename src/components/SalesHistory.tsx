import React, { useState, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Sale, Product, SaleItem } from '../types';
import ReceiptPDF from './ReceiptPDF';
import Pagination from './Pagination';
import { roundCurrency } from '../lib/currency';
import {
  Search,
  X,
  Calendar,
  User,
  CreditCard,
  CornerUpLeft,
  Info,
  Filter,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  FileDown,
  Printer,
  AlertTriangle,
  ShoppingCart,
  Trash2,
  Pencil
} from 'lucide-react';

interface SalesHistoryProps {
  sales: Sale[];
  products: Product[];
  onCancelSale: (saleId: string) => void;
  onDeleteSale?: (saleId: string) => void;
  onFixDates?: () => number;
  onUpdateSale?: (updatedSale: Sale) => void;
  onUpdateProduct?: (updatedProduct: Product) => void;
}

export default function SalesHistory({ sales, products, onCancelSale, onDeleteSale, onFixDates, onUpdateSale, onUpdateProduct }: SalesHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [showProductSummary, setShowProductSummary] = useState(false);
  const [showDebtors, setShowDebtors] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Date range state
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all' | 'custom'>('all');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Selected sale for detail modal
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [syncPrices, setSyncPrices] = useState(false);

  const emptySale: Sale = {
    id: '', date: '', items: [], total: 0, totalCost: 0, profit: 0,
    status: 'completed', paymentMethod: 'pix', saleType: 'CPF', createdAt: '',
  };
  const [editForm, setEditForm] = useState<Sale>(emptySale);

  // Converte a data da venda para Date LOCAL, tratando os 3 formatos possíveis:
  // - "AAAA-MM-DD" (vendas importadas, sem hora) -> meia-noite LOCAL (não UTC)
  // - "DD/MM/AAAA" ou "DD/MM/AAAA HH:MM" -> local
  // - ISO completo "AAAA-MM-DDTHH:MM:SS.sssZ" -> horário local correto
  const parseSaleDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const m1 = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m1) return new Date(+m1[1], +m1[2] - 1, +m1[3]);
    const m2 = String(dateStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m2) return new Date(+m2[3], +m2[2] - 1, +m2[1]);
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Date range filter helper
  const isInDateRange = (dateStr: string): boolean => {
    const saleDate = parseSaleDate(dateStr);
    if (!saleDate) return true;
    const now = new Date();
    if (dateRange === 'all') return true;
    if (dateRange === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return saleDate >= todayStart;
    }
    if (dateRange === '7days') {
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 7);
      cutoff.setHours(0, 0, 0, 0);
      return saleDate >= cutoff;
    }
    if (dateRange === '30days') {
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 30);
      cutoff.setHours(0, 0, 0, 0);
      return saleDate >= cutoff;
    }
    if (dateRange === 'custom') {
      const start = new Date(customStart + 'T00:00:00');
      const end = new Date(customEnd + 'T23:59:59');
      return saleDate >= start && saleDate <= end;
    }
    return true;
  };

  const isDebtorSale = (sale: Sale): boolean => {
    return sale.status === 'pending';
  };

  // Product sales summary
  const productSummary = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; cost: number }> = {};
    sales.filter(s => s.status === 'completed').forEach(sale => {
      sale.items.forEach(item => {
        const key = item.productName.toLowerCase();
        if (!map[key]) map[key] = { name: item.productName, qty: 0, revenue: 0, cost: 0 };
        map[key].qty += item.quantity;
        map[key].revenue += item.total;
        map[key].cost += item.costPrice * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [sales]);

  // Filter sales
  const filteredSales = useMemo(() => {
    if (showDebtors) {
      return [...sales]
        .sort((a, b) => (parseSaleDate(b.date)?.getTime() ?? 0) - (parseSaleDate(a.date)?.getTime() ?? 0))
        .filter(s => {
          if (!isInDateRange(s.date)) return false;
          if (!isDebtorSale(s)) return false;

          const clientNameMatch = s.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
          const idMatch = s.id.toLowerCase().includes(searchQuery.toLowerCase());
          const productNameMatch = s.items.some(item => 
            item.productName.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const matchesSearch = searchQuery === '' || clientNameMatch || idMatch || productNameMatch;

          const matchesPayment = paymentFilter === 'all' || s.paymentMethod === paymentFilter;

          return matchesSearch && matchesPayment;
        });
    }

    return [...sales]
      .sort((a, b) => (parseSaleDate(b.date)?.getTime() ?? 0) - (parseSaleDate(a.date)?.getTime() ?? 0))
      .filter(s => {
        // Date range match
        if (!isInDateRange(s.date)) return false;

        // Search by Client Name, Sale ID, or Product Name
        const clientNameMatch = s.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const idMatch = s.id.toLowerCase().includes(searchQuery.toLowerCase());
        const productNameMatch = s.items.some(item => 
          item.productName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesSearch = searchQuery === '' || clientNameMatch || idMatch || productNameMatch;

        // Status match
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

        // Payment method match
        const matchesPayment = paymentFilter === 'all' || s.paymentMethod === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
      });
  }, [sales, searchQuery, statusFilter, paymentFilter, dateRange, customStart, customEnd, showDebtors]);

  // Agrupa as vendas filtradas por dia (Hoje / Ontem / data), mantendo a ordem
  // cronológica decrescente dentro de cada grupo.
  const groupedSales = useMemo(() => {
    const groups: { label: string; key: string; sales: Sale[] }[] = [];
    const map = new Map<string, { label: string; sales: Sale[] }>();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    for (const s of filteredSales) {
      const d = parseSaleDate(s.date);
      if (!d) continue;
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const key = dayStart.toISOString().slice(0, 10);
      let label: string;
      if (dayStart.getTime() === today.getTime()) label = 'Hoje';
      else if (dayStart.getTime() === yesterday.getTime()) label = 'Ontem';
      else label = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      if (!map.has(key)) map.set(key, { label, sales: [] });
      map.get(key)!.sales.push(s);
    }
    // Ordem decrescente de dias
    Array.from(map.keys()).sort((a, b) => b.localeCompare(a)).forEach(k => {
      groups.push({ key: k, label: map.get(k)!.label, sales: map.get(k)!.sales });
    });
    return groups;
  }, [filteredSales]);

  // Pagination
  const totalSales = filteredSales.length;
  const totalPages = Math.ceil(totalSales / pageSize);
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    let count = 0;
    let skipped = 0;
    const result: typeof groupedSales = [];
    
    for (const group of groupedSales) {
      // Skip groups until we reach the start index
      if (skipped + group.sales.length <= startIndex) {
        skipped += group.sales.length;
        continue;
      }
      
      // Start adding sales from this group
      const groupStart = Math.max(0, startIndex - skipped);
      let added = 0;
      
      for (let i = groupStart; i < group.sales.length; i++) {
        if (count >= pageSize) break;
        added++;
        count++;
      }
      
      if (added > 0) {
        result.push({
          ...group,
          sales: group.sales.slice(groupStart, groupStart + added)
        });
      }
      
      if (count >= pageSize) break;
    }
    return result;
  }, [groupedSales, currentPage, pageSize]);

  // Debtor summary
  const debtorSummary = useMemo(() => {
    if (!showDebtors) return { total: 0, count: 0 };
    const total = filteredSales.reduce((acc, s) => acc + s.total, 0);
    return { total, count: filteredSales.length };
  }, [filteredSales, showDebtors]);

  // Summary totals (only completed)
  const summaryTotals = useMemo(() => {
    const completed = filteredSales.filter(s => s.status === 'completed');
    return {
      totalRevenue: completed.reduce((acc, s) => acc + s.total, 0),
      // Recalcula em vez de usar sale.profit gravado — consistente se custo foi alterado depois
      totalProfit: completed.reduce((acc, s) => acc + (s.total - s.totalCost), 0),
      totalCount: completed.length,
    };
  }, [filteredSales]);

  // Payment method translation helper
  const paymentMethodLabels: Record<string, string> = {
    money: '💵 Dinheiro',
    card_credit: '💳 C. Crédito',
    card_debit: '💳 C. Débito',
    pix: '⚡ PIX',
    transfer: '🏦 Transf.'
  };

  const paymentMethodLabelsPlain: Record<string, string> = {
    money: 'Dinheiro',
    card_credit: 'Cartão Crédito',
    card_debit: 'Cartão Débito',
    pix: 'PIX',
    transfer: 'Transferência'
  };

  const formatDate = (isoString: string) => {
    const d = parseSaleDate(isoString) || new Date();
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelClick = (sale: Sale) => {
    if (window.confirm(`ATENÇÃO: Deseja realmente CANCELAR esta venda?\n\nOs itens vendidos serão devolvidos automaticamente ao estoque.`)) {
      onCancelSale(sale.id);
      setSelectedSale(null);
    }
  };

  const handleConfirmPayment = (sale: Sale) => {
    if (window.confirm(`Deseja confirmar o recebimento do pagamento desta venda?\n\nVenda: #${sale.id.substring(0, 8)}\nCliente: ${sale.clientName || 'Não informado'}\nValor: R$ ${sale.total.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}`)) {
      const now = new Date().toISOString();
      const updatedSale: Sale = { ...sale, status: 'completed', paidAt: now, updatedAt: now };
      onUpdateSale?.(updatedSale);
    }
  };

  // Print receipt for a sale
  const handlePrintReceipt = (sale: Sale) => {
    let storeInfo: Record<string, string> = {};
    try { storeInfo = JSON.parse(localStorage.getItem('zm_store_info') || '{}'); } catch {}

    const itemsHtml = sale.items.map(item => `
      <tr>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;font-size:12px">${item.productName}</td>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:center;font-size:12px">${item.quantity}x</td>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:right;font-size:12px">R$ ${item.salePrice.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:right;font-size:12px;font-weight:bold">R$ ${item.total.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      </tr>
    `).join('');

    const saleDate = parseSaleDate(sale.date) || new Date();

    const receiptHtml = `
      <html><head><title>Recibo - #${sale.id.substring(0, 8)}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 15px; max-width: 350px; margin: 0 auto; font-size: 12px; color: #333; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #333; margin: 8px 0; }
        .line2 { border-top: 2px solid #333; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        .total-row { font-size: 14px; font-weight: bold; border-top: 2px solid #333; padding-top: 5px; }
        .footer { text-align: center; margin-top: 15px; font-size: 10px; color: #666; }
        @media print { body { padding: 5px; max-width: 100%; } }
      </style></head><body>
      ${storeInfo.logoUrl ? `<div class="center"><img src="${storeInfo.logoUrl}" alt="Logo" style="max-width:80px;max-height:80px;margin:0 auto 8px;display:block" /></div>` : ''}
      <div class="center bold" style="font-size:16px">${storeInfo.name || 'ZM Store'}</div>
      ${storeInfo.cnpj ? `<div class="center" style="font-size:10px">CNPJ: ${storeInfo.cnpj}</div>` : ''}
      ${storeInfo.phone ? `<div class="center" style="font-size:10px">${storeInfo.phone}</div>` : ''}
      ${storeInfo.address ? `<div class="center" style="font-size:10px">${storeInfo.address} - ${storeInfo.city || ''}/${storeInfo.state || ''}</div>` : ''}
      
      <div class="line2"></div>
      <div class="center bold">COMPROVANTE DE VENDA</div>
      <div class="line2"></div>
      
      <div style="margin:8px 0">
        <div style="font-size:10px">Venda: <span class="bold">#${sale.id.substring(0, 8)}</span></div>
        <div style="font-size:10px">Data: ${saleDate.toLocaleDateString('pt-BR')} ${saleDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
        ${sale.clientName ? `<div style="font-size:10px">Cliente: <span class="bold">${sale.clientName}</span></div>` : ''}
        ${sale.clientPhone ? `<div style="font-size:10px">Tel: ${sale.clientPhone}</div>` : ''}
      </div>

      <div class="line"></div>
      
      <table>
        <thead>
          <tr style="font-size:10px;color:#666">
            <th style="text-align:left;padding-bottom:3px">Item</th>
            <th style="text-align:center;padding-bottom:3px">Qtd</th>
            <th style="text-align:right;padding-bottom:3px">Preço</th>
            <th style="text-align:right;padding-bottom:3px">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="line"></div>
      
      <div style="text-align:right">
        <div class="total-row" style="font-size:16px;margin-top:5px">TOTAL: R$ ${sale.total.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</div>
      </div>
      
      <div class="line"></div>
      
      <div style="font-size:10px">
        <div>Pagamento: <span class="bold">${paymentMethodLabelsPlain[sale.paymentMethod] || sale.paymentMethod}</span></div>
      </div>

      ${sale.notes ? `<div style="font-size:10px;margin-top:5px"><strong>Obs:</strong> ${sale.notes}</div>` : ''}
      
      <div class="line2"></div>
      <div class="footer">
        <div class="bold">Obrigado pela preferência!</div>
        ${storeInfo.notes ? `<div>${storeInfo.notes}</div>` : ''}
        <div style="margin-top:5px">${storeInfo.name || 'ZM Store'} - ${storeInfo.phone || ''}</div>
      </div>
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `;

    const receiptWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (receiptWindow) {
      receiptWindow.document.write(receiptHtml);
      receiptWindow.document.close();
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const rows = filteredSales.map(sale => ({
      'Código': `#${sale.id.substring(0, 8)}`,
      'Data': formatDate(sale.date),
      'Cliente': sale.clientName || 'Não informado',
      'Telefone': sale.clientPhone || '',
      'Itens': sale.items.reduce((acc, item) => acc + item.quantity, 0),
      'Produtos': sale.items.map(i => `${i.productName} (${i.quantity}x)`).join(', '),
      'Pagamento': paymentMethodLabelsPlain[sale.paymentMethod] || sale.paymentMethod,
      'Tipo': sale.saleType || 'CPF',
      'ID Pedido': sale.ecommerceOrderId || '',
      'Valor Pago (Custo)': sale.totalCost,
      'Valor Vendido': sale.total,
      'Lucro': sale.status === 'cancelled' ? 0 : sale.total - sale.totalCost,
      'Status': sale.status === 'completed' ? 'Concluída' : sale.status === 'cancelled' ? 'Cancelada' : 'Pendente',
    }));

    // Add summary row — usa totalCost real em vez de fórmula derivada de profit
    const completedRows = filteredSales.filter(s => s.status === 'completed');
    const exportTotalCost = completedRows.reduce((acc, s) => acc + s.totalCost, 0);
    const exportTotalRevenue = completedRows.reduce((acc, s) => acc + s.total, 0);
    rows.push({
      'Código': '',
      'Data': '',
      'Cliente': 'TOTAL',
      'Telefone': '',
      'Itens': '',
      'Produtos': '',
      'Pagamento': '',
      'Tipo': '',
      'Valor Pago (Custo)': exportTotalCost,
      'Valor Vendido': exportTotalRevenue,
      'Lucro': exportTotalRevenue - exportTotalCost,
      'Status': `${summaryTotals.totalCount} vendas`,
    } as any);

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico de Vendas');
    XLSX.writeFile(wb, `historico_vendas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 id="sales-history-title" className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
            Histórico de Vendas
          </h1>
          <p className="text-sm text-slate-500 mt-1">Consulte todas as vendas efetuadas, veja detalhes de lucro por item ou efetue estornos de mercadoria.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setShowProductSummary(false); setShowDebtors(!showDebtors); }} className={`px-4 py-2 text-sm font-semibold rounded-lg border flex items-center justify-center gap-2 transition-colors cursor-pointer ${ showDebtors ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' }`}>
            <AlertTriangle className="h-4 w-4" />
            Devedores ({sales.filter(s => isDebtorSale(s)).length})
          </button>

          <button onClick={() => { setShowDebtors(false); setShowProductSummary(!showProductSummary); }} className={`px-4 py-2 text-sm font-semibold rounded-lg border flex items-center justify-center gap-2 transition-colors cursor-pointer ${ showProductSummary ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' }`}>
            {showProductSummary ? 'Ocultar Resumo' : 'Ver Resumo por Produto'} ({productSummary.length} produtos)
          </button>

          <button onClick={handleExportExcel} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <FileDown className="h-4 w-4" />
            Exportar para Excel
          </button>

          {onFixDates && (
            <button onClick={() => {
              const n = onFixDates();
              if (n > 0) toast.success(`${n} venda(s) com data corrigida(s) para o ano anterior.`);
              else toast('Nenhuma venda com data futura encontrada.');
            }} className="px-4 py-2 text-sm font-semibold rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center justify-center gap-2 transition-colors cursor-pointer" title="Corrige vendas cuja data está no futuro (relógio adiantado): mantém dia/mês e reduz o ano em 1.">
              <AlertTriangle className="h-4 w-4" />
              Corrigir datas
            </button>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200/50 self-start">
        {[
          { key: 'today' as const, label: 'Hoje' },
          { key: '7days' as const, label: '7 Dias' },
          { key: '30days' as const, label: '30 Dias' },
          { key: 'all' as const, label: 'Todas' },
          { key: 'custom' as const, label: 'Personalizado' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setDateRange(opt.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              dateRange === opt.key ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {dateRange === 'custom' && (
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="h-4 w-4 text-slate-400" />
          <label className="text-[10px] font-bold text-slate-500 uppercase">De:</label>
          <input
            type="date"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
          />
          <label className="text-[10px] font-bold text-slate-500 uppercase">Até:</label>
          <input
            type="date"
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
          />
        </div>
      )}

      {/* Filters section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="sales-search"
            type="text"
            placeholder="Buscar por cliente, produto ou código da venda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400"><Filter className="h-4 w-4" /></span>
          <select
            id="sales-status-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setShowDebtors(false); }}
            className="w-full py-2 px-3 text-sm bg-slate-50 text-slate-700 border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="completed">Concluídas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        {/* Payment method filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400"><CreditCard className="h-4 w-4" /></span>
          <select
            id="sales-payment-filter"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full py-2 px-3 text-sm bg-slate-50 text-slate-700 border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">Todas Formas de Pagamento</option>
            <option value="pix">PIX</option>
            <option value="money">Dinheiro</option>
            <option value="card_credit">Cartão de Crédito</option>
            <option value="card_debit">Cartão de Débito</option>
            <option value="transfer">Transferência Bancária</option>
          </select>
        </div>
      </div>

      {/* Debtor Summary Card */}
      {showDebtors && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Vendas com Pagamento Pendente</h3>
              <p className="text-xs text-amber-600 mt-0.5">Vendas que aguardam confirmação de recebimento.</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white/70 p-3 rounded-lg border border-amber-100">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Total em aberto</p>
              <p className="text-lg font-black text-amber-900 font-mono mt-0.5">{formatCurrency(debtorSummary.total)}</p>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-amber-100">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Nº de vendas pendentes</p>
              <p className="text-lg font-black text-amber-900 font-mono mt-0.5">{debtorSummary.count} {debtorSummary.count === 1 ? 'venda' : 'vendas'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Product Summary Table */}
      {showProductSummary && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Produtos Mais Vendidos (Resumo Geral)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Lista consolidada de todos os produtos vendidos com quantidades e valores.</p>
          </div>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">#</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Produto</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Qtd Vendida</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Faturamento</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Lucro</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {productSummary.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-100 align-middle font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 border-b border-slate-100 align-middle font-semibold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 border-b border-slate-100 align-middle text-center font-mono">{item.qty}</td>
                    <td className="px-4 py-3 border-b border-slate-100 align-middle text-right font-mono">{formatCurrency(item.revenue)}</td>
                    <td className="px-4 py-3 border-b border-slate-100 align-middle text-right font-mono text-emerald-600 font-bold">{formatCurrency(item.revenue - item.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales List Table */}
      <div id="sales-table-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {showDebtors ? 'Nenhuma venda pendente encontrada' : 'Nenhuma venda encontrada'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {showDebtors 
                ? 'Não há vendas com pagamento pendente para os filtros selecionados.'
                : 'Não foram localizados registros correspondentes aos filtros selecionados na sua base de vendas.'
              }
            </p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Cód / Data</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Cliente</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Produto / Itens</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 hidden md:table-cell">Pagamento</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Valor</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 hidden md:table-cell">Lucro</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Status</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Ações</th>
                </tr>
              </thead>
              {paginatedGroups.map(group => (
                <tbody key={group.key} className="text-sm">
                  <tr>
                    <td colSpan={8} className="px-3 py-2 bg-slate-100/70 border-b border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{group.label}</span>
                      <span className="text-xs text-slate-400 ml-2">{group.sales.length} {group.sales.length === 1 ? 'venda' : 'vendas'}</span>
                    </td>
                  </tr>
                {group.sales.map(sale => {
                  const isCancelled = sale.status === 'cancelled';
                  const isPending = sale.status === 'pending';
                  const totalItems = sale.items.reduce((acc, item) => acc + item.quantity, 0);

                  return (
                    <tr 
                      key={sale.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCancelled ? 'bg-rose-50/5 text-slate-400' : ''
                      } ${
                        isPending ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      {/* ID / Date */}
                      <td className="px-3 py-2.5 border-b border-slate-100 align-middle">
                        <span className="font-mono text-xs font-bold block text-slate-400">#{sale.id.substring(0, 8)}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{formatDate(sale.date)}</span>
                      </td>

                      {/* Client info */}
                      <td className="px-3 py-2.5 border-b border-slate-100 align-middle font-semibold text-xs">
                        {sale.clientName ? (
                          <div>
                            <p className={isCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}>{sale.clientName}</p>
                            {sale.clientPhone && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sale.clientPhone}</p>}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">—</span>
                        )}
                      </td>

                      {/* Produto / Itens (merged) */}
                      <td className="px-3 py-2.5 border-b border-slate-100 align-middle">
                        <span className="font-mono font-medium text-slate-700 block text-xs">{totalItems} un</span>
                        <span className="text-[10px] text-slate-400 block max-w-[180px] truncate mt-0.5" title={sale.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}>
                          {sale.items.map(i => `${i.productName}`).join(', ')}
                        </span>
                      </td>

                      {/* Payment method */}
                      <td className="px-3 py-2.5 border-b border-slate-100 align-middle text-[10px] font-medium text-slate-600 hidden md:table-cell">
                        {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                      </td>

                      {/* Sold total */}
                      <td className="px-3 py-2.5 border-b border-slate-100 align-middle text-right font-mono font-bold text-slate-900 text-xs">
                        {formatCurrency(sale.total)}
                      </td>

                      {/* Profit */}
                      <td className={`px-3 py-2.5 border-b border-slate-100 align-middle text-right font-mono font-extrabold text-xs hidden md:table-cell ${
                        isCancelled ? 'text-slate-300' : 'text-emerald-600'
                      }`}>
                        {isCancelled ? '—' : formatCurrency(sale.profit)}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5 border-b border-slate-100 align-middle text-center">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-sm border border-rose-100">
                            <XCircle className="h-2.5 w-2.5 shrink-0" /> Cancelada
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-sm border border-amber-200">
                            <AlertTriangle className="h-2.5 w-2.5 shrink-0" /> Pendente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-sm border border-emerald-100">
                            <CheckCircle className="h-2.5 w-2.5 shrink-0" /> OK
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2.5 border-b border-slate-100 align-middle text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          {isPending && (
                            <button
                              onClick={() => handleConfirmPayment(sale)}
                              className="p-1 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                              title="Confirmar Pagamento"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => { setEditingSale(sale); setSyncPrices(false); setEditForm(JSON.parse(JSON.stringify(sale))); }}
                            className="p-1 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors"
                            title="Editar venda"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                          
                          {!isCancelled && (
                            <button
                              onClick={() => handleCancelClick(sale)}
                              className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                              title="Cancelar venda"
                            >
                              <CornerUpLeft className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {onDeleteSale && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Apagar DEFINITIVAMENTE a venda #${sale.id.substring(0, 8)}?\n\nEsta ação não pode ser desfeita e a venda sumirá do histórico e de todos os cálculos.`)) {
                                  onDeleteSale(sale.id);
                                }
                              }}
                              className="p-1 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                              title="Apagar definitivamente"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              ))}
              
              {/* Summary Totals Row */}
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-200 text-sm">
                  <td colSpan={3} className="px-3 py-2.5 border-b border-slate-100 align-middle font-bold text-slate-700 uppercase text-xs tracking-wider">
                    {showDebtors 
                      ? `Total (${debtorSummary.count} ${debtorSummary.count === 1 ? 'venda' : 'vendas'} pendentes)`
                      : `Totais (${summaryTotals.totalCount} ${summaryTotals.totalCount === 1 ? 'venda' : 'vendas'} concluídas)`
                    }
                  </td>
                  <td className="px-4 py-3 border-b border-slate-100 align-middle text-right font-mono text-slate-600 font-bold">
                    {showDebtors 
                      ? formatCurrency(filteredSales.reduce((acc, s) => acc + s.totalCost, 0))
                      : formatCurrency(summaryTotals.totalRevenue - summaryTotals.totalProfit)
                    }
                  </td>
                  <td className="px-4 py-3 border-b border-slate-100 align-middle text-right font-mono text-slate-900 font-black text-base">
                    {showDebtors 
                      ? formatCurrency(debtorSummary.total)
                      : formatCurrency(summaryTotals.totalRevenue)
                    }
                  </td>
                  <td className="px-4 py-3 border-b border-slate-100 align-middle text-right font-mono text-emerald-600 font-black text-base">
                    {showDebtors 
                      ? formatCurrency(debtorSummary.total - filteredSales.reduce((acc, s) => acc + s.totalCost, 0))
                      : formatCurrency(summaryTotals.totalProfit)
                    }
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              totalItems={totalSales}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          </div>
          </>
        )}
      </div>

      {/* DETAIL MODAL (Receipt style) */}
      {selectedSale && (
        <div id="sale-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Comprovante de Venda</span>
                <h3 className="text-base font-black text-slate-900 mt-1">Código: #{selectedSale.id.toUpperCase()}</h3>
              </div>
              <button
                id="close-detail-btn"
                onClick={() => setSelectedSale(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              
              {/* Status Alert Banner inside receipt */}
              {selectedSale.status === 'cancelled' ? (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2 text-xs">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span className="font-bold">Esta transação foi estornada e cancelada. Itens devolvidos ao estoque físico.</span>
                </div>
              ) : selectedSale.status === 'pending' ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center gap-2 text-xs">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-bold">Esta transação aguarda confirmação de pagamento.</span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg flex items-center gap-2 text-xs">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold">Transação ativa, concluída com sucesso.</span>
                </div>
              )}

              {/* Client and Sale info block */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Identificação do Cliente</h4>
                  <p className="font-bold text-slate-800 mt-1 flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-400" />
                    {selectedSale.clientName || 'Cliente Geral (Não Identificado)'}
                  </p>
                  {selectedSale.clientPhone && (
                    <p className="text-slate-500 font-mono mt-1">{selectedSale.clientPhone}</p>
                  )}
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Dados da Transação</h4>
                  <p className="text-slate-700 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {formatDate(selectedSale.date)}
                  </p>
                  <p className="text-slate-700 mt-1 flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-slate-400" />
                    Meio: <span className="font-semibold">{paymentMethodLabels[selectedSale.paymentMethod] || selectedSale.paymentMethod}</span>
                  </p>
                  <p className="text-slate-700 mt-1 flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3 text-slate-400" />
                    Tipo: <span className={`font-semibold ${selectedSale.saleType === 'CNPJ' ? 'text-indigo-700' : 'text-emerald-700'}`}>{selectedSale.saleType || 'CPF'}</span>
                  </p>
                  {selectedSale.ecommerceOrderId && (
                    <p className="text-slate-700 mt-1 flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3 text-amber-500" />
                      Pedido: <span className="font-semibold text-amber-700">{selectedSale.ecommerceOrderId}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Itens da Compra</h4>
                <div className="space-y-2.5">
                  {selectedSale.items.map((item, idx) => {
                    const itemMargin = ((item.salePrice - item.costPrice) / item.salePrice) * 100;
                    return (
                      <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-100 pb-2">
                        <div className="min-w-0 flex-1 pr-4">
                          <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                          <p className="text-slate-400 font-mono mt-0.5">
                            {item.quantity} un x {formatCurrency(item.salePrice)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            <span className="text-slate-400">Custo pago: {formatCurrency(item.costPrice)}</span>
                            <span className="text-emerald-700 font-medium font-mono bg-emerald-50 px-1 rounded-sm border border-emerald-100">
                              Margem: {itemMargin.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <span className="font-bold font-mono text-slate-900 shrink-0">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {selectedSale.notes && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                  <p className="font-bold text-slate-700">Anotações da venda:</p>
                  <p className="mt-1 leading-relaxed">{selectedSale.notes}</p>
                </div>
              )}

              {/* Financial Summary of the Sale */}
              <div className="bg-slate-100 p-4 rounded-xl space-y-2 border border-slate-200">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Valor Vendido Bruto (Faturamento):</span>
                  <span className="font-mono text-slate-700 font-bold">
                    {formatCurrency(selectedSale.total)}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Valor Pago de Custo (Estoque):</span>
                  <span className="font-mono text-slate-700">
                    {formatCurrency(selectedSale.totalCost)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Lucro Líquido desta Venda:
                  </span>
                  <span className={`font-mono text-base ${selectedSale.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>
                    {selectedSale.status === 'cancelled' ? '—' : formatCurrency(selectedSale.profit)}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                {selectedSale.status === 'pending' && (
                  <button
                    id="confirm-payment-modal-btn"
                    onClick={() => { handleConfirmPayment(selectedSale); setSelectedSale(null); }}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg border border-amber-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Confirmar Pagamento
                  </button>
                )}
                {selectedSale.status !== 'cancelled' && (
                  <button
                    id="refund-sale-btn"
                    onClick={() => handleCancelClick(selectedSale)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold rounded-lg border border-rose-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <CornerUpLeft className="h-3.5 w-3.5" />
                    Estornar Transação
                  </button>
                )}
                <button
                  id="print-receipt-btn"
                  onClick={() => handlePrintReceipt(selectedSale)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir
                </button>
                <ReceiptPDF
                  data={{
                    saleId: selectedSale.id.substring(0, 8),
                    date: parseSaleDate(selectedSale.date) || new Date(),
                    items: selectedSale.items,
                    clientName: selectedSale.clientName,
                    clientPhone: selectedSale.clientPhone,
                    paymentMethod: selectedSale.paymentMethod,
                    subtotal: selectedSale.subtotal || selectedSale.total,
                    discount: selectedSale.discount || 0,
                    total: selectedSale.total,
                    notes: selectedSale.notes,
                  }}
                />
              </div>
              <button
                id="close-receipt-btn"
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Fechar Comprovante
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Editar Venda</span>
                <h3 className="text-base font-black text-slate-900 mt-1">#{editingSale.id.substring(0, 8)}</h3>
              </div>
              <button onClick={() => setEditingSale(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Client info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Cliente</label>
                  <input
                    type="text"
                    value={editForm.clientName || ''}
                    onChange={e => setEditForm({ ...editForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Telefone</label>
                  <input
                    type="text"
                    value={editForm.clientPhone || ''}
                    onChange={e => setEditForm({ ...editForm, clientPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              {/* Payment method & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Pagamento</label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                  >
                    <option value="pix">PIX</option>
                    <option value="money">Dinheiro</option>
                    <option value="card_credit">Cartão Crédito</option>
                    <option value="card_debit">Cartão Débito</option>
                    <option value="transfer">Transferência</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tipo</label>
                  <select
                    value={editForm.saleType}
                    onChange={e => setEditForm({ ...editForm, saleType: e.target.value as 'CPF' | 'CNPJ' })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </select>
                </div>
              </div>

              {/* Items table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Itens</label>
                  <button
                    onClick={() => {
                      const newItem: SaleItem = { productId: `edit_${Date.now()}`, productName: '', quantity: 1, costPrice: 0, salePrice: 0, total: 0 };
                      setEditForm({ ...editForm, items: [...editForm.items, newItem] });
                    }}
                    className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-colors"
                  >
                    + Item
</button>
            </div>
            </div>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {editForm.items.map((item, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={e => {
                            const newItems = [...editForm.items];
                            newItems[idx] = { ...newItems[idx], productName: e.target.value };
                            setEditForm({ ...editForm, items: newItems });
                          }}
                          className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-400"
                          placeholder="Nome do produto"
                        />
                        <button
                          onClick={() => {
                            const newItems = editForm.items.filter((_, i) => i !== idx);
                            setEditForm({ ...editForm, items: newItems });
                          }}
                          className="ml-1 p-1 hover:bg-rose-50 text-rose-500 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="text-[9px] text-slate-400 block">Qtd</label>
                          <input
                            type="number" min={1}
                            value={item.quantity}
                            onChange={e => {
                              const qty = Math.max(1, Number(e.target.value));
                              const newItems = [...editForm.items];
                              newItems[idx] = { ...newItems[idx], quantity: qty, total: qty * item.salePrice };
                              setEditForm({ ...editForm, items: newItems });
                            }}
                            className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block">Preço</label>
                          <input
                            type="number" min={0} step={0.01}
                            value={item.salePrice}
                            onChange={e => {
                              const sp = Number(e.target.value) || 0;
                              const newItems = [...editForm.items];
                              newItems[idx] = { ...newItems[idx], salePrice: sp, total: sp * item.quantity };
                              setEditForm({ ...editForm, items: newItems });
                            }}
                            className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block">Custo</label>
                          <input
                            type="number" min={0} step={0.01}
                            value={item.costPrice}
                            onChange={e => {
                              const newItems = [...editForm.items];
                              newItems[idx] = { ...newItems[idx], costPrice: Number(e.target.value) || 0 };
                              setEditForm({ ...editForm, items: newItems });
                            }}
                            className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-400"
                          />
                        </div>
                        <div className="flex items-end justify-end pb-1">
                          <span className="text-xs font-mono font-bold text-slate-700">{(item.salePrice * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live totals */}
              <div className="bg-slate-100 p-3 rounded-xl space-y-1.5 border border-slate-200">
                {(() => {
                  const newTotalCost = editForm.items.reduce((a, i) => a + i.costPrice * i.quantity, 0);
                  const newTotal = editForm.items.reduce((a, i) => a + i.salePrice * i.quantity, 0);
                  const newProfit = newTotal - newTotalCost;
                  return (<>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Custo Total:</span>
                      <span className="font-mono font-bold text-slate-700">{formatCurrency(newTotalCost)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Valor Venda:</span>
                      <span className="font-mono font-bold text-slate-900">{formatCurrency(newTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-950 pt-1.5 border-t border-slate-200">
                      <span>Lucro:</span>
                      <span className={`font-mono ${newProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(newProfit)}
                      </span>
                    </div>
                  </>);
                })()}
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={syncPrices}
                  onChange={e => setSyncPrices(e.target.checked)}
                  className="accent-indigo-600 w-3.5 h-3.5"
                />
                Atualizar preço no estoque também
              </label>
              <div className="flex items-center gap-2">
              <button onClick={() => setEditingSale(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={() => {
                  const newTotalCost = editForm.items.reduce((a, i) => a + i.costPrice * i.quantity, 0);
                  const newTotal = editForm.items.reduce((a, i) => a + i.salePrice * i.quantity, 0);
                  const updatedSale: Sale = {
                    ...editForm,
                    items: editForm.items.map(i => ({ ...i, total: i.salePrice * i.quantity })),
                    totalCost: roundCurrency(newTotalCost),
                    total: roundCurrency(newTotal),
                    profit: roundCurrency(newTotal - newTotalCost),
                    updatedAt: new Date().toISOString(),
                  };
                  // Ajusta estoque: compara itens antigos vs novos
                  if (onUpdateProduct && editingSale) {
                    const findProduct = (item: SaleItem) =>
                      products.find(p => p.id === item.productId) ||
                      products.find(p => p.name.toLowerCase().trim() === (item.productName || '').toLowerCase().trim());
                    const oldMap = new Map<string, { item: SaleItem; product: Product | undefined }>();
                    editingSale.items.forEach(item => {
                      const key = item.productId || item.productName;
                      oldMap.set(key, { item, product: findProduct(item) });
                    });
                    const newMap = new Map<string, { item: SaleItem; product: Product | undefined }>();
                    editForm.items.forEach(item => {
                      const key = item.productId || item.productName;
                      newMap.set(key, { item, product: findProduct(item) });
                    });
                    // Produtos que sumiram (removidos) → devolver estoque
                    for (const [key, { item, product }] of oldMap) {
                      if (!newMap.has(key) && product) {
                        onUpdateProduct({ ...product, stock: product.stock + item.quantity });
                      }
                    }
                    // Produtos novos (adicionados) → deduzir estoque
                    for (const [key, { item, product }] of newMap) {
                      if (!oldMap.has(key) && product) {
                        onUpdateProduct({ ...product, stock: Math.max(0, product.stock - item.quantity) });
                      }
                    }
                    // Produtos em ambos → ajustar pela diferença
                    for (const [key, { item: oldItem, product }] of oldMap) {
                      const newEntry = newMap.get(key);
                      if (newEntry && product) {
                        const diff = oldItem.quantity - newEntry.item.quantity;
                        if (diff !== 0) {
                          onUpdateProduct({ ...product, stock: Math.max(0, product.stock + diff) });
                        }
                      }
                    }
                    // Sincroniza precos (so se syncPrices estiver ativo)
                    if (syncPrices) {
                      editForm.items.forEach(item => {
                        const product = findProduct(item);
                        if (!product) return;
                        const changes: Partial<Product> = {};
                        if (item.salePrice !== product.salePrice) changes.salePrice = item.salePrice;
                        if (item.costPrice !== product.costPrice) changes.costPrice = item.costPrice;
                        if (Object.keys(changes).length > 0) {
                          onUpdateProduct({ ...product, ...changes });
                        }
                      });
                    }
                  }
                  onUpdateSale?.(updatedSale);
                  setEditingSale(null);
                  toast.success('Venda atualizada com sucesso!');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
