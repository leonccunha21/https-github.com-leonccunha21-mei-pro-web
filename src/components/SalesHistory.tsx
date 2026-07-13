import React, { useState, useMemo } from 'react';
import { Sale, Product } from '../types';
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
  ShoppingCart
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface SalesHistoryProps {
  sales: Sale[];
  products: Product[];
  onCancelSale: (saleId: string) => void;
  onUpdateSale?: (updatedSale: Sale) => void;
}

export default function SalesHistory({ sales, products, onCancelSale, onUpdateSale }: SalesHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [showProductSummary, setShowProductSummary] = useState(false);
  const [showDebtors, setShowDebtors] = useState(false);
  
  // Date range state
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all' | 'custom'>('all');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Selected sale for detail modal
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Date range filter helper
  const isInDateRange = (dateStr: string): boolean => {
    const saleDate = new Date(dateStr);
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
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
  }, [sales, searchQuery, statusFilter, paymentFilter, dateRange, customStart, customEnd, showDebtors, paymentFilter]);

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
      totalProfit: completed.reduce((acc, s) => acc + s.profit, 0),
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
    const d = new Date(isoString);
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
    if (window.confirm(`Deseja confirmar o recebimento do pagamento desta venda?\n\nVenda: #${sale.id.substring(0, 8)}\nCliente: ${sale.clientName || 'Não informado'}\nValor: R$ ${sale.total.toFixed(2)}`)) {
      const updatedSale: Sale = { ...sale, status: 'completed' };
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
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:right;font-size:12px">R$ ${item.salePrice.toFixed(2)}</td>
        <td style="padding:4px 0;border-bottom:1px dashed #ddd;text-align:right;font-size:12px;font-weight:bold">R$ ${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    const saleDate = new Date(sale.date);

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
        <div class="total-row" style="font-size:16px;margin-top:5px">TOTAL: R$ ${sale.total.toFixed(2)}</div>
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
  const handleExportExcel = () => {
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
      'Lucro': sale.status === 'cancelled' ? 0 : sale.profit,
      'Status': sale.status === 'completed' ? 'Concluída' : sale.status === 'cancelled' ? 'Cancelada' : 'Pendente',
    }));

    // Add summary row
    rows.push({
      'Código': '',
      'Data': '',
      'Cliente': 'TOTAL',
      'Telefone': '',
      'Itens': '',
      'Produtos': '',
      'Pagamento': '',
      'Tipo': '',
      'Valor Pago (Custo)': summaryTotals.totalRevenue - summaryTotals.totalProfit,
      'Valor Vendido': summaryTotals.totalRevenue,
      'Lucro': summaryTotals.totalProfit,
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
      <div className="border-b border-slate-200 pb-5">
        <h1 id="sales-history-title" className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Histórico de Vendas</h1>
        <p className="text-sm text-slate-500 mt-1">Consulte todas as vendas efetuadas, veja detalhes de lucro por item ou efetue estornos de mercadoria.</p>
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

      {/* Action buttons row */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { setShowProductSummary(false); setShowDebtors(!showDebtors); }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
            showDebtors 
              ? 'bg-amber-50 border-amber-200 text-amber-700' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Devedores ({sales.filter(s => isDebtorSale(s)).length})
        </button>

        <button
          onClick={() => { setShowDebtors(false); setShowProductSummary(!showProductSummary); }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
            showProductSummary 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {showProductSummary ? 'Ocultar Resumo' : 'Ver Resumo por Produto'} ({productSummary.length} produtos)
        </button>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <FileDown className="h-4 w-4" />
          Exportar para Excel
        </button>
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
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2 px-4">#</th>
                  <th className="py-2 px-4">Produto</th>
                  <th className="py-2 px-4 text-center">Qtd Vendida</th>
                  <th className="py-2 px-4 text-right">Faturamento</th>
                  <th className="py-2 px-4 text-right">Custo</th>
                  <th className="py-2 px-4 text-right">Lucro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {productSummary.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-1.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-1.5 px-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-1.5 px-4 text-center font-mono">{item.qty}</td>
                    <td className="py-1.5 px-4 text-right font-mono">{formatCurrency(item.revenue)}</td>
                    <td className="py-1.5 px-4 text-right font-mono text-slate-500">{formatCurrency(item.cost)}</td>
                    <td className="py-1.5 px-4 text-right font-mono text-emerald-600 font-bold">{formatCurrency(item.revenue - item.cost)}</td>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Cód / Data</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4 text-center">Itens</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4 text-right">Valor Pago (Custo)</th>
                  <th className="py-3 px-4 text-right">Valor Vendido</th>
                  <th className="py-3 px-4 text-right">Lucro</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSales.map(sale => {
                  const isCancelled = sale.status === 'cancelled';
                  const isPending = sale.status === 'pending';
                  const totalItems = sale.items.reduce((acc, item) => acc + item.quantity, 0);

                  return (
                    <tr 
                      key={sale.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isCancelled ? 'bg-rose-50/5 text-slate-400' : ''
                      } ${
                        isPending ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      {/* ID / Date */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold block text-slate-400">#{sale.id.substring(0, 8)}</span>
                        <span className="text-xs text-slate-500 block mt-0.5">{formatDate(sale.date)}</span>
                      </td>

                      {/* Client info */}
                      <td className="py-3 px-4 font-semibold">
                        {sale.clientName ? (
                          <div>
                            <p className={isCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}>{sale.clientName}</p>
                            {sale.clientPhone && <p className="text-xs text-slate-400 font-mono mt-0.5">{sale.clientPhone}</p>}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Cliente não informado</span>
                        )}
                      </td>

                      {/* Items count */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-slate-700 block">{totalItems} un</span>
                        <span className="text-[10px] text-slate-400 block max-w-[180px] truncate mt-0.5" title={sale.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}>
                          {sale.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}
                        </span>
                      </td>

                      {/* Payment method */}
                      <td className="py-3 px-4 text-xs font-medium text-slate-600">
                        {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                      </td>

                      {/* Cost price total */}
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {formatCurrency(sale.totalCost)}
                      </td>

                      {/* Sold total */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(sale.total)}
                      </td>

                      {/* Profit */}
                      <td className={`py-3 px-4 text-right font-mono font-extrabold ${
                        isCancelled ? 'text-slate-300' : 'text-emerald-600'
                      }`}>
                        {isCancelled ? '—' : formatCurrency(sale.profit)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-sm border border-rose-100">
                            <XCircle className="h-3 w-3 shrink-0" /> Cancelada
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-sm border border-amber-200">
                            <AlertTriangle className="h-3 w-3 shrink-0" /> Pendente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-sm border border-emerald-100">
                            <CheckCircle className="h-3 w-3 shrink-0" /> Concluída
                          </span>
                        )}
                      </td>

                      {/* Details / Cancel Action */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isPending && (
                            <button
                              id={`confirm-payment-${sale.id}`}
                              onClick={() => handleConfirmPayment(sale)}
                              className="p-1.5 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                              title="Confirmar Pagamento"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            id={`details-${sale.id}`}
                            onClick={() => setSelectedSale(sale)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Ver Cupom / Detalhes"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          
                          {!isCancelled && (
                            <button
                              id={`cancel-${sale.id}`}
                              onClick={() => handleCancelClick(sale)}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                              title="Estornar / Cancelar venda"
                            >
                              <CornerUpLeft className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              
              {/* Summary Totals Row */}
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-200 text-sm">
                  <td colSpan={4} className="py-3 px-4 font-bold text-slate-700 uppercase text-xs tracking-wider">
                    {showDebtors 
                      ? `Total (${debtorSummary.count} ${debtorSummary.count === 1 ? 'venda' : 'vendas'} pendentes)`
                      : `Totais (${summaryTotals.totalCount} ${summaryTotals.totalCount === 1 ? 'venda' : 'vendas'} concluídas)`
                    }
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600 font-bold">
                    {showDebtors 
                      ? formatCurrency(filteredSales.reduce((acc, s) => acc + s.totalCost, 0))
                      : formatCurrency(summaryTotals.totalRevenue - summaryTotals.totalProfit)
                    }
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-900 font-black text-base">
                    {showDebtors 
                      ? formatCurrency(debtorSummary.total)
                      : formatCurrency(summaryTotals.totalRevenue)
                    }
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-black text-base">
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
                    className="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Confirmar Pagamento
                  </button>
                )}
                {selectedSale.status !== 'cancelled' && (
                  <button
                    id="refund-sale-btn"
                    onClick={() => handleCancelClick(selectedSale)}
                    className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <CornerUpLeft className="h-3.5 w-3.5" />
                    Estornar Transação
                  </button>
                )}
                <button
                  id="print-receipt-btn"
                  onClick={() => handlePrintReceipt(selectedSale)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir Recibo
                </button>
              </div>
              <button
                id="close-receipt-btn"
                onClick={() => setSelectedSale(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Fechar Comprovante
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
