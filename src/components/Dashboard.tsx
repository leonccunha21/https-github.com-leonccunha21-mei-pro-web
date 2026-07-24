import { useState, useMemo, useEffect } from 'react';
import { Product, Sale, Bill, StoreInfo } from '../types';
import { normalizeName } from '../lib/normalize';
import SalesChart from './SalesChart';
import StockAlert from './StockAlert';
import WhatsAppCollections from './WhatsAppCollections';
import { getPrefs, sendNotification } from '../lib/notifications';
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
  Layers,
  Eye,
  EyeOff,
  LayoutDashboard,
  Bell
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  bills?: Bill[];
  storeInfo?: StoreInfo;
  onNavigate: (tab: 'products' | 'pos' | 'sales' | 'bills') => void;
}

function parseLocalDate(dateStr: string, defaultTime: string = '00:00:00'): Date {
  if (!dateStr) return new Date();
  
  // Clean whitespace
  const cleaned = dateStr.trim();
  
  // Check if it's in DD/MM/YYYY format
  const slashParts = cleaned.split('/');
  if (slashParts.length === 3) {
    let day = parseInt(slashParts[0], 10);
    let month = parseInt(slashParts[1], 10);
    let year = parseInt(slashParts[2], 10);
    
    // Correct potential typos (e.g., 013 -> 13)
    if (day > 100) { // If year is first, e.g. 2025/07/13
      year = parseInt(slashParts[0], 10);
      day = parseInt(slashParts[2], 10);
    }
    
    if (month > 12 && day <= 12) { // Swap only if plausibly swapped (day in month position)
      const tmp = day;
      day = month;
      month = tmp;
    }
    
    // Form standard string: YYYY-MM-DD
    const yyyy = year.toString().padStart(4, '0');
    const mm = month.toString().padStart(2, '0');
    const dd = day.toString().padStart(2, '0');
    
    const parsed = new Date(`${yyyy}-${mm}-${dd}T${defaultTime}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  // Check if it's in YYYY-MM-DD format
  const hyphenParts = cleaned.split('-');
  if (hyphenParts.length === 3) {
    let year = parseInt(hyphenParts[0], 10);
    let month = parseInt(hyphenParts[1], 10);
    let day = parseInt(hyphenParts[2], 10);
    
    if (year < 100) { // e.g. DD-MM-YYYY
      day = parseInt(hyphenParts[0], 10);
      year = parseInt(hyphenParts[2], 10);
    }
    
    const yyyy = year.toString().padStart(4, '0');
    const mm = month.toString().padStart(2, '0');
    const dd = day.toString().padStart(2, '0');
    
    const parsed = new Date(`${yyyy}-${mm}-${dd}T${defaultTime}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  // Fallback to standard parser
  const fallback = new Date(cleaned + (cleaned.includes('T') ? '' : `T${defaultTime}`));
  if (!isNaN(fallback.getTime())) return fallback;
  return new Date();
}

export default function Dashboard({ products, sales, bills = [], storeInfo, onNavigate }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'all' | '1day' | '7days' | '14days' | '30days' | '1year' | 'custom'>('all');
  const [hideValues, setHideValues] = useState(false);
  const money = (v: number) =>
    hideValues ? 'R$ •••••' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedYearState, setSelectedYearState] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<'all' | number>('all');

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    sales.filter(s => s.status === 'completed' || s.status === 'pending').forEach(s => years.add(new Date(s.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [sales]);

  const activeYear = useMemo(() => {
    if (selectedYearState !== null) return selectedYearState;
    if (availableYears.length > 0) return availableYears[0];
    return new Date().getFullYear();
  }, [selectedYearState, availableYears]);

  // Filter completed sales by time range and year
  // Inclui vendas 'completed' e 'pending' (marketplace ainda não liquidado) no
  // faturamento/lucro: ambas são receita real. 'cancelled' continua excluída.
  const completedSales = useMemo(() => {
    let result = sales.filter(s => {
      if (s.status !== 'completed' && s.status !== 'pending') return false;
      if (timeRange === 'all') return true;
      const saleDate = new Date(s.date);
      if (timeRange === 'custom') {
        const start = parseLocalDate(customStart, '00:00:00');
        const end = parseLocalDate(customEnd, '23:59:59');
        return saleDate >= start && saleDate <= end;
      }
      const now = new Date();
      const daysToCount = timeRange === '1day' ? 1 : timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : timeRange === '30days' ? 30 : 365;
      const cutoff = new Date();
      cutoff.setDate(now.getDate() - daysToCount);
      cutoff.setHours(0, 0, 0, 0);
      return saleDate >= cutoff;
    });
    // Only apply dropdown year/month filters if we are NOT in custom date range mode
    if (timeRange !== 'custom') {
      result = result.filter(s => new Date(s.date).getFullYear() === activeYear);
      if (selectedMonth !== 'all') {
        result = result.filter(s => new Date(s.date).getMonth() + 1 === selectedMonth);
      }
    }
    return result;
  }, [sales, timeRange, customStart, customEnd, activeYear, selectedMonth]);

  // Calculate metrics — fonte única e determinística: lucro = faturamento - custo.
  // Igual à regra do Relatório (Reports.tsx), para o mesmo valor aparecer em
  // todas as telas e não variar conforme o filtro de período.
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total, 0);
  const totalCost = completedSales.reduce((acc, s) => acc + s.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const isServiceProduct = (p: Product) => /^servi/i.test(p.category);

  // Contas vencidas (bills overdue + pending com dueDate passada)
  const today = new Date().toISOString().slice(0, 10);
  const overdueBills = useMemo(() => {
    return bills.filter(b => b.status !== 'paid' && b.dueDate < today);
  }, [bills, today]);
  const overdueBillsTotal = overdueBills.reduce((acc, b) => acc + b.amount, 0);

  // Stock alerts
  const physicalProducts = products.filter(p => !isServiceProduct(p) && !p.archived);
  const lowStockProducts = physicalProducts.filter(p => p.status !== 'indisponivel' && p.minStock > 0 && p.stock <= p.minStock);

  // Notificações disparadas uma vez por montagem — deps intencionalmente vazias
  // (queremos notificar só ao abrir o painel, não a cada re-render).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const prefs = getPrefs();
    if (prefs.lowStockAlert && lowStockProducts.length > 0) {
      sendNotification('Estoque Baixo', `${lowStockProducts.length} produto(s) com estoque abaixo do mínimo: ${lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}`);
    }
    if (prefs.debtReminder) {
      const pending = sales.filter((s) => s.status === 'pending');
      if (pending.length > 0) {
        const total = pending.reduce((a, s) => a + s.total, 0);
        sendNotification('Contas a Receber', `${pending.length} venda(s) pendente(s) — R$ ${total.toFixed(2)}`);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Últimas vendas (mais recentes primeiro), sempre mostrando as mais novas,
  // independentemente do filtro de ano do painel de métricas.
  const recentSales = useMemo(() => {
    return [...sales]
      .filter(s => s.status !== 'cancelled')
      .sort((a, b) => (parseLocalDate(b.date).getTime()) - (parseLocalDate(a.date).getTime()))
      .slice(0, 8);
  }, [sales]);

  const formatSaleDate = (dateStr: string): string => {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
      ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Quantity sold per product (keyed by productId, with normalized-name fallback)
  const soldQtyByProductId = useMemo(() => {
    const byId: Record<string, number> = {};
    const byName: Record<string, number> = {};
    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.productId && item.productId.trim() !== '') {
          byId[item.productId] = (byId[item.productId] || 0) + item.quantity;
        }
        const nm = normalizeName(item.productName);
        byName[nm] = (byName[nm] || 0) + item.quantity;
      });
    });
    return { byId, byName };
  }, [completedSales]);
  const getSoldQty = (p: Product) =>
    soldQtyByProductId.byId[p.id] ?? soldQtyByProductId.byName[normalizeName(p.name)] ?? 0;
  const totalInventoryQuantity = physicalProducts.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryCostValue = physicalProducts.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const totalInventoryRetailValue = physicalProducts.reduce((acc, p) => acc + (p.stock * p.salePrice), 0);

  // Grouping key for a sale item: prefer productId, but fall back to the
  // normalized product name. The imported sales have empty productId, so we
  // must rely on the name to avoid collapsing every item into a single entry.
  const itemKey = (item: { productId?: string; productName: string }) => {
    if (item.productId && item.productId.trim() !== '') return item.productId;
    return normalizeName(item.productName);
  };

  // Top Selling Products (ranked by quantity sold — "Mais Vendidos")
  const topProducts = useMemo(() => {
    const productSalesMap: Record<string, { name: string; qty: number; revenue: number; profit: number; variants: Record<string, number> }> = {};
    completedSales.forEach(sale => {
      const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
      const discountRatio = subtotal > 0 ? (sale.total / subtotal) : 1;
      sale.items.forEach(item => {
        const key = itemKey(item);
        if (!productSalesMap[key]) {
          productSalesMap[key] = { name: item.productName, qty: 0, revenue: 0, profit: 0, variants: {} };
        }
        const entry = productSalesMap[key];
        entry.variants[item.productName] = (entry.variants[item.productName] || 0) + item.quantity;
        const effectiveTotal = item.total * discountRatio;
        const effectiveProfit = effectiveTotal - (item.costPrice * item.quantity);
        entry.qty += item.quantity;
        entry.revenue += effectiveTotal;
        entry.profit += effectiveProfit;
      });
    });
    return Object.values(productSalesMap)
      .map(e => ({
        name: Object.entries(e.variants).sort((a, b) => b[1] - a[1])[0][0],
        qty: e.qty,
        revenue: e.revenue,
        profit: e.profit,
      }))
      .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue || a.name.localeCompare(b.name))
      .slice(0, 5);
  }, [completedSales]);

  // Prepare chart data based on time range
  const chartData = useMemo(() => {
    const data: { label: string; revenue: number; profit: number }[] = [];
    
    if (timeRange === 'custom') {
      // Custom range: group by day
      const start = parseLocalDate(customStart, '00:00:00');
      const end = parseLocalDate(customEnd, '23:59:59');
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 60) {
        // Group by day
        for (let i = 0; i <= diffDays; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          d.setHours(0, 0, 0, 0);
          const daySales = completedSales.filter(sale => {
            const sd = new Date(sale.date);
            return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
          });
          data.push({
            label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            revenue: daySales.reduce((acc, s) => acc + s.total, 0),
            profit: daySales.reduce((acc, s) => acc + s.profit, 0)
          });
        }
      } else {
        // Group by month
        const months = new Set<string>();
        const monthData: Record<string, { revenue: number; profit: number }> = {};
        completedSales.forEach(sale => {
          const d = new Date(sale.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          months.add(key);
          if (!monthData[key]) monthData[key] = { revenue: 0, profit: 0 };
          monthData[key].revenue += sale.total;
          monthData[key].profit += sale.profit;
        });
        const sortedMonths = Array.from(months).sort();
        sortedMonths.forEach(m => {
          const [y, mo] = m.split('-');
          data.push({
            label: `${mo}/${y.substring(2)}`,
            revenue: monthData[m].revenue,
            profit: monthData[m].profit
          });
        });
      }
    } else if (timeRange === '1day') {
      // Last day: show hours
      for (let h = 0; h < 24; h++) {
        const hourSales = completedSales.filter(sale => {
          const sd = new Date(sale.date);
          const now = new Date();
          return sd.getDate() === now.getDate() && sd.getMonth() === now.getMonth() && sd.getFullYear() === now.getFullYear() && sd.getHours() === h;
        });
        data.push({
          label: `${String(h).padStart(2, '0')}h`,
          revenue: hourSales.reduce((acc, s) => acc + s.total, 0),
          profit: hourSales.reduce((acc, s) => acc + s.profit, 0)
        });
      }
    } else if (timeRange === 'all') {
      // All time: group by month
      const months = new Map<string, { revenue: number; profit: number }>();
      completedSales.forEach(sale => {
        const d = new Date(sale.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!months.has(key)) months.set(key, { revenue: 0, profit: 0 });
        const m = months.get(key)!;
        m.revenue += sale.total;
        m.profit += sale.profit;
      });
      const sorted = Array.from(months.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      sorted.forEach(([key, val]) => {
        const [y, mo] = key.split('-');
        data.push({ label: `${mo}/${y.substring(2)}`, revenue: val.revenue, profit: val.profit });
      });
    } else {
      // 7, 14, 30 days or 1 year: group by day
      const daysToCount = timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : timeRange === '30days' ? 30 : 365;
      for (let i = daysToCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const daySales = completedSales.filter(sale => {
          const sd = new Date(sale.date);
          return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
        });
        const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
        data.push({
          label: `${d.getDate()} ${weekday.replace('.', '')}`,
          revenue: daySales.reduce((acc, s) => acc + s.total, 0),
          profit: daySales.reduce((acc, s) => acc + s.profit, 0)
        });
      }
    }
    
    return data;
  }, [completedSales, timeRange, customStart, customEnd]);

  // Payment method stats
  const paymentMethodLabels: Record<string, string> = {
    money: 'Dinheiro', card_credit: 'Cartão Crédito', card_debit: 'Cartão Débito', pix: 'PIX', transfer: 'Transferência'
  };
  const paymentMethodColors: Record<string, string> = {
    money: '#10B981', card_credit: '#3B82F6', card_debit: '#6366F1', pix: '#8B5CF6', transfer: '#F59E0B'
  };
  const paymentStats: Record<string, number> = completedSales.reduce((acc: Record<string, number>, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);
  const totalPaymentValue: number = Object.values(paymentStats).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Time Range selector */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 id="dashboard-title" className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
              Painel de Controle
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">Visão geral do desempenho da sua loja.</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="quick-start-sale-btn"
              onClick={() => onNavigate('pos')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              Nova Venda
            </button>
            <button
              onClick={() => setHideValues(v => !v)}
              title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
              aria-label={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {hideValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Banner de contas vencidas */}
        {overdueBills.length > 0 && (
          <button
            onClick={() => onNavigate('bills')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-left hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <Bell className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="flex-1 text-sm font-semibold text-rose-800">
              {overdueBills.length === 1
                ? `Você tem 1 conta vencida`
                : `Você tem ${overdueBills.length} contas vencidas`}
              {' '}&mdash;{' '}
              <span className="font-bold">
                {overdueBillsTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </span>
            <span className="text-xs text-rose-600 font-semibold shrink-0">Ver contas →</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/50 overflow-x-auto no-scrollbar">
          {([
            { key: 'all' as const, label: 'Todos' },
            { key: '1day' as const, label: '1 Dia' },
            { key: '7days' as const, label: '7 Dias' },
            { key: '14days' as const, label: '14 Dias' },
            { key: '30days' as const, label: '30 Dias' },
            { key: '1year' as const, label: '1 Ano' },
            { key: 'custom' as const, label: 'Personalizado' },
          ]).map(opt => (
            <button
              key={opt.key}
              id={`range-${opt.key}`}
              onClick={() => setTimeRange(opt.key)}
              className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                timeRange === opt.key ? 'bg-white text-slate-900 border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {timeRange !== 'custom' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
              <Calendar className="h-3.5 w-3.5 text-slate-400 ml-1.5" />
              <select
                value={activeYear}
                onChange={e => setSelectedYearState(parseInt(e.target.value))}
                className="bg-transparent text-[11px] sm:text-xs font-medium text-slate-900 border-none outline-none focus:outline-none cursor-pointer py-1 pr-2"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
              <span className="text-[11px] sm:text-xs font-medium text-slate-400 ml-1.5">Mês:</span>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="bg-transparent text-[11px] sm:text-xs font-medium text-slate-900 border-none outline-none focus:outline-none cursor-pointer py-1 pr-2"
              >
                <option value="all">Todos os Meses</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Custom Date Picker */}
      {timeRange === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="h-4 w-4 text-slate-400" />
          <label className="text-[10px] font-bold text-slate-500 uppercase">Período:</label>
          <input
            type="date"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
          <span className="text-xs text-slate-400">até</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
          <span className="text-[10px] text-slate-400 font-medium ml-2">
            {completedSales.length} vendas no período
          </span>
        </div>
      )}

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div id="kpi-faturamento" className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Faturamento</span>
            <div className="p-1.5 md:p-2 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign className="h-4 w-4 md:h-5 md:w-5" /></div>
          </div>
          <div className="mt-3 md:mt-4">
            <span className="text-base md:text-2xl font-bold text-slate-900 block leading-tight">{money(totalRevenue)}</span>
            <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>{completedSales.length} vendas</span>
            </div>
          </div>
        </div>

        <div id="kpi-custo" className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Custo</span>
            <div className="p-1.5 md:p-2 bg-amber-50 rounded-lg text-amber-600"><ArrowDownRight className="h-4 w-4 md:h-5 md:w-5" /></div>
          </div>
          <div className="mt-3 md:mt-4">
            <span className="text-base md:text-2xl font-bold text-slate-900 block leading-tight">{money(totalCost)}</span>
            <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs text-slate-500">
              <Layers className="h-3 w-3 text-slate-400" />
              <span className="hidden sm:inline">Custo das mercadorias</span>
              <span className="sm:hidden">CMV</span>
            </div>
          </div>
        </div>

        <div id="kpi-lucro" className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Lucro</span>
            <div className="p-1.5 md:p-2 bg-indigo-50 rounded-lg text-indigo-600"><TrendingUp className="h-4 w-4 md:h-5 md:w-5" /></div>
          </div>
          <div className="mt-3 md:mt-4">
            <span className="text-base md:text-2xl font-bold text-slate-900 block leading-tight">{money(totalProfit)}</span>
            <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs text-indigo-600">
              <Percent className="h-3 w-3" />
              <span>Margem {averageMargin.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div id="kpi-vendas" className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Vendas</span>
            <div className="p-1.5 md:p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <span className="text-base md:text-2xl font-bold text-slate-900 block leading-tight">{completedSales.length}</span>
            <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs text-slate-500">
              <ShoppingBag className="h-3 w-3 text-slate-400" />
              <span>transações concluídas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              {lowStockProducts.length} produto(s) com estoque baixo
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {lowStockProducts.slice(0, 5).map(p => p.name).join(', ')}
              {lowStockProducts.length > 5 && ` e mais ${lowStockProducts.length - 5} produto(s)`}
            </p>
            <button onClick={() => onNavigate('products')} className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1">
              Ver estoque <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div id="sales-chart-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Faturamento</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {timeRange === 'all' ? 'Todos os períodos' :
                 timeRange === '1day' ? 'Vendas por hora hoje' : 
                 timeRange === 'custom' ? 'Vendas no período selecionado' : 
                 `Últimos ${timeRange === '7days' ? '7' : timeRange === '14days' ? '14' : timeRange === '30days' ? '30' : '365'} dias`}
              </p>
            </div>
          </div>
          <div className="relative h-56 w-full select-none">
            {chartData.length > 0 ? <SalesChart data={chartData} /> : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Nenhuma venda no período</div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div id="payment-methods-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pagamentos</h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribuição por forma de recebimento.</p>
          </div>
          <div className="my-4 flex justify-center items-center">
            {totalPaymentValue === 0 ? (
              <div className="text-center py-8"><p className="text-sm text-slate-400">Nenhuma venda no período.</p></div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden flex shadow-inner border border-slate-200/40">
                  {Object.entries(paymentStats).map(([method, val]: [string, number]) => {
                    const percentage = (val / totalPaymentValue) * 100;
                    if (percentage === 0) return null;
                    return (
                      <div key={method} style={{ width: `${percentage}%`, backgroundColor: paymentMethodColors[method] || '#9CA3AF' }}
                        className="h-full first:rounded-l-full last:rounded-r-full" title={`${paymentMethodLabels[method]}: ${percentage.toFixed(1)}%`} />
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2 w-full text-xs">
                  {Object.entries(paymentMethodLabels).map(([method, label]: [string, string]) => {
                    const value: number = paymentStats[method] || 0;
                    const pct = totalPaymentValue > 0 ? (value / totalPaymentValue) * 100 : 0;
                    if (value === 0) return null;
                    return (
                      <div key={method} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: paymentMethodColors[method] }} />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-700 truncate text-[11px]">{label}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{money(value)} ({pct.toFixed(0)}%)</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => onNavigate('sales')} className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-200">
            Histórico de Vendas <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Two Columns: Low Stock & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="recent-sales-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md"><ShoppingBag className="h-4 w-4" /></span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Histórico de Vendas</h2>
                <p className="text-xs text-slate-400">Últimas vendas registradas.</p>
              </div>
            </div>
            <button onClick={() => onNavigate('sales')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1">
              Ver todas
            </button>
          </div>
          {recentSales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 font-medium">Nenhuma venda registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {recentSales.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-50/60 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs text-slate-400">{formatSaleDate(s.date)}</p>
                    <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">
                      {s.items.length === 1 ? s.items[0].productName : `${s.items.length} itens`}
                      {s.clientName ? ` · ${s.clientName}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{money(s.total)}</p>
                    <span className={`text-[10px] font-medium ${s.status === 'completed' ? 'text-emerald-600' : s.status === 'pending' ? 'text-amber-600' : 'text-rose-600'}`}>
                      {s.status === 'completed' ? 'Concluída' : s.status === 'pending' ? 'Pendente' : 'Cancelada'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div id="top-products-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md"><ShoppingBag className="h-4 w-4" /></span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Mais Vendidos</h2>
                <p className="text-xs text-slate-400">Produtos com maior volume.</p>
              </div>
            </div>
            <button onClick={() => onNavigate('pos')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1">
              Nova Venda
            </button>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-8"><p className="text-sm text-slate-400">Nenhuma venda registrada.</p></div>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">#{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.qty} un. vendidas</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{money(p.revenue)}</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Lucro: {money(p.profit)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Valuation Banner */}
      <div id="stock-valuation-banner" className="p-6 rounded-xl text-white shadow-md relative overflow-hidden" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-800))' }}>
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none translate-x-12">
          <Package className="w-64 h-64" />
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Avaliação de Estoque</span>
            <h2 className="text-xl font-bold mt-1">Patrimônio Atual</h2>
          </div>
          <div className="border-t border-white/20 md:border-t-0 md:border-l md:border-white/20 md:pl-6 pt-4 md:pt-0">
            <span className="text-xs text-white/70 block">Peças em Estoque</span>
            <span className="text-2xl font-bold font-mono block mt-1">{totalInventoryQuantity} un</span>
          </div>
          <div className="border-t border-white/20 md:border-t-0 md:border-l md:border-white/20 md:pl-6 pt-4 md:pt-0">
            <span className="text-xs text-white/70 block">Valoração Estimada</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">
              {money(totalInventoryRetailValue)}
            </span>
            <span className="text-[11px] text-white/60">
              Custo: {money(totalInventoryCostValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <StockAlert products={products} storeInfo={storeInfo || { name: '', cnpj: '', phone: '', email: '', address: '', city: '', state: '', ownerName: '', notes: '', logoUrl: '' }} />
        </div>
      )}

      {/* WhatsApp Collections */}
      {sales.some(s => s.status === 'pending') && storeInfo && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <WhatsAppCollections sales={sales} storeInfo={storeInfo} />
        </div>
      )}
    </div>
  );
}
