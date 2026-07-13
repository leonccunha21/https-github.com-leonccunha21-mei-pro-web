import React, { useState, useMemo } from 'react';
import { Sale, Loan } from '../types';
import {
  User,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Phone,
  FileText,
  X,
  Check,
  AlertTriangle,
  HandCoins,
  Plus,
  Trash2
} from 'lucide-react';

interface DebtorsProps {
  sales: Sale[];
  loans: Loan[];
  onUpdateSale: (sale: Sale) => void;
  onSaveLoans: (loans: Loan[]) => void;
}

export default function Debtors({ sales, loans, onUpdateSale, onSaveLoans }: DebtorsProps) {
  const [view, setView] = useState<'debits' | 'loans'>('debits');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
  const [partialAmount, setPartialAmount] = useState<string>('');

  // Loans (empréstimos)
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanForm, setLoanForm] = useState<Loan | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanPartial, setLoanPartial] = useState<string>('');

  const debtSales = useMemo(() => {
    return sales.filter(s => {
      if (filterStatus === 'pending') return s.status === 'pending';
      if (filterStatus === 'completed') return s.status === 'completed' && s.clientName;
      return s.status === 'pending' || (s.status === 'completed' && s.clientName);
    }).filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.clientName?.toLowerCase().includes(q) ||
        s.clientPhone?.includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [sales, searchQuery, filterStatus]);

  const totalPending = useMemo(() => {
    return debtSales
      .filter(s => s.status === 'pending')
      .reduce((acc, s) => acc + s.total, 0);
  }, [debtSales]);

  const countPending = useMemo(() => {
    return sales.filter(s => s.status === 'pending').length;
  }, [sales]);

  const handleConfirmPayment = (sale: Sale) => {
    if (window.confirm(`Confirmar pagamento de ${sale.clientName || 'Cliente'} no valor de R$ ${sale.total.toFixed(2)}?`)) {
      onUpdateSale({ ...sale, status: 'completed', paidAt: new Date().toISOString() });
      setSelectedSale(null);
    }
  };

  const handlePartialPayment = (sale: Sale, amount: number) => {
    if (!(amount > 0)) return;
    const paid = (sale.paidAmount || 0) + amount;
    const concluded = paid >= sale.total;
    onUpdateSale({
      ...sale,
      paidAmount: paid,
      status: concluded ? 'completed' : 'pending',
      paidAt: concluded ? new Date().toISOString() : sale.paidAt
    });
    setPartialAmount('');
  };

  const handleConclude = (sale: Sale) => {
    if (window.confirm(`Concluir débito de ${sale.clientName || 'Cliente'} no valor de R$ ${sale.total.toFixed(2)}?`)) {
      onUpdateSale({ ...sale, status: 'completed', paidAmount: sale.total, paidAt: new Date().toISOString() });
      setSelectedSale(null);
    }
  };

  const handleSetInstallments = (sale: Sale, value: number) => {
    onUpdateSale({ ...sale, installments: value > 0 ? value : undefined });
  };

  // --- Loans (empréstimos) ---
  const loanTotal = (l: Loan) => l.principal + l.interest;
  const loanRemaining = (l: Loan) => Math.max(0, loanTotal(l) - (l.paidAmount || 0));

  const openLoanForm = () => {
    const today = new Date();
    const due = new Date(); due.setDate(due.getDate() + 30);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    setLoanForm({
      id: '', borrowerName: '', borrowerPhone: '',
      loanDate: iso(today), dueDate: iso(due),
      principal: 0, interest: 0, status: 'open', createdAt: new Date().toISOString()
    });
    setShowLoanForm(true);
  };

  const saveLoan = () => {
    if (!loanForm) return;
    const name = loanForm.borrowerName.trim();
    if (!name || loanForm.principal <= 0) return;
    if (loanForm.id) {
      onSaveLoans(loans.map(l => l.id === loanForm.id ? loanForm : l));
    } else {
      onSaveLoans([{ ...loanForm, id: `emp_${Date.now()}`, borrowerName: name, status: 'open', createdAt: new Date().toISOString() }, ...loans]);
    }
    setShowLoanForm(false);
    setLoanForm(null);
  };

  const handleLoanPartial = (loan: Loan, amount: number) => {
    if (!(amount > 0)) return;
    const paid = (loan.paidAmount || 0) + amount;
    const concluded = paid >= loanTotal(loan);
    onSaveLoans(loans.map(l => l.id === loan.id ? {
      ...l, paidAmount: paid, status: concluded ? 'paid' : 'open'
    } : l));
    setLoanPartial('');
  };

  const handleLoanPay = (loan: Loan) => {
    onSaveLoans(loans.map(l => l.id === loan.id ? { ...l, paidAmount: loanTotal(l), status: 'paid' as const } : l));
    setSelectedLoan(null);
  };

  const removeLoan = (id: string) => {
    if (!window.confirm('Remover este empréstimo do registro?')) return;
    onSaveLoans(loans.filter(l => l.id !== id));
    if (selectedLoan?.id === id) setSelectedLoan(null);
  };

  const loanDaysOverdue = (l: Loan) => {
    if (l.status === 'paid') return 0;
    return Math.floor((Date.now() - new Date(l.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const daysSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 id="debtors-title" className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Devedores</h1>
        <p className="text-sm text-slate-500 mt-1">Controle de clientes com pendências de pagamento e empréstimos.</p>
      </div>

      {/* Toggle: Débitos de Vendas / Empréstimos */}
      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/40 w-fit">
        <button
          onClick={() => setView('debits')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            view === 'debits' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Débitos de Vendas
        </button>
        <button
          onClick={() => setView('loans')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            view === 'debits' ? 'text-slate-500 hover:text-slate-900' : 'bg-white text-slate-900 shadow-xs border border-slate-200/40'
          }`}
        >
          <HandCoins className="h-3.5 w-3.5" /> Empréstimos
        </button>
      </div>

      {/* KPI Cards */}
      {view === 'debits' && (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pendentes</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="h-5 w-5" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900">{countPending}</span>
            <p className="text-xs text-slate-500 mt-1">clientes com divida</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total a Receber</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><DollarSign className="h-5 w-5" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-rose-600">{formatCurrency(totalPending)}</span>
            <p className="text-xs text-slate-500 mt-1">valor em aberto</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recebidos Hoje</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle className="h-5 w-5" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-emerald-600">
              {formatCurrency(
                sales
                  .filter(s => s.status === 'completed' && s.paidAt && new Date(s.paidAt).toDateString() === new Date().toDateString())
                  .reduce((acc, s) => acc + s.total, 0)
              )}
            </span>
            <p className="text-xs text-slate-500 mt-1">hoje</p>
          </div>
        </div>
      </div>


      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou codigo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/40">
          {([
            { key: 'pending' as const, label: 'Pendentes' },
            { key: 'completed' as const, label: 'Recebidos' },
            { key: 'all' as const, label: 'Todos' },
          ]).map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilterStatus(opt.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterStatus === opt.key
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>


      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {debtSales.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Nenhum registro encontrado</h3>
            <p className="text-xs text-slate-400 mt-1">
              {filterStatus === 'pending' ? 'Nenhum cliente com divida pendente.' : 'Nenhum registro encontrado.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4">Data da Venda</th>
                  <th className="py-3 px-4 text-center">Dias</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {debtSales.map(sale => {
                  const isPending = sale.status === 'pending';
                  const days = daysSince(sale.date);
                  return (
                    <tr
                      key={sale.id}
                      className={`transition-colors ${
                        isPending ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {sale.clientName ? sale.clientName[0].toUpperCase() : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-xs truncate">{sale.clientName || 'Cliente nao informado'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">#{sale.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {sale.clientPhone ? (
                          <span className="flex items-center gap-1 text-xs text-slate-600">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {sale.clientPhone}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono font-bold text-xs ${isPending ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(sale.total)}
                        </span>
                        {isPending && (sale.paidAmount || 0) > 0 && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Restante: {formatCurrency(Math.max(0, sale.total - (sale.paidAmount || 0)))}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {formatDate(sale.date)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-bold ${
                          isPending && days > 30 ? 'text-rose-600' :
                          isPending && days > 7 ? 'text-amber-600' :
                          isPending ? 'text-slate-600' : 'text-emerald-600'
                        }`}>
                          {isPending ? `${days}d` : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-sm border border-amber-100">
                            <Clock className="h-3 w-3 shrink-0" /> Pendente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-sm border border-emerald-100">
                            <CheckCircle className="h-3 w-3 shrink-0" /> Pago
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            title="Ver Detalhes"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {isPending && (
                            <button
                              onClick={() => handleConfirmPayment(sale)}
                              className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                              title="Confirmar Pagamento"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
                  <td colSpan={2} className="py-3 px-4 text-slate-600 uppercase tracking-wider text-[10px]">
                    Totais ({debtSales.length} registros)
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-900">
                    {formatCurrency(debtSales.reduce((acc, s) => acc + s.total, 0))}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>


      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Detalhes da Venda</span>
                <h3 className="text-base font-black text-slate-900 mt-1">#{selectedSale.id.toUpperCase().substring(0, 12)}</h3>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Status */}
              {selectedSale.status === 'pending' ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center gap-2 text-xs">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="font-bold">Pagamento pendente - {daysSince(selectedSale.date)} dia(s) sem receber</span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg flex items-center gap-2 text-xs">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Pagamento confirmado{selectedSale.paidAt ? ` em ${formatDateTime(selectedSale.paidAt)}` : ''}</span>
                </div>
              )}

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Cliente</h4>
                  <p className="font-bold text-slate-800 mt-1 flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-400" />
                    {selectedSale.clientName || 'Nao informado'}
                  </p>
                  {selectedSale.clientPhone && (
                    <p className="text-slate-500 font-mono mt-1 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {selectedSale.clientPhone}
                    </p>
                  )}
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Dados da Venda</h4>
                  <p className="text-slate-700 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {formatDateTime(selectedSale.date)}
                  </p>
                  <p className="text-slate-700 mt-1">
                    Pagamento: <span className="font-semibold">{
                      selectedSale.paymentMethod === 'pix' ? 'PIX' :
                      selectedSale.paymentMethod === 'money' ? 'Dinheiro' :
                      selectedSale.paymentMethod === 'card_credit' ? 'Cartao Credito' :
                      selectedSale.paymentMethod === 'card_debit' ? 'Cartao Debito' :
                      'Transferencia'
                    }</span>
                  </p>
                </div>
              </div>

              {/* Parcelas e Pagamento */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Parcelas</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number" min={1} max={24} value={selectedSale.installments || 1}
                      onChange={e => handleSetInstallments(selectedSale, Number(e.target.value))}
                      className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-indigo-400"
                    />
                    <span className="text-slate-500">x de {formatCurrency(selectedSale.total / (selectedSale.installments || 1))}</span>
                  </div>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Pagamento</h4>
                  <p className="text-slate-700 mt-1">
                    Recebido: <span className="font-semibold text-emerald-600">{formatCurrency(selectedSale.paidAmount || 0)}</span>
                  </p>
                  <p className="text-slate-700">
                    Restante: <span className="font-semibold text-rose-600">{formatCurrency(Math.max(0, selectedSale.total - (selectedSale.paidAmount || 0)))}</span>
                  </p>
                </div>
              </div>

              {/* Pagamento parcial */}
              {selectedSale.status === 'pending' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registrar Pagamento Parcial</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">R$</span>
                    <input
                      type="number" min={0} step={0.01} value={partialAmount}
                      onChange={e => setPartialAmount(e.target.value)}
                      placeholder="0,00"
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-indigo-400"
                    />
                    <button
                      onClick={() => handlePartialPayment(selectedSale, Number(partialAmount))}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Registrar
                    </button>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Itens da Compra</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-slate-400 font-mono">{item.quantity} x R$ {item.salePrice.toFixed(2)}</p>
                      </div>
                      <span className="font-bold font-mono text-slate-900">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between text-sm font-black text-slate-950">
                  <span>Total:</span>
                  <span className="font-mono text-base">{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <div></div>
              <div className="flex items-center gap-2">
                {selectedSale.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleConclude(selectedSale)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Concluir Débito
                    </button>
                    <button
                      onClick={() => handleConfirmPayment(selectedSale)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Confirmar Pagamento
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedSale(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {view === 'loans' && (
        <div className="space-y-4">
          {/* KPIs de Empréstimos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ativos</span>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><HandCoins className="h-5 w-5" /></div>
              </div>
              <div className="mt-4"><span className="text-2xl font-bold text-slate-900">{loans.filter(l => l.status === 'open').length}</span>
                <p className="text-xs text-slate-500 mt-1">emprestimos em aberto</p></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Emprestado</span>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><DollarSign className="h-5 w-5" /></div>
              </div>
              <div className="mt-4"><span className="text-2xl font-bold text-slate-900">{formatCurrency(loans.reduce((a, l) => a + l.principal, 0))}</span>
                <p className="text-xs text-slate-500 mt-1">capital emprestado</p></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">A Receber (c/ juros)</span>
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><AlertTriangle className="h-5 w-5" /></div>
              </div>
              <div className="mt-4"><span className="text-2xl font-bold text-rose-600">{formatCurrency(loans.filter(l => l.status === 'open').reduce((a, l) => a + loanRemaining(l), 0))}</span>
                <p className="text-xs text-slate-500 mt-1">valor em aberto</p></div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={openLoanForm} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
              <Plus className="h-4 w-4" /> Novo Emprestimo
            </button>
          </div>

          {loans.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <HandCoins className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">Nenhum emprestimo registrado</h3>
              <p className="text-xs text-slate-400 mt-1">Use "Novo Emprestimo" para registrar dinheiro emprestado com juros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {loans.map(l => {
                const overdue = loanDaysOverdue(l);
                const isPaid = l.status === 'paid';
                return (
                  <div key={l.id} className={`bg-white rounded-xl border p-4 ${isPaid ? 'border-slate-200' : overdue > 0 ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" />{l.borrowerName}</p>
                        {l.borrowerPhone && <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{l.borrowerPhone}</p>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPaid ? 'bg-emerald-100 text-emerald-700' : overdue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isPaid ? 'Quitado' : overdue > 0 ? `${overdue}d em atraso` : 'Em aberto'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Pegou: {formatDate(l.loanDate)}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Vence: {formatDate(l.dueDate)}</span>
                      <span>Emprestado: <b className="text-slate-700">{formatCurrency(l.principal)}</b></span>
                      <span>Juros: <b className="text-slate-700">{formatCurrency(l.interest)}</b></span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Total a receber</p>
                        <p className="font-bold font-mono text-rose-600">{formatCurrency(loanTotal(l))}</p>
                        {(l.paidAmount || 0) > 0 && !isPaid && (
                          <p className="text-[10px] text-slate-400 font-mono">Recebido: {formatCurrency(l.paidAmount || 0)} · Resta: {formatCurrency(loanRemaining(l))}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!isPaid && (
                          <>
                            <button onClick={() => { setSelectedLoan(l); setLoanPartial(''); }} className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold cursor-pointer" title="Receber">Receber</button>
                            <button onClick={() => handleLoanPay(l)} className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer" title="Quitar">Quitar</button>
                          </>
                        )}
                        <button onClick={() => removeLoan(l.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 cursor-pointer" title="Remover"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LOAN FORM MODAL */}
      {showLoanForm && loanForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><HandCoins className="h-4 w-4 text-indigo-600" /> {loanForm.id ? 'Editar Emprestimo' : 'Novo Emprestimo'}</h2>
              <button onClick={() => { setShowLoanForm(false); setLoanForm(null); }} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome de quem pegou *</label>
                <input value={loanForm.borrowerName} onChange={e => setLoanForm({ ...loanForm, borrowerName: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Telefone</label>
                <input value={loanForm.borrowerPhone || ''} onChange={e => setLoanForm({ ...loanForm, borrowerPhone: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data que pegou</label>
                <input type="date" value={loanForm.loanDate} onChange={e => setLoanForm({ ...loanForm, loanDate: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data para pagar</label>
                <input type="date" value={loanForm.dueDate} onChange={e => setLoanForm({ ...loanForm, dueDate: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor emprestado *</label>
                <input type="number" min="0" step="0.01" value={loanForm.principal} onChange={e => setLoanForm({ ...loanForm, principal: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor dos juros</label>
                <input type="number" min="0" step="0.01" value={loanForm.interest} onChange={e => setLoanForm({ ...loanForm, interest: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Observações</label>
                <input value={loanForm.notes || ''} onChange={e => setLoanForm({ ...loanForm, notes: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div className="col-span-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold">Total a receber</span>
                <span className="font-bold font-mono text-rose-600">{formatCurrency(loanForm.principal + loanForm.interest)}</span>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button onClick={() => { setShowLoanForm(false); setLoanForm(null); }} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">Cancelar</button>
              <button onClick={saveLoan} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* LOAN PAYMENT MODAL */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><HandCoins className="h-4 w-4 text-indigo-600" /> Receber Emprestimo</h2>
              <button onClick={() => setSelectedLoan(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{selectedLoan.borrowerName}</span>
                <span className="font-bold font-mono text-rose-600">{formatCurrency(loanTotal(selectedLoan))}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                <span>Emprestado: {formatCurrency(selectedLoan.principal)}</span>
                <span>Juros: {formatCurrency(selectedLoan.interest)}</span>
                <span>Recebido: {formatCurrency(selectedLoan.paidAmount || 0)}</span>
                <span>Restante: {formatCurrency(loanRemaining(selectedLoan))}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registrar Recebimento</h4>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">R$</span>
                  <input type="number" min="0" step="0.01" value={loanPartial} onChange={e => setLoanPartial(e.target.value)} placeholder="0,00" className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
                  <button onClick={() => handleLoanPartial(selectedLoan, Number(loanPartial))} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Registrar</button>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button onClick={() => setSelectedLoan(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer">Fechar</button>
              <button onClick={() => handleLoanPay(selectedLoan)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Check className="h-3.5 w-3.5" /> Quitar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
