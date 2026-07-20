import { useMemo, useState } from 'react';
import { Sale, Expense } from '../types';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  CreditCard, FileText, Download, Calendar, Filter,
  ChevronDown, ChevronUp, Printer, BarChart3
} from 'lucide-react';

interface DREProps {
  sales: Sale[];
  expenses: Expense[];
}

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function pct(v: number, base: number) { return base > 0 ? `${(v / base * 100).toFixed(1)}%` : '-'; }

export default function DRE({ sales, expenses }: DREProps) {
  const MONTHS_DRE = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(() => {
    const years = new Set<number>();
    sales.forEach(s => years.add(new Date(s.date).getFullYear()));
    const arr = Array.from(years).sort((a, b) => b - a);
    return arr.length ? arr[0] : new Date().getFullYear();
  });
  const [monthRange, setMonthRange] = useState<[number, number]>([1, 12]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const years = useMemo(() => {
    const s = new Set<number>();
    sales.forEach(sa => s.add(new Date(sa.date).getFullYear()));
    return Array.from(s).sort((a, b) => b - a);
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (s.status !== 'completed') return false;
      if (selectedYear !== 'all' && new Date(s.date).getFullYear() !== selectedYear) return false;
      const m = new Date(s.date).getMonth() + 1;
      if (m < monthRange[0] || m > monthRange[1]) return false;
      return true;
    });
  }, [sales, selectedYear, monthRange]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (selectedYear !== 'all' && new Date(e.date).getFullYear() !== selectedYear) return false;
      const m = new Date(e.date).getMonth() + 1;
      if (m < monthRange[0] || m > monthRange[1]) return false;
      return true;
    });
  }, [expenses, selectedYear, monthRange]);

  const dre = useMemo(() => {
    const receitaBruta = filteredSales.reduce((a, s) => a + s.total, 0);
    const custoMercadorias = filteredSales.reduce((a, s) => a + s.totalCost, 0);
    const despesasPagas = filteredExpenses.filter(e => e.status === 'paid').reduce((a, e) => a + e.amount, 0);
    const despesasPendentes = filteredExpenses.filter(e => e.status === 'pending').reduce((a, e) => a + e.amount, 0);
    const receitaLiquida = receitaBruta;
    const lucroBruto = receitaLiquida - custoMercadorias;
    const resultadoLiquido = lucroBruto - despesasPagas;
    return { receitaBruta, custoMercadorias, despesasPagas, despesasPendentes, receitaLiquida, lucroBruto, resultadoLiquido };
  }, [filteredSales, filteredExpenses]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { sales: Sale[]; expenses: Expense[] }>();
    for (const s of filteredSales) {
      const key = s.date.substring(0, 7);
      if (!map.has(key)) map.set(key, { sales: [], expenses: [] });
      map.get(key)!.sales.push(s);
    }
    for (const e of filteredExpenses) {
      const key = e.date.substring(0, 7);
      if (!map.has(key)) map.set(key, { sales: [], expenses: [] });
      map.get(key)!.expenses.push(e);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredSales, filteredExpenses]);

  const toggleMonth = (key: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const yearlyComparison = useMemo(() => {
    const byYear = new Map<number, { rec: number; cmv: number; desp: number; vendas: number }>();
    sales.filter(s => s.status === 'completed').forEach(s => {
      const y = new Date(s.date).getFullYear();
      if (!byYear.has(y)) byYear.set(y, { rec: 0, cmv: 0, desp: 0, vendas: 0 });
      const d = byYear.get(y)!;
      d.rec += s.total;
      d.cmv += s.totalCost;
      d.vendas++;
    });
    expenses.filter(e => e.status === 'paid').forEach(e => {
      const y = new Date(e.date).getFullYear();
      if (!byYear.has(y)) byYear.set(y, { rec: 0, cmv: 0, desp: 0, vendas: 0 });
      byYear.get(y)!.desp += e.amount;
    });
    return Array.from(byYear.entries()).sort((a, b) => b[0] - a[0]);
  }, [sales, expenses]);

  const exportPrint = () => {
    window.print();
  };

  const exportDRE = () => {
    const rows = [
      ['Demonstração do Resultado do Exercício (DRE)'],
      [`Período: ${selectedYear === 'all' ? 'Todos os anos' : selectedYear}`],
      [''],
      ['Descrição', 'Valor (R$)', '% Receita Líquida'],
      ['Receita Bruta', dre.receitaBruta.toFixed(2), '100%'],
      ['(-) Custo das Mercadorias Vendidas', dre.custoMercadorias.toFixed(2), pct(dre.custoMercadorias, dre.receitaBruta)],
      ['= Lucro Bruto', dre.lucroBruto.toFixed(2), pct(dre.lucroBruto, dre.receitaBruta)],
      [''],
      ['Despesas Pagas', dre.despesasPagas.toFixed(2), pct(dre.despesasPagas, dre.receitaBruta)],
      ['Despesas Pendentes', dre.despesasPendentes.toFixed(2), pct(dre.despesasPendentes, dre.receitaBruta)],
      [''],
      ['= Resultado Líquido', dre.resultadoLiquido.toFixed(2), pct(dre.resultadoLiquido, dre.receitaBruta)],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DRE_${selectedYear}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">DRE</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Demonstração do Resultado do Exercício</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedYear === 'all' ? 'all' : selectedYear}
              onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs font-semibold bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="all">Todos os anos</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="text-slate-300 mx-1">|</span>
            <select
              value={monthRange[0]}
              onChange={e => setMonthRange([Number(e.target.value), monthRange[1]])}
              className="text-xs font-semibold bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {MONTHS_DRE.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <span className="text-slate-400 text-[10px]">até</span>
            <select
              value={monthRange[1]}
              onChange={e => setMonthRange([monthRange[0], Number(e.target.value)])}
              className="text-xs font-semibold bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {MONTHS_DRE.map((m, i) => <option key={i} value={i + 1} disabled={i + 1 < monthRange[0]}>{m}</option>)}
            </select>
          </div>
          <button onClick={exportPrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer">
            <Printer className="h-3.5 w-3.5" />
            Imprimir/PDF
          </button>
          <button onClick={exportDRE} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* DRE Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Receita Bruta</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{fmt(dre.receitaBruta)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <TrendingDown className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">CMV</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{fmt(dre.custoMercadorias)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{pct(dre.custoMercadorias, dre.receitaBruta)} da receita</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Lucro Bruto</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{fmt(dre.lucroBruto)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Margem: {pct(dre.lucroBruto, dre.receitaBruta)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 text-sky-600 mb-2">
            <CreditCard className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Resultado Líquido</span>
          </div>
          <p className={`text-2xl font-bold ${dre.resultadoLiquido >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {fmt(dre.resultadoLiquido)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{dre.despesasPagas > 0 ? `Despesas: ${fmt(dre.despesasPagas)}` : 'Sem despesas pagas'}</p>
        </div>
      </div>

      {/* Detailed Statement */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Demonstração Completa</h3>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Receita Bruta (vendas concluídas)</span>
            <span className="text-sm font-bold text-emerald-600">{fmt(dre.receitaBruta)}</span>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700/50" />
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">(-) Custo das Mercadorias Vendidas (CMV)</span>
            <span className="text-sm font-semibold text-rose-500">{fmt(dre.custoMercadorias)}</span>
          </div>
          <div className="border-t border-dashed border-slate-100 dark:border-slate-700/50" />
          <div className="flex justify-between items-center py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 -mx-3">
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">= Lucro Bruto</span>
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{fmt(dre.lucroBruto)} <span className="text-[11px] font-normal">({pct(dre.lucroBruto, dre.receitaBruta)})</span></span>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700/50" />
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">(-) Despesas Operacionais Pagas</span>
            <span className="text-sm font-semibold text-rose-500">{fmt(dre.despesasPagas)}</span>
          </div>
          {dre.despesasPendentes > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-400">(-) Despesas Pendentes</span>
              <span className="text-sm text-amber-500">{fmt(dre.despesasPendentes)}</span>
            </div>
          )}
          <div className="border-t border-dashed border-slate-100 dark:border-slate-700/50" />
          <div className={`flex justify-between items-center py-3 rounded-lg px-3 -mx-3 ${dre.resultadoLiquido >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
            <span className={`text-sm font-bold ${dre.resultadoLiquido >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              = Resultado Líquido
            </span>
            <span className={`text-sm font-bold ${dre.resultadoLiquido >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {fmt(dre.resultadoLiquido)}
            </span>
          </div>
        </div>
      </div>

      {/* Year-over-Year Comparison */}
      {yearlyComparison.length > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Comparativo Anual
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">Ano</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">Vendas</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">Receita</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">CMV</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">Despesas</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">Resultado</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">Margem</th>
                </tr>
              </thead>
              <tbody>
                {yearlyComparison.map(([year, data], idx) => {
                  const lucro = data.rec - data.cmv - data.desp;
                  const margem = data.rec > 0 ? (lucro / data.rec) * 100 : 0;
                  const prev = idx < yearlyComparison.length - 1 ? yearlyComparison[idx + 1][1] : null;
                  const evolRec = prev ? ((data.rec - prev.rec) / prev.rec) * 100 : null;
                  return (
                    <tr key={year} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 font-bold text-slate-700 dark:text-slate-300">{year}</td>
                      <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 text-right text-slate-600">{data.vendas}</td>
                      <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 text-right font-mono text-emerald-600">{fmt(data.rec)}</td>
                      <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 text-right font-mono text-rose-500">{fmt(data.cmv)}</td>
                      <td className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 text-right font-mono text-orange-500">{fmt(data.desp)}</td>
                      <td className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 text-right font-mono font-bold ${lucro >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(lucro)}</td>
                      <td className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 text-right font-mono font-bold ${margem >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {margem.toFixed(1)}%
                        {evolRec !== null && (
                          <span className={`ml-1 text-[10px] ${evolRec >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ({evolRec >= 0 ? '+' : ''}{evolRec.toFixed(1)}%)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Detalhamento Mensal</h3>
          <span className="text-[11px] text-slate-400">{monthlyData.length} meses</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {monthlyData.map(([key, data]) => {
            const monthSales = data.sales;
            const monthExpenses = data.expenses;
            const rec = monthSales.reduce((a, s) => a + s.total, 0);
            const cmv = monthSales.reduce((a, s) => a + s.totalCost, 0);
            const desp = monthExpenses.filter(e => e.status === 'paid').reduce((a, e) => a + e.amount, 0);
            const lb = rec - cmv;
            const rl = lb - desp;
            const isExpanded = expandedMonths.has(key);
            return (
              <div key={key}>
                <button
                  onClick={() => toggleMonth(key)}
                  className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {new Date(key + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-emerald-600">{fmt(rec)}</span>
                    <span className="text-slate-300">|</span>
                    <span className={rl >= 0 ? 'text-slate-800 dark:text-slate-200' : 'text-rose-500'}>{fmt(rl)}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-3 pl-14 space-y-1">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-slate-500">Receita</span>
                      <span className="font-semibold text-emerald-600">{fmt(rec)}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-slate-500">CMV</span>
                      <span className="font-semibold text-rose-500">{fmt(cmv)}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-slate-500">Lucro Bruto</span>
                      <span className="font-semibold text-indigo-600">{fmt(lb)} ({pct(lb, rec)})</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-slate-500">Despesas</span>
                      <span className="font-semibold text-rose-400">{fmt(desp)}</span>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-700/50 pt-1 flex justify-between text-[12px]">
                      <span className="text-slate-600 font-bold">Resultado</span>
                      <span className={`font-bold ${rl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{fmt(rl)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {monthlyData.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-slate-400">
              Nenhuma venda concluída encontrada neste período.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
