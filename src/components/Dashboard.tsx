import React, { useState } from 'react';
import { Product, Sale } from '../types';
import { 
  TrendingUp, 
  ArrowDownRight, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Percent, 
  ShoppingBag,
  ArrowRight,
  Calendar,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  onNavigate: (tab: 'products' | 'pos' | 'sales') => void;
}

export default function Dashboard({ products, sales, onNavigate }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'1day' | '30days'>('1day');

  // Filter completed sales
  const completedSales = sales.filter(s => s.status === 'completed');

  // Calculate metrics
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total, 0);
  const totalCost = completedSales.reduce((acc, s) => acc + s.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Stock alerts
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const totalInventoryQuantity = products.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryCostValue = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const totalInventoryRetailValue = products.reduce((acc, p) => acc + (p.stock * p.salePrice), 0);

  // Top Selling Products
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};
  
  completedSales.forEach(sale => {
    const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
    const discountRatio = subtotal > 0 ? (sale.total / subtotal) : 1;

    sale.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          qty: 0,
          revenue: 0,
          profit: 0
        };
      }
      const effectiveTotal = item.total * discountRatio;
      const effectiveProfit = effectiveTotal - (item.costPrice * item.quantity);

      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += effectiveTotal;
      productSalesMap[item.productId].profit += effectiveProfit;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Prepare dynamic chart data for last 7 days
  const getChartData = () => {
    const daysToCount = timeRange === '1day' ? 1 : 30;
    const data: { dateLabel: string; revenue: number; profit: number; rawDate: Date }[] = [];
    
    for (let i = daysToCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const daySales = completedSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getDate() === d.getDate() && 
               saleDate.getMonth() === d.getMonth() && 
               saleDate.getFullYear() === d.getFullYear();
      });

      const revenue = daySales.reduce((acc, s) => acc + s.total, 0);
      const profit = daySales.reduce((acc, s) => acc + s.profit, 0);
      
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayNum = d.getDate();
      
      data.push({
        dateLabel: `${dayNum} ${weekday.replace('.', '')}`,
        revenue,
        profit,
        rawDate: d
      });
    }
    return data;
  };

  const chartData = getChartData();
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);

  // Payment method stats
  const paymentMethodLabels: Record<string, string> = {
    money: 'Dinheiro',
    card_credit: 'Cartão Crédito',
    card_debit: 'Cartão Débito',
    pix: 'PIX',
    transfer: 'Transferência'
  };

  const paymentMethodColors: Record<string, string> = {
    money: '#10B981', // green
    card_credit: '#3B82F6', // blue
    card_debit: '#6366F1', // indigo
    pix: '#8B5CF6', // purple
    transfer: '#F59E0B' // amber
  };

  const paymentStats = completedSales.reduce((acc, sale) => {
    const method = sale.paymentMethod;
    acc[method] = (acc[method] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const totalPaymentValue = Object.values(paymentStats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Time Range selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 id="dashboard-title" className="text-2xl font-bold tracking-tight text-slate-900">Painel de Controle</h1>
          <p className="text-sm text-slate-500 mt-1">Visão geral do desempenho de vendas, estoque e rentabilidade da sua loja.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Quick Sale Action Button */}
          <button
            id="quick-start-sale-btn"
            onClick={() => onNavigate('pos')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            Iniciar Nova Venda
          </button>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
            <button
              id="range-1day"
              onClick={() => setTimeRange('1day')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeRange === '1day' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Último Dia
            </button>
            <button
              id="range-30days"
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeRange === '30days' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Últimos 30 Dias
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento */}
        <div id="kpi-faturamento" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Faturamento Total</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>Receita de {completedSales.length} vendas</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Custo */}
        <div id="kpi-custo" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Custo de Vendas</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900">
              {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <Layers className="h-3 w-3 text-slate-400" />
              <span>Custo pago das mercadorias</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Lucro */}
        <div id="kpi-lucro" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lucro Líquido</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900">
              {totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs text-indigo-600">
              <Percent className="h-3 w-3" />
              <span>Margem líquida de {averageMargin.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Alerta Estoque */}
        <div id="kpi-estoque" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Alertas de Estoque</span>
            <div className={`p-2 rounded-lg ${lowStockProducts.length > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900">
              {lowStockProducts.length}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {lowStockProducts.length > 0 ? (
                <span className="text-rose-600 font-medium">Produtos abaixo do mínimo!</span>
              ) : (
                <span className="text-slate-500">Todos os níveis saudáveis</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (bespoke SVG area chart) */}
        <div id="sales-chart-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Faturamento Diário</h2>
              <p className="text-xs text-slate-400 mt-0.5">Evolução de faturamento e lucro no período selecionado.</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-indigo-600 rounded-xs inline-block"></span>
                <span className="text-slate-500 font-medium">Vendas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-xs inline-block"></span>
                <span className="text-slate-500 font-medium">Lucro</span>
              </div>
            </div>
          </div>

          {/* SVG Custom Area Chart */}
          <div className="relative h-64 w-full select-none">
            {chartData.length > 0 && (
              <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                <defs>
                  {/* Gradients */}
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => (
                  <line 
                    key={idx} 
                    x1="40" 
                    y1={30 + val * 160} 
                    x2="580" 
                    y2={30 + val * 160} 
                    stroke="#F1F5F9" 
                    strokeWidth="1" 
                  />
                ))}

                {/* Y-Axis scale markers */}
                {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                  const labelVal = maxRevenue - (maxRevenue * val);
                  return (
                    <text 
                      key={idx} 
                      x="35" 
                      y={34 + val * 160} 
                      textAnchor="end" 
                      className="text-[10px] font-mono fill-slate-400"
                    >
                      {Math.round(labelVal)}
                    </text>
                  );
                })}

                {/* Generate paths */}
                {(() => {
                  const width = 540;
                  const step = width / (chartData.length - 1 || 1);
                  const pointsRev: string[] = [];
                  const pointsProf: string[] = [];
                  const areaPointsRev: string[] = [];
                  const areaPointsProf: string[] = [];

                  chartData.forEach((d, i) => {
                    const x = 40 + i * step;
                    // Formula to convert value to coordinate: y = 190 - (val / maxRevenue) * 160
                    const yRev = 190 - (d.revenue / maxRevenue) * 160;
                    const yProf = 190 - (d.profit / maxRevenue) * 160;

                    pointsRev.push(`${x},${yRev}`);
                    pointsProf.push(`${x},${yProf}`);

                    if (i === 0) {
                      areaPointsRev.push(`40,190`);
                      areaPointsProf.push(`40,190`);
                    }
                    areaPointsRev.push(`${x},${yRev}`);
                    areaPointsProf.push(`${x},${yProf}`);
                    if (i === chartData.length - 1) {
                      areaPointsRev.push(`${x},190`);
                      areaPointsProf.push(`${x},190`);
                    }
                  });

                  return (
                    <>
                      {/* Fills */}
                      <polygon points={areaPointsRev.join(' ')} fill="url(#colorRevenue)" />
                      <polygon points={areaPointsProf.join(' ')} fill="url(#colorProfit)" />

                      {/* Stroke lines */}
                      <polyline points={pointsRev.join(' ')} fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points={pointsProf.join(' ')} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Dots on hover effect */}
                      {chartData.map((d, i) => {
                        const x = 40 + i * step;
                        const yRev = 190 - (d.revenue / maxRevenue) * 160;
                        const yProf = 190 - (d.profit / maxRevenue) * 160;
                        return (
                          <g key={i} className="group/dot cursor-pointer">
                            <circle cx={x} cy={yRev} r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="1.5" />
                            <circle cx={x} cy={yProf} r="3" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />
                            
                            {/* Simple dynamic tooltip in-SVG */}
                            <rect x={x - 45} y={Math.min(yRev, yProf) - 45} width="90" height="35" rx="4" fill="#0F172A" opacity="0" className="group-hover/dot:opacity-100 transition-opacity" />
                            <text x={x} y={Math.min(yRev, yProf) - 34} textAnchor="middle" fill="#FFFFFF" className="text-[8px] font-bold select-none pointer-events-none opacity-0 group-hover/dot:opacity-100 transition-opacity">
                              Venda: R${d.revenue.toFixed(0)}
                            </text>
                            <text x={x} y={Math.min(yRev, yProf) - 24} textAnchor="middle" fill="#10B981" className="text-[8px] font-mono select-none pointer-events-none opacity-0 group-hover/dot:opacity-100 transition-opacity">
                              Lucro: R${d.profit.toFixed(0)}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}

                {/* X-Axis scale labels */}
                {chartData.map((d, i) => {
                  const width = 540;
                  const step = width / (chartData.length - 1 || 1);
                  const x = 40 + i * step;
                  return (
                    <text 
                      key={i} 
                      x={x} 
                      y="215" 
                      textAnchor="middle" 
                      className="text-[10px] fill-slate-500 font-medium"
                    >
                      {d.dateLabel}
                    </text>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div id="payment-methods-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Métodos de Pagamento</h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribuição do faturamento por forma de recebimento.</p>
          </div>

          <div className="my-6 flex justify-center items-center">
            {totalPaymentValue === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">Nenhuma venda concluída para analisar.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full">
                {/* Custom Stacked Row Percentage Visual */}
                <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden flex shadow-inner border border-slate-200/40">
                  {Object.entries(paymentStats).map(([method, val]) => {
                    const percentage = (val / totalPaymentValue) * 100;
                    if (percentage === 0) return null;
                    return (
                      <div
                        key={method}
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: method === 'card_credit' ? '#4F46E5' : paymentMethodColors[method] || '#9CA3AF'
                        }}
                        className="h-full first:rounded-l-full last:rounded-r-full group relative transition-all hover:scale-y-110"
                        title={`${paymentMethodLabels[method]}: ${percentage.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>

                {/* Custom Legend with prices and percentages */}
                <div className="grid grid-cols-2 gap-3 w-full text-xs mt-2">
                  {Object.entries(paymentMethodLabels).map(([method, label]) => {
                    const value = paymentStats[method] || 0;
                    const pct = totalPaymentValue > 0 ? (value / totalPaymentValue) * 100 : 0;
                    if (value === 0) return null;

                    return (
                      <div key={method} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span 
                          className="w-3 h-3 rounded-full mt-0.5 shrink-0" 
                          style={{ backgroundColor: method === 'card_credit' ? '#4F46E5' : paymentMethodColors[method] }}
                        />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-700 truncate">{label}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({pct.toFixed(0)}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            id="go-to-sales"
            onClick={() => onNavigate('sales')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
          >
            Ver Histórico de Vendas
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Two Columns: Low Stock & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts Checklist */}
        <div id="low-stock-checklist-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Alertas de Reposição</h2>
                <p className="text-xs text-slate-400">Produtos que atingiram o limite mínimo de estoque.</p>
              </div>
            </div>
            <button
              id="manage-products-btn"
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
            >
              Comprar / Abastecer
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 font-medium">✨ Excelente! Todos os itens estão bem abastecidos.</p>
              <p className="text-xs text-slate-400 mt-1">O estoque de nenhum produto está abaixo do limite mínimo definido.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-rose-50/50 hover:bg-rose-50 rounded-lg border border-rose-100/50 transition-colors">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-mono text-rose-700">{p.code}</p>
                    <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">{p.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Categoria: {p.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-rose-600 font-bold">Estoque: {p.stock} un</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mínimo ideal: {p.minStock} un</p>
                    <span className="inline-block px-1.5 py-0.5 bg-rose-200 text-rose-800 text-[9px] font-bold rounded-xs mt-1">
                      Faltam {p.minStock - p.stock} un
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Products */}
        <div id="top-products-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Produtos Mais Vendidos</h2>
                <p className="text-xs text-slate-400">Itens com maior volume de vendas registrado.</p>
              </div>
            </div>
            <button
              id="go-to-pos-btn"
              onClick={() => onNavigate('pos')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
            >
              Nova Venda
            </button>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">Nenhum dado de venda disponível ainda.</p>
              <p className="text-xs text-slate-400 mt-1">Registre sua primeira venda na aba "Frente de Caixa".</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">Volume: {p.qty} unidades vendidas</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">
                      {p.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      Lucro: {p.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Summary Banner of current Stock Valuation */}
      <div id="stock-valuation-banner" className="bg-gradient-to-r from-indigo-700 to-indigo-900 p-6 rounded-xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none translate-x-12">
          <Package className="w-64 h-64" />
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-widest">Avaliação de Estoque</span>
            <h2 className="text-xl font-bold mt-1">Patrimônio Atual</h2>
            <p className="text-xs text-indigo-100 mt-1">Resumo financeiro de todas as mercadorias armazenadas fisicamente.</p>
          </div>
          <div className="border-t border-indigo-500/30 md:border-t-0 md:border-l md:border-indigo-500/30 md:pl-6 pt-4 md:pt-0">
            <span className="text-xs text-indigo-200 block">Total de Peças em Estoque</span>
            <span className="text-2xl font-bold font-mono block mt-1">{totalInventoryQuantity} un</span>
            <span className="text-[11px] text-indigo-100">Quantidade de itens cadastrados</span>
          </div>
          <div className="border-t border-indigo-500/30 md:border-t-0 md:border-l md:border-indigo-500/30 md:pl-6 pt-4 md:pt-0">
            <span className="text-xs text-indigo-200 block">Valoração Estimada</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">
              {totalInventoryRetailValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="text-[11px] text-indigo-100">
              Preço custo pago: {totalInventoryCostValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
