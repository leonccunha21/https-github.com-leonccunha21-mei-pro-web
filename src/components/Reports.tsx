import React, { useState } from 'react';
import { Product, Sale, Category } from '../types';
import { 
  TrendingUp, 
  PieChart,
  ShoppingBag,
  Calendar
} from 'lucide-react';

interface ReportsProps {
  products: Product[];
  sales: Sale[];
  categories: Category[];
}

export default function Reports({ products, sales, categories }: ReportsProps) {
  const [timeRange, setTimeRange] = useState<'all' | '1day' | '7days' | '14days' | '30days' | '1year' | 'custom'>('all');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  // Filter completed sales by time range
  const completedSales = sales.filter(s => {
    if (s.status !== 'completed') return false;
    if (timeRange === 'all') return true;
    const saleDate = new Date(s.date);
    const now = new Date();
    if (timeRange === 'custom') {
      const start = new Date(customStart + 'T00:00:00');
      const end = new Date(customEnd + 'T23:59:59');
      return saleDate >= start && saleDate <= end;
    }
    const daysToCount = timeRange === '1day' ? 1 : timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : timeRange === '30days' ? 30 : 365;
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - daysToCount);
    cutoff.setHours(0, 0, 0, 0);
    return saleDate >= cutoff;
  });

  const totalFaturamento = completedSales.reduce((acc, s) => acc + s.total, 0);
  const totalCustoVendas = completedSales.reduce((acc, s) => acc + s.totalCost, 0);
  const lucroReal = totalFaturamento - totalCustoVendas;
  const roi = totalCustoVendas > 0 ? (lucroReal / totalCustoVendas) * 100 : 0;
  const averageTicket = completedSales.length > 0 ? (totalFaturamento / completedSales.length) : 0;

  const categoryStats: Record<string, { revenue: number; cost: number; profit: number; itemsSold: number }> = {};
  categories.forEach(cat => {
    categoryStats[cat.name] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 };
  });
  categoryStats['Outros'] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 };

  completedSales.forEach(sale => {
    const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
    const discountRatio = subtotal > 0 ? (sale.total / subtotal) : 1;

    sale.items.forEach(item => {
      const origProduct = products.find(p => p.id === item.productId);
      const catName = origProduct ? origProduct.category : 'Outros';
      if (!categoryStats[catName]) {
        categoryStats[catName] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 };
      }
      const effectiveTotal = item.total * discountRatio;
      const effectiveProfit = effectiveTotal - (item.costPrice * item.quantity);
      categoryStats[catName].itemsSold += item.quantity;
      categoryStats[catName].revenue += effectiveTotal;
      categoryStats[catName].cost += item.costPrice * item.quantity;
      categoryStats[catName].profit += effectiveProfit;
    });
  });

  const activeCategoryReports = Object.entries(categoryStats)
    .map(([categoryName, stats]) => ({ categoryName, ...stats }))
    .filter(c => c.revenue > 0 || c.itemsSold > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const maxCategoryRevenue = Math.max(...activeCategoryReports.map(c => c.revenue), 100);

  const productStats: Record<string, { productName: string; category: string; revenue: number; cost: number; profit: number; itemsSold: number }> = {};

  completedSales.forEach(sale => {
    const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
    const discountRatio = subtotal > 0 ? (sale.total / subtotal) : 1;

    sale.items.forEach(item => {
      const origProduct = products.find(p => p.id === item.productId);
      const catName = origProduct ? origProduct.category : 'Outros';
      const key = item.productId || item.productName;
      if (!productStats[key]) {
        productStats[key] = { productName: item.productName, category: catName, revenue: 0, cost: 0, profit: 0, itemsSold: 0 };
      }
      const effectiveTotal = item.total * discountRatio;
      const effectiveProfit = effectiveTotal - (item.costPrice * item.quantity);
      productStats[key].itemsSold += item.quantity;
      productStats[key].revenue += effectiveTotal;
      productStats[key].cost += item.costPrice * item.quantity;
      productStats[key].profit += effectiveProfit;
    });
  });

  const activeProductReports = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-slate-500" />
            Relatórios
          </h1>
          <p className="text-sm text-slate-500 mt-1">Análise de desempenho por categoria e produto.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
          {[
            { key: 'all' as const, label: 'Todas' },
            { key: '1day' as const, label: '1 Dia' },
            { key: '7days' as const, label: '7 Dias' },
            { key: '14days' as const, label: '14 Dias' },
            { key: '30days' as const, label: '30 Dias' },
            { key: '1year' as const, label: '1 Ano' },
            { key: 'custom' as const, label: 'Personalizado' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setTimeRange(opt.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeRange === opt.key ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {timeRange === 'custom' && (
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Ticket Médio por Venda</span>
          <span className="text-2xl font-bold font-mono text-slate-900 block mt-3">
            {averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <p className="text-xs text-slate-400 mt-1.5">Faturamento total dividido pelo número de vendas.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Retorno Sobre Investimento (ROI)</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 block mt-3">
            {roi.toFixed(1)}%
          </span>
          <p className="text-xs text-slate-400 mt-1.5">Lucro para cada R$ 1,00 de custo investido.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Markup Geral / Margem Média</span>
          <span className="text-2xl font-bold font-mono text-indigo-600 block mt-3">
            {totalFaturamento > 0 ? ((lucroReal / totalFaturamento) * 100).toFixed(1) : 0}%
          </span>
          <p className="text-xs text-slate-400 mt-1.5">Porcentagem líquida de lucro sobre o faturamento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Category Performance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
            <PieChart className="h-5 w-5 text-slate-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Desempenho por Categoria</h2>
              <p className="text-xs text-slate-400 mt-0.5">Faturamento, volume e lucratividade por setor.</p>
            </div>
          </div>

          {activeCategoryReports.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-medium">Nenhuma categoria registrou vendas neste período.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {activeCategoryReports.map((cat, idx) => {
                const percentageOfMax = (cat.revenue / maxCategoryRevenue) * 100;
                const catMargin = cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{cat.categoryName}</span>
                      <span className="font-mono text-slate-500">
                        {cat.itemsSold} un. •{' '}
                        <strong className="text-slate-900 font-bold">
                          {cat.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </strong>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div style={{ width: `${percentageOfMax}%` }} className="bg-indigo-600 h-full rounded-full transition-all duration-500" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Custo: {cat.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      <div className="flex gap-2">
                        <span className="text-emerald-600 font-semibold">Lucro: {cat.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        <span className="text-indigo-600 font-bold font-mono">{catMargin.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Performance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
            <ShoppingBag className="h-5 w-5 text-slate-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Desempenho por Produto</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ranking dos produtos mais vendidos.</p>
            </div>
          </div>

          {activeProductReports.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-medium">Nenhum produto registrou vendas neste período.</p>
            </div>
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
                  {activeProductReports.slice(0, 10).map((prod, idx) => {
                    const prodMargin = prod.revenue > 0 ? (prod.profit / prod.revenue) * 100 : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 pr-2 font-bold text-slate-900">
                          <p className="line-clamp-1" title={prod.productName}>{prod.productName}</p>
                          <span className="text-[9px] text-slate-400 font-normal uppercase tracking-wider">{prod.category}</span>
                        </td>
                        <td className="py-2.5 text-center font-mono text-slate-600">{prod.itemsSold}</td>
                        <td className="py-2.5 text-right font-mono text-slate-900 font-medium">
                          {prod.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">
                          {prod.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-indigo-600">{prodMargin.toFixed(0)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {activeProductReports.length > 10 && (
                <p className="text-[10px] text-slate-400 text-center mt-3 font-semibold">
                  Mostrando os 10 mais vendidos.
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
