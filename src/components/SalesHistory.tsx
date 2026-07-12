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
  FileText
} from 'lucide-react';

interface SalesHistoryProps {
  sales: Sale[];
  products: Product[];
  onCancelSale: (saleId: string) => void;
}

export default function SalesHistory({ sales, products, onCancelSale }: SalesHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  
  // Selected sale for detail modal
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Filter sales
  const filteredSales = useMemo(() => {
    return [...sales]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Newest first
      .filter(s => {
        // Search by Client Name or Sale ID
        const clientNameMatch = s.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const idMatch = s.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSearch = searchQuery === '' || clientNameMatch || idMatch;

        // Status match
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

        // Payment method match
        const matchesPayment = paymentFilter === 'all' || s.paymentMethod === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
      });
  }, [sales, searchQuery, statusFilter, paymentFilter]);

  // Payment method translation helper
  const paymentMethodLabels: Record<string, string> = {
    money: '💵 Dinheiro',
    card_credit: '💳 C. Crédito',
    card_debit: '💳 C. Débito',
    pix: '⚡ PIX',
    transfer: '🏦 Transf.'
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
      // Close detail modal if open
      setSelectedSale(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 id="sales-history-title" className="text-2xl font-bold tracking-tight text-slate-900">Histórico de Vendas</h1>
        <p className="text-sm text-slate-500 mt-1">Consulte todas as vendas efetuadas, veja detalhes de lucro por item ou efetue estornos de mercadoria.</p>
      </div>

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
            placeholder="Buscar por nome do cliente ou código da venda..."
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
            onChange={(e) => setStatusFilter(e.target.value as any)}
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

      {/* Sales List Table */}
      <div id="sales-table-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Nenhuma venda encontrada</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Não foram localizados registros correspondentes aos filtros selecionados na sua base de vendas.
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
                  const totalItems = sale.items.reduce((acc, item) => acc + item.quantity, 0);

                  return (
                    <tr 
                      key={sale.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isCancelled ? 'bg-rose-50/5 text-slate-400' : ''
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
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-600">
                        {totalItems} un
                      </td>

                      {/* Payment method */}
                      <td className="py-3 px-4 text-xs font-medium text-slate-600">
                        {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                      </td>

                      {/* Cost price total */}
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {sale.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      {/* Sold total */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      {/* Profit */}
                      <td className={`py-3 px-4 text-right font-mono font-extrabold ${
                        isCancelled ? 'text-slate-300' : 'text-emerald-600'
                      }`}>
                        {isCancelled ? '—' : sale.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-sm border border-rose-100">
                            <XCircle className="h-3 w-3 shrink-0" /> Cancelada
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
                            {item.quantity} un x {item.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                          {/* Financial transparency per item */}
                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            <span className="text-slate-400">Custo pago: {item.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            <span className="text-emerald-700 font-medium font-mono bg-emerald-50 px-1 rounded-sm border border-emerald-100">
                              Margem: {itemMargin.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <span className="font-bold font-mono text-slate-900 shrink-0">
                          {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                    {selectedSale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Valor Pago de Custo (Estoque):</span>
                  <span className="font-mono text-slate-700">
                    {selectedSale.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Lucro Líquido desta Venda:
                  </span>
                  <span className={`font-mono text-base ${selectedSale.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>
                    {selectedSale.status === 'cancelled' ? '—' : selectedSale.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
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
