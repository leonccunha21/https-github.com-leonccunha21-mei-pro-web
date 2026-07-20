import { useState, useMemo } from 'react';
import { Sale, Expense } from '../types';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Plus, Trash2, Edit2 } from 'lucide-react';

interface CashFlowProps {
  sales: Sale[];
  expenses: Expense[];
  onAddExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  onUpdateExpense?: (expense: Expense) => void;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function CashFlow({ sales, expenses, onAddExpense, onDeleteExpense, onUpdateExpense }: CashFlowProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '', amount: 0, category: '', date: new Date().toISOString().substring(0, 10)
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    sales.forEach(s => years.add(new Date(s.date).getFullYear()));
    expenses.forEach(e => years.add(new Date(e.date).getFullYear()));
    const sorted = [...years].sort((a, b) => b - a);
    if (sorted.length === 0) sorted.push(new Date().getFullYear());
    return sorted;
  }, [sales, expenses]);

  const monthlyData: Record<number, { revenue: number; cost: number; expenses: number; profit: number }> = useMemo(() => {
    const yearSales = sales.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === selectedYear && s.status === 'completed';
    });
    const yearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === selectedYear);

    const data: Record<number, { revenue: number; cost: number; expenses: number; profit: number }> = {};
    for (let m = 1; m <= 12; m++) {
      data[m] = { revenue: 0, cost: 0, expenses: 0, profit: 0 };
    }

    yearSales.forEach(s => {
      const m = new Date(s.date).getMonth() + 1;
      data[m].revenue += s.total;
      data[m].cost += s.totalCost;
    });

    yearExpenses.forEach(e => {
      const m = new Date(e.date).getMonth() + 1;
      data[m].expenses += e.amount;
    });

    for (let m = 1; m <= 12; m++) {
      data[m].profit = data[m].revenue - data[m].cost - data[m].expenses;
    }

    return data;
  }, [sales, expenses, selectedYear]);

  const yearSummary = useMemo(() => {
    const totalRevenue = Object.values(monthlyData).reduce((a, d) => a + d.revenue, 0);
    const totalCost = Object.values(monthlyData).reduce((a, d) => a + d.cost, 0);
    const totalExpenses = Object.values(monthlyData).reduce((a, d) => a + d.expenses, 0);
    const totalProfit = totalRevenue - totalCost - totalExpenses;
    const totalSalesCount = sales.filter(s => new Date(s.date).getFullYear() === selectedYear && s.status === 'completed').length;
    return { totalRevenue, totalCost, totalExpenses, totalProfit, totalSalesCount };
  }, [monthlyData, sales, selectedYear]);

  const handleAddExpense = () => {
    if (!newExpense.description.trim() || !newExpense.amount || !newExpense.category.trim()) return;
    const expense: Expense = {
      id: `exp_${Date.now()}`,
      date: new Date(newExpense.date).toISOString(),
      category: newExpense.category.trim(),
      description: newExpense.description.trim(),
      amount: newExpense.amount,
      status: 'pending'
    };
    onAddExpense?.(expense);
    setNewExpense({ description: '', amount: 0, category: '', date: new Date().toISOString().substring(0, 10) });
    setShowAddForm(false);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddForm(true);
    setNewExpense({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.substring(0, 10)
    });
  };

  const handleUpdateExpense = () => {
    if (!editingExpense || !newExpense.description.trim() || !newExpense.amount || !newExpense.category.trim()) return;
    const updatedExpense: Expense = {
      ...editingExpense,
      date: new Date(newExpense.date).toISOString(),
      category: newExpense.category.trim(),
      description: newExpense.description.trim(),
      amount: newExpense.amount,
    };
    onUpdateExpense?.(updatedExpense);
    setNewExpense({ description: '', amount: 0, category: '', date: new Date().toISOString().substring(0, 10) });
    setEditingExpense(null);
    setShowAddForm(false);
  };

  const allExpenses = useMemo(() => {
    return expenses.filter(e => new Date(e.date).getFullYear() === selectedYear)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedYear]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    allExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allExpenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
            Fluxo de Caixa
          </h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe receitas, custos e despesas ao longo do ano.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-medium">
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Receita</span>
          <span className="text-lg font-bold font-mono text-emerald-800 block mt-1">R$ {yearSummary.totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</span>
        </div>
        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
          <span className="text-[10px] font-bold text-rose-600 uppercase">Custo Produtos</span>
          <span className="text-lg font-bold font-mono text-rose-800 block mt-1">R$ {yearSummary.totalCost.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</span>
        </div>
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
          <span className="text-[10px] font-bold text-orange-600 uppercase">Despesas</span>
          <span className="text-lg font-bold font-mono text-orange-800 block mt-1">R$ {yearSummary.totalExpenses.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</span>
        </div>
        <div className={`p-4 rounded-xl border ${yearSummary.totalProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <span className="text-[10px] font-bold uppercase ${yearSummary.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}">Saldo</span>
          <span className={`text-lg font-bold font-mono block mt-1 ${yearSummary.totalProfit >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
            R$ {yearSummary.totalProfit.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}
          </span>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 pb-3 mb-4 px-5 pt-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" /> Detalhamento Mensal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Receitas, custos e saldo por mês em {selectedYear}.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Mês</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Receita</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Custo</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Despesas</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((monthName, idx) => {
                const m = idx + 1;
                const d = monthlyData[m];
                const hasData = d.revenue > 0 || d.expenses > 0;
                if (!hasData) return null;
                return (
                  <tr key={m} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 border-b border-slate-100 text-slate-700 align-middle font-medium">{monthName}</td>
                    <td className="px-4 py-3 border-b border-slate-100 text-slate-700 align-middle text-right font-mono text-emerald-700">R$ {d.revenue.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                    <td className="px-4 py-3 border-b border-slate-100 text-slate-700 align-middle text-right font-mono text-rose-700">R$ {d.cost.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                    <td className="px-4 py-3 border-b border-slate-100 text-slate-700 align-middle text-right font-mono text-orange-700">R$ {d.expenses.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                    <td className={`px-4 py-3 border-b border-slate-100 text-slate-700 align-middle text-right font-mono font-bold ${d.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      R$ {d.profit.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}
                    </td>
                  </tr>
                );
              })}
              {MONTHS.every((_, i) => {
                const d = monthlyData[i + 1];
                return !d || (d.revenue === 0 && d.expenses === 0);
              }) && (
                <tr><td colSpan={5} className="px-4 py-3 text-center text-slate-400">Nenhum dado para {selectedYear}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 pb-3 mb-4 px-5 pt-5 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-600" /> Despesas Detalhadas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Gerencie as despesas do período selecionado.</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Plus className="h-4 w-4" /> Nova Despesa
          </button>
        </div>

        {showAddForm && (
          <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <input type="text" placeholder="Descrição" value={newExpense.description}
                onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
              <input type="number" placeholder="Valor (R$)" value={newExpense.amount || ''}
                onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
              <input type="text" placeholder="Categoria" value={newExpense.category}
                onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
              <input type="date" value={newExpense.date}
                onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowAddForm(false); setEditingExpense(null); setNewExpense({ description: '', amount: 0, category: '', date: new Date().toISOString().substring(0, 10) }); }}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">Cancelar</button>
              <button onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                {editingExpense ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {/* Expense categories summary */}
        {expenseByCategory.length > 0 && (
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {expenseByCategory.map(([cat, total]) => (
                <div key={cat} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block">{cat}</span>
                  <span className="text-xs font-bold font-mono text-slate-800">R$ {total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense list */}
        <div className="divide-y divide-slate-100">
          {allExpenses.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-sm">Nenhuma despesa cadastrada para {selectedYear}</div>
          ) : allExpenses.map(exp => (
            <div key={exp.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">{exp.description}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{exp.category}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(exp.date).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-rose-600">R$ {exp.amount.toFixed(2)}</span>
                <button onClick={() => { setEditingExpense(exp); setNewExpense({...exp}); setShowAddForm(true); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer" title="Editar">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => onDeleteExpense?.(exp.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Annual comparison */}
      {availableYears.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 pb-3 mb-4 px-5 pt-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-600" /> Comparativo Anual
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Receitas, custos e saldo por ano.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Ano</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Receita</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Custo</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Despesas</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {availableYears.map(year => {
                  const yearSales = sales.filter(s => new Date(s.date).getFullYear() === year && s.status === 'completed');
                  const yearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === year);
                  const rev = yearSales.reduce((a, s) => a + s.total, 0);
                  const cost = yearSales.reduce((a, s) => a + s.totalCost, 0);
                  const exp = yearExpenses.reduce((a, e) => a + e.amount, 0);
                  const profit = rev - cost - exp;
                  return (
                    <tr key={year} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 border-b border-slate-100 text-slate-700 align-middle font-semibold">{year}</td>
                      <td className="px-4 py-3 border-b border-slate-100 text-slate-700 align-middle text-right font-mono text-emerald-700">R$ {rev.toFixed(2)}</td>
                      <td className="px-4 py-3 border-b border-slate-100 text-slate-700 align-middle text-right font-mono text-rose-700">R$ {cost.toFixed(2)}</td>
                      <td className="px-4 py-3 border-b border-slate-100 text-slate-700 align-middle text-right font-mono text-orange-700">R$ {exp.toFixed(2)}</td>
                      <td className={`px-4 py-3 border-b border-slate-100 text-slate-700 align-middle text-right font-mono font-bold ${profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                        R$ {profit.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Flow Projection */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 pb-3 mb-4 px-5 pt-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Fluxo de Caixa Projetado
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Contas a receber e a pagar nos próximos meses.</p>
        </div>
        <div className="px-5 pb-5">
          {(() => {
            const now = new Date();
            const receber = sales.filter(s => s.status === 'pending');
            const pagar = expenses.filter(e => e.status === 'pending');
            const projMeses: { label: string; receber: number; pagar: number; saldo: number }[] = [];
            for (let i = 0; i < 3; i++) {
              const m = (now.getMonth() + i) % 12;
              const y = now.getFullYear() + Math.floor((now.getMonth() + i) / 12);
              const rec = receber.filter(s => new Date(s.date).getMonth() === m && new Date(s.date).getFullYear() === y).reduce((a, s) => a + s.total, 0);
              const pag = pagar.filter(e => new Date(e.date).getMonth() === m && new Date(e.date).getFullYear() === y).reduce((a, e) => a + e.amount, 0);
              projMeses.push({ label: MONTHS[m], receber: rec, pagar: pag, saldo: rec - pag });
            }
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projMeses.map(m => (
                    <div key={m.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{m.label}</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-emerald-600 font-semibold">A Receber</span>
                          <span className="font-mono text-emerald-700">R$ {m.receber.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-rose-600 font-semibold">A Pagar</span>
                          <span className="font-mono text-rose-700">R$ {m.pagar.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-1.5 flex justify-between">
                          <span className="font-bold text-slate-600">Saldo Projetado</span>
                          <span className={`font-mono font-bold ${m.saldo >= 0 ? 'text-primary' : 'text-rose-600'}`}>R$ {m.saldo.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Scenarios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(() => {
                    const totalRec = projMeses.reduce((a, m) => a + m.receber, 0);
                    const totalPag = projMeses.reduce((a, m) => a + m.pagar, 0);
                    const scenarios = [
                      { label: 'Otimista', pct: 1.3, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                      { label: 'Realista', pct: 1.0, color: 'bg-primary-50 border-primary-200 text-primary-800' },
                      { label: 'Pessimista', pct: 0.7, color: 'bg-rose-50 border-rose-200 text-rose-800' },
                    ];
                    return scenarios.map(s => {
                      const saldo = totalRec * s.pct - totalPag;
                      return (
                        <div key={s.label} className={`rounded-xl p-3 border ${s.color}`}>
                          <p className="text-xs font-bold uppercase tracking-wider">{s.label}</p>
                          <p className="text-lg font-bold font-mono mt-1">R$ {saldo.toFixed(2)}</p>
                          <p className="text-[10px] mt-0.5 opacity-70">Receita: R$ {(totalRec * s.pct).toFixed(2)} | Despesas: R$ {totalPag.toFixed(2)}</p>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
                  <Calendar className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>Projeção baseada em <b>{receber.length} venda(s) pendente(s)</b> e <b>{pagar.length} despesa(s) pendente(s)</b>. Cenários: otimista (+30% receitas), realista (atual), pessimista (-30% receitas).</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
