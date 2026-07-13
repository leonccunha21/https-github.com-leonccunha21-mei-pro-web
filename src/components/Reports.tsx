import React, { useState } from 'react';
import { Product, Sale, Category } from '../types';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  ShoppingBag,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  DollarSign,
  Target,
  Percent,
  Hash,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

const COLORS = ['#10B981', '#6366F1', '#8B5CF6', '#F59E0B', '#F43F5E', '#3B82F6', '#14B8A6', '#EC4899', '#1E40AF', '#059669'];

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-900">{d.name}</p>
      <p className="text-slate-600 mt-1">Receita: <span className="font-mono font-bold text-slate-900">{fmtBRL(d.value)}</span></p>
      <p className="text-slate-600">Lucro: <span className="font-mono font-bold text-emerald-600">{fmtBRL(d.payload.profit)}</span></p>
      <p className="text-slate-600">Margem: <span className="font-mono font-bold text-indigo-600">{d.payload.revenue > 0 ? ((d.payload.profit / d.payload.revenue) * 100).toFixed(0) : 0}%</span></p>
    </div>
  );
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-900 mb-1" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-slate-600">
          {p.name}: <span className="font-mono font-bold" style={{ color: p.color }}>{fmtBRL(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-900 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-slate-600">
          {p.name}: <span className="font-mono font-bold" style={{ color: p.color }}>{fmtBRL(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

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
  const totalVendasCount = completedSales.length;

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

  const pieData = activeCategoryReports.map(c => ({
    name: c.categoryName,
    value: Math.round(c.revenue * 100) / 100,
    revenue: c.revenue,
    cost: c.cost,
    profit: c.profit,
    itemsSold: c.itemsSold,
  }));

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
  const top10Products = activeProductReports.slice(0, 10);

  const barData = top10Products.map(p => ({
    name: p.productName.length > 18 ? p.productName.slice(0, 16) + '...' : p.productName,
    fullName: p.productName,
    receita: Math.round(p.revenue * 100) / 100,
    lucro: Math.round(p.profit * 100) / 100,
    custo: Math.round(p.cost * 100) / 100,
  }));

  const dailyRevenue: Record<string, number> = {};
  completedSales.forEach(sale => {
    const dateKey = new Date(sale.date).toLocaleDateString('pt-BR');
    dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + sale.total;
  });

  const sortedDates = Object.keys(dailyRevenue).sort((a, b) => {
    const [dA, mA, yA] = a.split('/').map(Number);
    const [dB, mB, yB] = b.split('/').map(Number);
    const dateA = new Date(yA, mA - 1, dA);
    const dateB = new Date(yB, mB - 1, dB);
    return dateA.getTime() - dateB.getTime();
  });

  const lineData = sortedDates.map(d => ({
    date: d,
    receita: Math.round(dailyRevenue[d] * 100) / 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Custom Date Range */}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ticket Médio</span>
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 block mt-2">
            {averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Faturamento / N° de vendas</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">ROI</span>
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-600 block mt-2">
            {roi.toFixed(1)}%
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Lucro / Custo investido</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Percent className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Markup</span>
          </div>
          <span className="text-2xl font-bold font-mono text-purple-600 block mt-2">
            {totalFaturamento > 0 ? ((lucroReal / totalFaturamento) * 100).toFixed(1) : 0}%
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Margem líquida sobre receita</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Hash className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total de Vendas</span>
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 block mt-2">
            {totalVendasCount}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Vendas concluídas no período</p>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Resumo Geral</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Receita Total</span>
            <span className="text-xl font-bold font-mono text-indigo-600 block mt-2">{fmtBRL(totalFaturamento)}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Custo Total</span>
            <span className="text-xl font-bold font-mono text-rose-600 block mt-2">{fmtBRL(totalCustoVendas)}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lucro Total</span>
            <span className="text-xl font-bold font-mono text-emerald-600 block mt-2">{fmtBRL(lucroReal)}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Vendas Concluídas</span>
            <span className="text-xl font-bold font-mono text-slate-900 block mt-2">{totalVendasCount}</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Pie + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart - Revenue by Category */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
            <PieChartIcon className="h-5 w-5 text-slate-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Receita por Categoria</h2>
              <p className="text-xs text-slate-400 mt-0.5">Distribuição percentual do faturamento.</p>
            </div>
          </div>

          {pieData.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-medium">Nenhuma categoria registrou vendas neste período.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                {pieData.map((d, idx) => {
                  const total = pieData.reduce((s, p) => s + p.value, 0);
                  const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
                  return (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="font-medium">{d.name}</span>
                      <span className="text-slate-400 font-mono">({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Top 10 Products */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Top 10 Produtos por Receita</h2>
              <p className="text-xs text-slate-400 mt-0.5">Produtos mais vendidos no período.</p>
            </div>
          </div>

          {barData.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-medium">Nenhum produto registrou vendas neste período.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(value: string) => <span className="text-slate-600">{value}</span>}
                />
                <Bar dataKey="receita" name="Receita" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="lucro" name="Lucro" fill="#10B981" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Line Chart - Daily Revenue Trend */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
          <LineChartIcon className="h-5 w-5 text-slate-500" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Tendência de Receita Diária</h2>
            <p className="text-xs text-slate-400 mt-0.5">Evolução do faturamento ao longo do tempo.</p>
          </div>
        </div>

        {lineData.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm font-medium">Nenhuma venda registrada neste período.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line
                type="monotone"
                dataKey="receita"
                name="Receita"
                stroke="#6366F1"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Performance Detail Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
          <PieChartIcon className="h-5 w-5 text-slate-500" />
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-2">Categoria</th>
                  <th className="pb-3 text-center">Un.</th>
                  <th className="pb-3 text-right">Faturamento</th>
                  <th className="pb-3 text-right">Custo</th>
                  <th className="pb-3 text-right">Lucro</th>
                  <th className="pb-3 text-right">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {activeCategoryReports.map((cat, idx) => {
                  const catMargin = cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 pr-2 font-bold text-slate-900">{cat.categoryName}</td>
                      <td className="py-2.5 text-center font-mono text-slate-600">{cat.itemsSold}</td>
                      <td className="py-2.5 text-right font-mono text-slate-900 font-medium">
                        {fmtBRL(cat.revenue)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-rose-500">
                        {fmtBRL(cat.cost)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">
                        {fmtBRL(cat.profit)}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-indigo-600">{catMargin.toFixed(0)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Performance Table */}
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
                {top10Products.map((prod, idx) => {
                  const prodMargin = prod.revenue > 0 ? (prod.profit / prod.revenue) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 pr-2 font-bold text-slate-900">
                        <p className="line-clamp-1" title={prod.productName}>{prod.productName}</p>
                        <span className="text-[9px] text-slate-400 font-normal uppercase tracking-wider">{prod.category}</span>
                      </td>
                      <td className="py-2.5 text-center font-mono text-slate-600">{prod.itemsSold}</td>
                      <td className="py-2.5 text-right font-mono text-slate-900 font-medium">
                        {fmtBRL(prod.revenue)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">
                        {fmtBRL(prod.profit)}
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
  );
}
