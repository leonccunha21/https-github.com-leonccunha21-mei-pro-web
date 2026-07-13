import React, { useState, useMemo } from 'react';
import { Product, Sale, Category, PaymentMethod } from '../types';
import { 
  TrendingUp, 
  PieChart,
  ShoppingBag,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface ReportsProps {
  products: Product[];
  sales: Sale[];
  categories: Category[];
}

const paymentMethodLabels: Record<string, string> = {
  all: 'Todas',
  pix: 'PIX',
  money: 'Dinheiro',
  card_credit: 'Cartão Crédito',
  card_debit: 'Cartão Débito',
  transfer: 'Transferência',
};

const timeRangeLabels: Record<string, string> = {
  all: 'Todas',
  '7days': '7 Dias',
  '30days': '30 Dias',
  '1year': '1 Ano',
};

export default function Reports({ products, sales, categories }: ReportsProps) {
  const [viewMode, setViewMode] = useState<'resume' | 'monthly' | 'yearly'>('resume');
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [resumeTimeRange, setResumeTimeRange] = useState<'all' | '7days' | '30days' | '1year'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');

  const completedSales = useMemo(() => sales.filter(s => s.status === 'completed'), [sales]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    completedSales.forEach(s => years.add(new Date(s.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [completedSales]);

  const allCategoryNames = useMemo(() => {
    const names = new Set<string>();
    products.forEach(p => names.add(p.category));
    categories.forEach(c => names.add(c.name));
    return Array.from(names).sort();
  }, [products, categories]);

  const filteredSales = useMemo(() => {
    let result = completedSales;

    if (resumeTimeRange !== 'all') {
      const now = new Date();
      let cutoff: Date;
      if (resumeTimeRange === '7days') {
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (resumeTimeRange === '30days') {
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      }
      result = result.filter(s => new Date(s.date) >= cutoff);
    }

    if (selectedPayment !== 'all') {
      result = result.filter(s => s.paymentMethod === selectedPayment);
    }

    if (selectedCategory !== 'all') {
      result = result.filter(s =>
        s.items.some(item => {
          const origProduct = products.find(p => p.id === item.productId);
          return (origProduct ? origProduct.category : 'Outros') === selectedCategory;
        })
      );
    }

    return result;
  }, [completedSales, resumeTimeRange, selectedPayment, selectedCategory, products]);

  const resumeData = useMemo(() => {
    const totalFaturamento = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const totalCusto = filteredSales.reduce((acc, s) => acc + s.totalCost, 0);
    const lucro = totalFaturamento - totalCusto;
    const avgTicket = filteredSales.length > 0 ? totalFaturamento / filteredSales.length : 0;
    const roi = totalCusto > 0 ? (lucro / totalCusto) * 100 : 0;
    const margin = totalFaturamento > 0 ? (lucro / totalFaturamento) * 100 : 0;
    return { totalFaturamento, totalCusto, lucro, avgTicket, roi, margin };
  }, [filteredSales]);

  const monthlyData = useMemo(() => {
    const yearSales = filteredSales.filter(s => new Date(s.date).getFullYear() === selectedYear);
    const months: Record<number, { revenue: number; cost: number; profit: number; count: number }> = {};
    
    for (let m = 1; m <= 12; m++) {
      months[m] = { revenue: 0, cost: 0, profit: 0, count: 0 };
    }
    
    yearSales.forEach(sale => {
      const m = new Date(sale.date).getMonth() + 1;
      months[m].revenue += sale.total;
      months[m].cost += sale.totalCost;
      months[m].profit += sale.profit;
      months[m].count++;
    });
    
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const result = Object.entries(months).map(([m, data]) => ({
      month: parseInt(m),
      name: monthNames[parseInt(m) - 1],
      ...data,
      margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0
    }));
    
    const yearTotal = result.reduce((acc, r) => ({
      revenue: acc.revenue + r.revenue,
      cost: acc.cost + r.cost,
      profit: acc.profit + r.profit,
      count: acc.count + r.count
    }), { revenue: 0, cost: 0, profit: 0, count: 0 });
    
    return { months: result, yearTotal };
  }, [filteredSales, selectedYear]);

  const yearlyData = useMemo(() => {
    const years: Record<number, { revenue: number; cost: number; profit: number; count: number }> = {};
    
    filteredSales.forEach(sale => {
      const y = new Date(sale.date).getFullYear();
      if (!years[y]) years[y] = { revenue: 0, cost: 0, profit: 0, count: 0 };
      years[y].revenue += sale.total;
      years[y].cost += sale.totalCost;
      years[y].profit += sale.profit;
      years[y].count++;
    });
    
    return Object.entries(years)
      .map(([y, data]) => ({ year: parseInt(y), ...data, margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0 }))
      .sort((a, b) => b.year - a.year);
  }, [filteredSales]);

  const maxMonthlyRevenue = Math.max(...monthlyData.months.map(m => m.revenue), 1);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { revenue: number; cost: number; profit: number; itemsSold: number }> = {};
    categories.forEach(cat => { stats[cat.name] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 }; });
    stats['Outros'] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 };
    
    filteredSales.forEach(sale => {
      const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
      const discountRatio = subtotal > 0 ? (sale.total / subtotal) : 1;
      sale.items.forEach(item => {
        const origProduct = products.find(p => p.id === item.productId);
        const catName = origProduct ? origProduct.category : 'Outros';
        if (!stats[catName]) stats[catName] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 };
        const effectiveTotal = item.total * discountRatio;
        stats[catName].itemsSold += item.quantity;
        stats[catName].revenue += effectiveTotal;
        stats[catName].cost += item.costPrice * item.quantity;
        stats[catName].profit += effectiveTotal - (item.costPrice * item.quantity);
      });
    });
    
    return Object.entries(stats)
      .map(([categoryName, s]) => ({ categoryName, ...s }))
      .filter(c => c.revenue > 0 || c.itemsSold > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales, products, categories]);

  const productStats = useMemo(() => {
    const stats: Record<string, { productName: string; category: string; revenue: number; cost: number; profit: number; itemsSold: number }> = {};
    
    filteredSales.forEach(sale => {
      const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
      const discountRatio = subtotal > 0 ? (sale.total / subtotal) : 1;
      sale.items.forEach(item => {
        const origProduct = products.find(p => p.id === item.productId);
        const catName = origProduct ? origProduct.category : 'Outros';
        const key = item.productId || item.productName;
        if (!stats[key]) stats[key] = { productName: item.productName, category: catName, revenue: 0, cost: 0, profit: 0, itemsSold: 0 };
        const effectiveTotal = item.total * discountRatio;
        stats[key].itemsSold += item.quantity;
        stats[key].revenue += effectiveTotal;
        stats[key].cost += item.costPrice * item.quantity;
        stats[key].profit += effectiveTotal - (item.costPrice * item.quantity);
      });
    });
    
    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales, products]);

  const maxCategoryRevenue = Math.max(...categoryStats.map(c => c.revenue), 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
            Relatórios
          </h1>
          <p className="text-sm text-slate-500 mt-1">Análise comparativa de desempenho por período, categoria e produto.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
          <button onClick={() => setViewMode('resume')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'resume' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}>
            Resumo Geral
          </button>
          <button onClick={() => setViewMode('monthly')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}>
            Por Mês
          </button>
          <button onClick={() => setViewMode('yearly')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'yearly' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}>
            Por Ano
          </button>
        </div>
      </div>

      {/* ========== FILTER BAR ========== */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">Período:</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          {(Object.keys(timeRangeLabels) as Array<'all' | '7days' | '30days' | '1year'>).map(key => (
            <button
              key={key}
              onClick={() => setResumeTimeRange(key)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${resumeTimeRange === key ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {timeRangeLabels[key]}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200" />

        <div className="flex items-center gap-1.5">
          <PieChart className="h-3.5 w-3.5 text-slate-400" />
          <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria:</label>
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-medium bg-white"
        >
          <option value="all">Todas</option>
          {allCategoryNames.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="w-px h-5 bg-slate-200" />

        <div className="flex items-center gap-1.5">
          <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
          <label className="text-[10px] font-bold text-slate-500 uppercase">Pagamento:</label>
        </div>
        <select
          value={selectedPayment}
          onChange={e => setSelectedPayment(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-medium bg-white"
        >
          {Object.entries(paymentMethodLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <span className="text-[10px] text-slate-400 font-medium ml-auto">
          {filteredSales.length} venda{filteredSales.length !== 1 ? 's' : ''} | {filteredSales.reduce((acc, s) => acc + s.total, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      {/* ========== RESUME VIEW ========== */}
      {viewMode === 'resume' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Ticket Médio</span>
              <span className="text-2xl font-bold font-mono text-slate-900 block mt-3">{resumeData.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              <p className="text-xs text-slate-400 mt-1.5">Faturamento / nº de vendas.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">ROI (Retorno)</span>
              <span className="text-2xl font-bold font-mono text-emerald-600 block mt-3">{resumeData.roi.toFixed(1)}%</span>
              <p className="text-xs text-slate-400 mt-1.5">Lucro para cada R$ 1,00 investido.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Margem Líquida</span>
              <span className="text-2xl font-bold font-mono text-indigo-600 block mt-3">{resumeData.margin.toFixed(1)}%</span>
              <p className="text-xs text-slate-400 mt-1.5">% de lucro sobre faturamento.</p>
            </div>
          </div>

          {yearlyData.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <BarChart3 className="h-5 w-5 text-slate-500" />
                <h2 className="text-base font-bold text-slate-900">Comparativo Anual</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Ano</th>
                      <th className="pb-3 text-center">Vendas</th>
                      <th className="pb-3 text-right">Faturamento</th>
                      <th className="pb-3 text-right">Custo</th>
                      <th className="pb-3 text-right">Lucro</th>
                      <th className="pb-3 text-right">Margem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {yearlyData.map((yd, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 font-bold text-slate-900">{yd.year}</td>
                        <td className="py-2.5 text-center font-mono text-slate-600">{yd.count}</td>
                        <td className="py-2.5 text-right font-mono text-slate-900 font-medium">{yd.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="py-2.5 text-right font-mono text-slate-500">{yd.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">{yd.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-indigo-600">{yd.margin.toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========== MONTHLY VIEW ========== */}
      {viewMode === 'monthly' && (
        <>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <label className="text-[10px] font-bold text-slate-500 uppercase">Ano:</label>
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-medium">
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="text-[10px] text-slate-400 font-medium ml-2">
              {monthlyData.yearTotal.count} vendas | {monthlyData.yearTotal.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Faturamento {selectedYear}</span>
              <span className="text-xl font-bold font-mono text-slate-900 block mt-2">{monthlyData.yearTotal.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Custo {selectedYear}</span>
              <span className="text-xl font-bold font-mono text-amber-600 block mt-2">{monthlyData.yearTotal.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lucro {selectedYear}</span>
              <span className="text-xl font-bold font-mono text-emerald-600 block mt-2">{monthlyData.yearTotal.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Nº Vendas {selectedYear}</span>
              <span className="text-xl font-bold font-mono text-indigo-600 block mt-2">{monthlyData.yearTotal.count}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Faturamento Mensal - {selectedYear}</h2>
            
            <div className="relative h-48 w-full mb-6">
              <svg className="w-full h-full" viewBox="0 0 700 180" preserveAspectRatio="xMidYMid meet">
                {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => (
                  <g key={idx}>
                    <line x1="40" y1={10 + val * 140} x2="680" y2={10 + val * 140} stroke="#F1F5F9" strokeWidth="1" />
                    <text x="35" y={14 + val * 140} textAnchor="end" className="text-[8px] fill-slate-400 font-mono">
                      {Math.round(maxMonthlyRevenue - maxMonthlyRevenue * val)}
                    </text>
                  </g>
                ))}
                {monthlyData.months.map((m, i) => {
                  const x = 50 + i * 52;
                  const barH = (m.revenue / maxMonthlyRevenue) * 140;
                  const profitH = (m.profit / maxMonthlyRevenue) * 140;
                  return (
                    <g key={i}>
                      <rect x={x} y={150 - barH} width="20" height={barH} fill="#4F46E5" rx="2" className="hover:opacity-80 transition-opacity">
                        <title>{`${m.name}: R$ ${m.revenue.toFixed(2)}`}</title>
                      </rect>
                      <rect x={x + 22} y={150 - profitH} width="20" height={profitH} fill="#10B981" rx="2" className="hover:opacity-80 transition-opacity">
                        <title>{`${m.name} Lucro: R$ ${m.profit.toFixed(2)}`}</title>
                      </rect>
                      <text x={x + 21} y={168} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">{m.name}</text>
                    </g>
                  );
                })}
                <rect x={590} y={5} width={8} height={8} fill="#4F46E5" rx="1" />
                <text x={600} y={13} className="text-[9px] fill-slate-500 font-medium">Receita</text>
                <rect x={640} y={5} width={8} height={8} fill="#10B981" rx="1" />
                <text x={650} y={13} className="text-[9px] fill-slate-500 font-medium">Lucro</text>
              </svg>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Mês</th>
                    <th className="pb-3 text-center">Vendas</th>
                    <th className="pb-3 text-right">Faturamento</th>
                    <th className="pb-3 text-right">Custo</th>
                    <th className="pb-3 text-right">Lucro</th>
                    <th className="pb-3 text-right">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {monthlyData.months.map((m, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${m.count === 0 ? 'opacity-40' : ''}`}>
                      <td className="py-2 font-bold text-slate-900">{m.name}</td>
                      <td className="py-2 text-center font-mono text-slate-600">{m.count}</td>
                      <td className="py-2 text-right font-mono text-slate-900 font-medium">{m.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="py-2 text-right font-mono text-slate-500">{m.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="py-2 text-right font-mono text-emerald-600 font-bold">{m.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="py-2 text-right font-mono font-bold text-indigo-600">{m.margin.toFixed(0)}%</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-300 font-bold">
                    <td className="py-2 text-slate-900">TOTAL {selectedYear}</td>
                    <td className="py-2 text-center font-mono text-slate-900">{monthlyData.yearTotal.count}</td>
                    <td className="py-2 text-right font-mono text-slate-900">{monthlyData.yearTotal.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="py-2 text-right font-mono text-slate-900">{monthlyData.yearTotal.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="py-2 text-right font-mono text-emerald-600">{monthlyData.yearTotal.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="py-2 text-right font-mono text-indigo-600">{monthlyData.yearTotal.revenue > 0 ? ((monthlyData.yearTotal.profit / monthlyData.yearTotal.revenue) * 100).toFixed(0) : 0}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========== YEARLY VIEW ========== */}
      {viewMode === 'yearly' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900">Comparativo Anual Detalhado</h2>
          </div>

          {yearlyData.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-medium">Nenhuma venda registrada.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {yearlyData.map((yd, idx) => {
                  const prevYear = yearlyData[idx + 1];
                  const revenueChange = prevYear ? ((yd.revenue - prevYear.revenue) / prevYear.revenue) * 100 : null;
                  
                  return (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-slate-900">{yd.year}</span>
                        {revenueChange !== null && (
                          <span className={`flex items-center gap-0.5 text-[10px] font-bold ${revenueChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(revenueChange).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-slate-500">Vendas:</span><span className="font-bold text-slate-900">{yd.count}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Receita:</span><span className="font-bold text-slate-900">{yd.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Custo:</span><span className="font-medium text-slate-600">{yd.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        <div className="flex justify-between border-t border-slate-200 pt-1.5"><span className="text-slate-500">Lucro:</span><span className="font-bold text-emerald-600">{yd.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Margem:</span><span className="font-bold text-indigo-600">{yd.margin.toFixed(1)}%</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Ano</th>
                      <th className="pb-3 text-center">Vendas</th>
                      <th className="pb-3 text-right">Faturamento</th>
                      <th className="pb-3 text-right">Custo</th>
                      <th className="pb-3 text-right">Lucro</th>
                      <th className="pb-3 text-right">Margem</th>
                      <th className="pb-3 text-right">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {yearlyData.map((yd, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 font-bold text-slate-900">{yd.year}</td>
                        <td className="py-2.5 text-center font-mono text-slate-600">{yd.count}</td>
                        <td className="py-2.5 text-right font-mono text-slate-900 font-medium">{yd.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="py-2.5 text-right font-mono text-slate-500">{yd.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">{yd.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-indigo-600">{yd.margin.toFixed(0)}%</td>
                        <td className="py-2.5 text-right font-mono text-slate-900">{yd.count > 0 ? (yd.revenue / yd.count).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========== CATEGORY & PRODUCT (always shown) ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
            <PieChart className="h-5 w-5 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900">Por Categoria</h2>
          </div>
          {categoryStats.length === 0 ? (
            <div className="text-center py-8 text-slate-400"><p className="text-sm">Nenhuma categoria registrou vendas.</p></div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {categoryStats.map((cat, idx) => {
                const percentageOfMax = (cat.revenue / maxCategoryRevenue) * 100;
                const catMargin = cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{cat.categoryName}</span>
                      <span className="font-mono text-slate-500">{cat.itemsSold} un • <strong className="text-slate-900">{cat.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div style={{ width: `${percentageOfMax}%` }} className="bg-indigo-600 h-full rounded-full transition-all duration-500" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Custo: {cat.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      <span className="text-emerald-600 font-semibold">Lucro: {cat.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({catMargin.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
            <ShoppingBag className="h-5 w-5 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900">Top 10 Produtos</h2>
          </div>
          {productStats.length === 0 ? (
            <div className="text-center py-8 text-slate-400"><p className="text-sm">Nenhum produto registrou vendas.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-2">Produto</th>
                    <th className="pb-3 text-center">Un.</th>
                    <th className="pb-3 text-right">Faturamento</th>
                    <th className="pb-3 text-right">Lucro</th>
                    <th className="pb-3 text-right">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {productStats.slice(0, 10).map((prod, idx) => {
                    const prodMargin = prod.revenue > 0 ? (prod.profit / prod.revenue) * 100 : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 pr-2 font-bold text-slate-900">
                          <p className="line-clamp-1" title={prod.productName}>{prod.productName}</p>
                          <span className="text-[9px] text-slate-400 font-normal uppercase">{prod.category}</span>
                        </td>
                        <td className="py-2 text-center font-mono text-slate-600">{prod.itemsSold}</td>
                        <td className="py-2 text-right font-mono text-slate-900 font-medium">{prod.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="py-2 text-right font-mono text-emerald-600 font-bold">{prod.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="py-2 text-right font-mono font-bold text-indigo-600">{prodMargin.toFixed(0)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
