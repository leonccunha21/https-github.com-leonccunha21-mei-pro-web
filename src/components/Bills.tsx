import React, { useState, useMemo, useEffect } from 'react';
import { Bill } from '../types';
import {
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Search,
  X,
  Check,
  Receipt
} from 'lucide-react';

interface BillsProps {
  bills: Bill[];
  onSaveBills: (bills: Bill[]) => void;
}

const CATEGORIES = [
  'Aluguel', 'Energia', 'Água', 'Internet', 'Telefone',
  'Salário', 'Impostos', 'Marketing', 'Manutenção', 'Fornecedores',
  'Seguro', 'Transporte', 'Alimentação', 'Outros'
];

const RECURRENCE_LABELS: Record<string, string> = {
  once: 'Única',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

export default function Bills({ bills, onSaveBills }: BillsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('pending');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    dueDate: new Date().toISOString().slice(0, 10),
    category: 'Outros',
    recurrence: 'monthly' as Bill['recurrence'],
    notes: '',
  });

  const today = new Date().toISOString().slice(0, 10);

  const openNewForm = () => {
    setEditBill(null);
    setFormData({
      name: '',
      description: '',
      amount: '',
      dueDate: today,
      category: 'Outros',
      recurrence: 'monthly',
      notes: '',
    });
    setShowForm(true);
  };

  const openEditForm = (bill: Bill) => {
    setEditBill(bill);
    setFormData({
      name: bill.name,
      description: bill.description || '',
      amount: bill.amount.toString(),
      dueDate: bill.dueDate.slice(0, 10),
      category: bill.category,
      recurrence: bill.recurrence,
      notes: bill.notes || '',
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const name = formData.name.trim();
    const amount = parseFloat(formData.amount.replace(',', '.'));
    if (!name || !amount || amount <= 0) return;

    const now = new Date().toISOString();
    if (editBill) {
      onSaveBills(bills.map(b =>
        b.id === editBill.id
          ? {
              ...b,
              name,
              description: formData.description || undefined,
              amount,
              dueDate: formData.dueDate,
              category: formData.category,
              recurrence: formData.recurrence,
              notes: formData.notes || undefined,
              updatedAt: now,
            }
          : b
      ));
    } else {
      const newBill: Bill = {
        id: `bill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name,
        description: formData.description || undefined,
        amount,
        dueDate: formData.dueDate,
        category: formData.category,
        recurrence: formData.recurrence,
        status: 'pending',
        notes: formData.notes || undefined,
        createdAt: now,
        updatedAt: now,
      };
      onSaveBills([newBill, ...bills]);
    }
    setShowForm(false);
    setEditBill(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Remover esta conta permanentemente?')) return;
    onSaveBills(bills.filter(b => b.id !== id));
  };

  const filtered = useMemo(() => {
    return bills.filter(b => {
      if (filterStatus === 'pending' && b.status === 'paid') return false;
      if (filterStatus === 'paid' && b.status !== 'paid') return false;
      if (filterStatus === 'overdue' && b.status !== 'overdue') return false;
      if (filterCategory !== 'all' && b.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!b.name.toLowerCase().includes(q) && !(b.description || '').toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      if (a.status === 'pending' && b.status === 'paid') return -1;
      if (a.status === 'paid' && b.status === 'pending') return 1;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    });
  }, [bills, filterStatus, filterCategory, search]);

  const stats = useMemo(() => {
    const pending = bills.filter(b => b.status === 'pending' || b.status === 'overdue');
    const overdue = bills.filter(b => b.status === 'overdue');
    const paidThisMonth = bills.filter(b => {
      if (b.status !== 'paid' || !b.paymentDate) return false;
      const d = new Date(b.paymentDate);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      pendingTotal: pending.reduce((a, b) => a + b.amount, 0),
      pendingCount: pending.length,
      overdueTotal: overdue.reduce((a, b) => a + b.amount, 0),
      overdueCount: overdue.length,
      paidThisMonthTotal: paidThisMonth.reduce((a, b) => a + b.amount, 0),
      paidThisMonthCount: paidThisMonth.length,
      total: bills.reduce((a, b) => a + b.amount, 0),
    };
  }, [bills]);

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const isOverdue = (dueDate: string, status: string) =>
    status === 'pending' && new Date(dueDate) < new Date(new Date().toDateString());

  // Marca como vencidas automaticamente ao carregar
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = bills.map(b => {
      if (b.status === 'pending' && b.dueDate < today) {
        return { ...b, status: 'overdue' as const, updatedAt: new Date().toISOString() };
      }
      if (b.status === 'overdue' && b.dueDate >= today) {
        return { ...b, status: 'pending' as const, updatedAt: new Date().toISOString() };
      }
      return b;
    });
    const hasChanges = updated.some((b, i) => b.status !== bills[i].status);
    if (hasChanges) onSaveBills(updated);
  }, []);

  const calcNextDueDate = (currentDueDate: string, recurrence: string): string => {
    const d = new Date(currentDueDate);
    if (recurrence === 'weekly') d.setDate(d.getDate() + 7);
    else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (recurrence === 'yearly') d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  };

  const handleMarkPaid = (bill: Bill) => {
    const now = new Date().toISOString();
    const updated = bills.map(b =>
      b.id === bill.id
        ? { ...b, status: 'paid' as const, paymentDate: new Date().toISOString().slice(0, 10), updatedAt: now }
        : b
    );
    if (bill.recurrence !== 'once') {
      const nextDueDate = calcNextDueDate(bill.dueDate, bill.recurrence);
      const nextBill: Bill = {
        id: `bill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: bill.name,
        description: bill.description,
        amount: bill.amount,
        dueDate: nextDueDate,
        category: bill.category,
        recurrence: bill.recurrence,
        status: 'pending',
        notes: bill.notes,
        createdAt: now,
        updatedAt: now,
      };
      onSaveBills([nextBill, ...updated]);
    } else {
      onSaveBills(updated);
    }
  };

  const handleMarkPending = (bill: Bill) => {
    onSaveBills(bills.map(b =>
      b.id === bill.id
        ? { ...b, status: 'pending' as const, paymentDate: undefined, updatedAt: new Date().toISOString() }
        : b
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Receipt className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
            Contas a Pagar
          </h1>
          <p className="text-sm text-slate-500 mt-1">Controle de contas da loja com vencimento e recorrência.</p>
        </div>
        <button
          onClick={openNewForm}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Nova Conta
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pendentes</span>
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Clock className="h-4 w-4" /></div>
          </div>
          <span className="text-lg font-bold text-slate-900">{stats.pendingCount}</span>
          <p className="text-xs font-mono text-amber-600 font-semibold">{formatCurrency(stats.pendingTotal)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vencidas</span>
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600"><AlertTriangle className="h-4 w-4" /></div>
          </div>
          <span className="text-lg font-bold text-rose-600">{stats.overdueCount}</span>
          <p className="text-xs font-mono text-rose-600 font-semibold">{formatCurrency(stats.overdueTotal)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pagas no Mês</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle className="h-4 w-4" /></div>
          </div>
          <span className="text-lg font-bold text-emerald-600">{stats.paidThisMonthCount}</span>
          <p className="text-xs font-mono text-emerald-600 font-semibold">{formatCurrency(stats.paidThisMonthTotal)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Contas</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><DollarSign className="h-4 w-4" /></div>
          </div>
          <span className="text-lg font-bold text-slate-900">{bills.length}</span>
          <p className="text-xs font-mono text-slate-500 font-semibold">{formatCurrency(stats.total)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar conta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/40">
            {(['all', 'pending', 'paid', 'overdue'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setFilterStatus(opt)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterStatus === opt
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {opt === 'all' ? 'Todas' : opt === 'pending' ? 'Pendentes' : opt === 'paid' ? 'Pagas' : 'Vencidas'}
              </button>
            ))}
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200/40 rounded-lg text-slate-600 focus:outline-none focus:border-indigo-400"
          >
            <option value="all">Todas Categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Nenhuma conta encontrada</h3>
            <p className="text-xs text-slate-400 mt-1">
              {search ? 'Tente outro termo de busca.' : 'Clique em "Nova Conta" para adicionar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Conta</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Recorrência</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(bill => {
                  const overdue = isOverdue(bill.dueDate, bill.status);
                  return (
                    <tr
                      key={bill.id}
                      className={`transition-colors ${
                        overdue ? 'bg-rose-50/40 hover:bg-rose-50/80' :
                        bill.status === 'paid' ? 'bg-emerald-50/30 hover:bg-emerald-50/60' :
                        'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {bill.name}
                          </p>
                          {bill.description && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{bill.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-sm border border-indigo-100">
                          {bill.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {formatDate(bill.dueDate)}
                        </div>
                        {overdue && (
                          <span className="text-[10px] text-rose-600 font-bold">
                            Vencida há {Math.floor((Date.now() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24))}d
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono font-bold text-xs ${
                          overdue ? 'text-rose-600' :
                          bill.status === 'paid' ? 'text-emerald-600' :
                          'text-slate-900'
                        }`}>
                          {formatCurrency(bill.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-semibold text-slate-500">
                          {RECURRENCE_LABELS[bill.recurrence]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {bill.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-sm border border-emerald-100">
                            <CheckCircle className="h-3 w-3" /> Paga
                          </span>
                        ) : overdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-sm border border-rose-100">
                            <AlertTriangle className="h-3 w-3" /> Vencida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-sm border border-amber-100">
                            <Clock className="h-3 w-3" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {bill.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkPaid(bill)}
                              className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                              title="Marcar como Paga"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {bill.status === 'paid' && (
                            <button
                              onClick={() => handleMarkPending(bill)}
                              className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                              title="Reabrir"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditForm(bill)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bill.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
                    <td colSpan={3} className="py-3 px-4 text-slate-600 uppercase tracking-wider text-[10px]">
                      Total ({filtered.length} contas)
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-900">
                      {formatCurrency(filtered.reduce((a, b) => a + b.amount, 0))}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {editBill ? 'Editar Conta' : 'Nova Conta'}
                </h2>
              </div>
              <button
                onClick={() => { setShowForm(false); setEditBill(null); }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nome da Conta *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Aluguel, Energia..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descrição opcional"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Valor (R$) *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.amount}
                    onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Recorrência</label>
                  <select
                    value={formData.recurrence}
                    onChange={e => setFormData(f => ({ ...f, recurrence: e.target.value as Bill['recurrence'] }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
                  >
                    <option value="once">Única</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Observações opcionais..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 transition-all resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowForm(false); setEditBill(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim() || !formData.amount || parseFloat(formData.amount.replace(',', '.')) <= 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {editBill ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
