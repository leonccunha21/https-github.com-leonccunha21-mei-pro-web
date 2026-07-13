import { useState, useMemo } from 'react';
import { Sale, Expense } from '../types';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Plus, Trash2 } from 'lucide-react';

interface CashFlowProps {
  sales: Sale[];
  expenses: Expense[];
  onAddExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function CashFlow({ sales, expenses, onAddExpense, onDeleteExpense }: CashFlowProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

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

  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '', amount: 0, category: '', date: new Date().toISOString().substring(0, 10)
  });

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Fluxo de Caixa</h2>
        <div className="flex items-center gap-2">
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-medium">
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Receita</span>
          <span className="text-lg font-bold font-mono text-emerald-800 block mt-1">R$ {yearSummary.totalRevenue.toFixed(2)}</span>
        </div>
        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
          <span className="text-[10px] font-bold text-rose-600 uppercase">Custo Produtos</span>
          <span className="text-lg font-bold font-mono text-rose-800 block mt-1">R$ {yearSummary.totalCost.toFixed(2)}</span>
        </div>
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
          <span className="text-[10px] font-bold text-orange-600 uppercase">Despesas</span>
          <span className="text-lg font-bold font-mono text-orange-800 block mt-1">R$ {yearSummary.totalExpenses.toFixed(2)}</span>
        </div>
        <div className={`p-4 rounded-xl border ${yearSummary.totalProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <span className="text-[10px] font-bold uppercase ${yearSummary.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}">Saldo</span>
          <span className={`text-lg font-bold font-mono block mt-1 ${yearSummary.totalProfit >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
            R$ {yearSummary.totalProfit.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase">Detalhamento Mensal - {selectedYear}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-2 font-semibold text-slate-600">Mês</th>
                <th className="text-right p-2 font-semibold text-slate-600">Receita</th>
                <th className="text-right p-2 font-semibold text-slate-600">Custo</th>
                <th className="text-right p-2 font-semibold text-slate-600">Despesas</th>
                <th className="text-right p-2 font-semibold text-slate-600">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((monthName, idx) => {
                const m = idx + 1;
                const d = monthlyData[m];
                const hasData = d.revenue > 0 || d.expenses > 0;
                if (!hasData) return null;
                return (
                  <tr key={m} className="border-t border-slate-100">
                    <td className="p-2 font-medium text-slate-900">{monthName}</td>
                    <td className="p-2 text-right font-mono text-emerald-700">R$ {d.revenue.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono text-rose-700">R$ {d.cost.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono text-orange-700">R$ {d.expenses.toFixed(2)}</td>
                    <td className={`p-2 text-right font-mono font-bold ${d.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      R$ {d.profit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              {MONTHS.every((_, i) => {
                const d = monthlyData[i + 1];
                return !d || (d.revenue === 0 && d.expenses === 0);
              }) && (
                <tr><td colSpan={5} className="p-4 text-center text-slate-400">Nenhum dado para {selectedYear}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Details */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase">Despesas Detalhadas</span>
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-semibold hover:bg-indigo-100">
            <Plus size={12} /> Nova Despesa
          </button>
        </div>

        {showAddForm && (
          <div className="p-3 bg-indigo-50 border-b border-indigo-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <input type="text" placeholder="Descrição" value={newExpense.description}
                onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                className="px-2 py-1.5 text-xs border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              <input type="number" placeholder="Valor (R$)" value={newExpense.amount || ''}
                onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                className="px-2 py-1.5 text-xs border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              <input type="text" placeholder="Categoria" value={newExpense.category}
                onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                className="px-2 py-1.5 text-xs border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              <input type="date" value={newExpense.date}
                onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                className="px-2 py-1.5 text-xs border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-400" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 hover:text-slate-700">Cancelar</button>
              <button onClick={handleAddExpense}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-semibold hover:bg-indigo-700">Adicionar</button>
            </div>
          </div>
        )}

        {/* Expense categories summary */}
        {expenseByCategory.length > 0 && (
          <div className="p-3 border-b border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {expenseByCategory.map(([cat, total]) => (
                <div key={cat} className="p-2 bg-slate-50 rounded-lg">
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
            <div className="p-4 text-center text-slate-400 text-xs">Nenhuma despesa cadastrada para {selectedYear}</div>
          ) : allExpenses.map(exp => (
            <div key={exp.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50">
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
                <button onClick={() => onDeleteExpense?.(exp.id)}
                  className="p-1 text-slate-300 hover:text-red-500">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Annual comparison */}
      {availableYears.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase">Comparativo Anual</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-2 font-semibold text-slate-600">Ano</th>
                  <th className="text-right p-2 font-semibold text-slate-600">Receita</th>
                  <th className="text-right p-2 font-semibold text-slate-600">Custo</th>
                  <th className="text-right p-2 font-semibold text-slate-600">Despesas</th>
                  <th className="text-right p-2 font-semibold text-slate-600">Saldo</th>
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
                    <tr key={year} className="border-t border-slate-100">
                      <td className="p-2 font-semibold text-slate-900">{year}</td>
                      <td className="p-2 text-right font-mono text-emerald-700">R$ {rev.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono text-rose-700">R$ {cost.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono text-orange-700">R$ {exp.toFixed(2)}</td>
                      <td className={`p-2 text-right font-mono font-bold ${profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
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
    </div>
  );
}
