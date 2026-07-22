import React, { useState, useMemo } from 'react';
import { Product, Sale, Category, PaymentMethod } from '../types';
import { normalizeName } from '../lib/normalize';
import { todayLocalISODate, isSameLocalDay } from '../lib/datetime';
import {
  TrendingUp,
  PieChart,
  ShoppingBag,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  X,
  CreditCard,
  Store,
  Download,
  FileText
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

const saleChannelLabels: Record<string, string> = {
  'Loja Física': '🏪 Loja Física',
  'Shopee': '🛒 Shopee',
  'Magalu': '🛒 Magalu',
  'TikTok': '🎵 TikTok',
  'E-commerce': '🌐 E-commerce',
  'WhatsApp': '📱 WhatsApp',
  'Outro': '📦 Outro',
};

const saleTypeLabels: Record<string, string> = {
  all: 'Todos',
  CPF: 'CPF',
  CNPJ: 'CNPJ',
};

const effectiveChannel = (s: Sale): string => s.saleChannel || 'Loja Física';

// Resolve the catalog product for a sale item. Imported sales have an empty
// productId, so we fall back to matching by the normalized product name.
const findProductForItem = (item: { productId?: string; productName: string }, products: Product[]) => {
  if (item.productId && item.productId.trim() !== '') {
    const byId = products.find(p => p.id === item.productId);
    if (byId) return byId;
  }
  const key = normalizeName(item.productName);
  return products.find(p => normalizeName(p.name) === key);
};

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

type SortField = 'productName' | 'units' | 'salesCount' | 'revenue' | 'cost' | 'profit' | 'margin';

export default function Reports({ products, sales, categories }: ReportsProps) {
  const [viewMode, setViewMode] = useState<'resume' | 'monthly' | 'yearly' | 'comparative'>('resume');

  // ----- General filters (the year filter applies to everything) -----
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(() => {
    const years = new Set<number>();
    sales.filter(s => s.status === 'completed').forEach(s => years.add(new Date(s.date).getFullYear()));
    const arr = Array.from(years).sort((a, b) => b - a);
    return arr.length ? arr[0] : new Date().getFullYear();
  });

  // ----- Filtro por DIA (mostra as vendas do dia selecionado, padrão = hoje) -----
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // ----- Sold-items report controls -----
  const [productSearch, setProductSearch] = useState('');
  const [productSort, setProductSort] = useState<SortField>('revenue');
  const [productSortDir, setProductSortDir] = useState<'asc' | 'desc'>('desc');

  const completedSales = useMemo(() => sales.filter(s => s.status === 'completed'), [sales]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    completedSales.forEach(s => years.add(new Date(s.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [completedSales]);

  const latestYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();

  // Independent year for the monthly chart (uses the global year when set)
  const [monthlyYearLocal, setMonthlyYearLocal] = useState<number>(() => {
    const years = new Set<number>();
    sales.filter(s => s.status === 'completed').forEach(s => years.add(new Date(s.date).getFullYear()));
    const arr = Array.from(years).sort((a, b) => b - a);
    return arr.length ? arr[0] : new Date().getFullYear();
  });
  const monthlyYear = selectedYear !== 'all' ? selectedYear : monthlyYearLocal;

  const allCategoryNames = useMemo(() => {
    const names = new Set<string>();
    products.forEach(p => names.add(p.category));
    categories.forEach(c => names.add(c.name));
    return Array.from(names).sort();
  }, [products, categories]);

  const availableChannels = useMemo(() => {
    const names = new Set<string>();
    completedSales.forEach(s => names.add(effectiveChannel(s)));
    return Array.from(names).sort((a, b) => (saleChannelLabels[a] || a).localeCompare(saleChannelLabels[b] || b));
  }, [completedSales]);

  const filtersActive =
    selectedCategory !== 'all' ||
    selectedPayment !== 'all' ||
    selectedChannel !== 'all' ||
    selectedType !== 'all' ||
    selectedDay !== 'all';

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPayment('all');
    setSelectedChannel('all');
    setSelectedType('all');
    setSelectedDay('all');
  };

  // ----- The single source of truth: every view respects these filters -----
  const filteredSales = useMemo(() => {
    let result = completedSales;

    if (selectedDay !== 'all') {
      result = result.filter(s => isSameLocalDay(s.date, selectedDay));
    }

    if (selectedYear !== 'all') {
      result = result.filter(s => new Date(s.date).getFullYear() === selectedYear);
    }
    if (selectedPayment !== 'all') {
      result = result.filter(s => s.paymentMethod === selectedPayment);
    }
    if (selectedChannel !== 'all') {
      result = result.filter(s => effectiveChannel(s) === selectedChannel);
    }
    if (selectedType !== 'all') {
      result = result.filter(s => s.saleType === selectedType);
    }
    if (selectedCategory !== 'all') {
      result = result.filter(s =>
        s.items.some(item => {
          const origProduct = findProductForItem(item, products);
          return (origProduct ? origProduct.category : 'Outros') === selectedCategory;
        })
      );
    }

    return result;
  }, [completedSales, selectedYear, selectedPayment, selectedChannel, selectedType, selectedCategory, products]);

  const resumeData = useMemo(() => {
    const totalFaturamento = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const totalCusto = filteredSales.reduce((acc, s) => acc + s.totalCost, 0);
    const lucro = totalFaturamento - totalCusto;
    const avgTicket = filteredSales.length > 0 ? totalFaturamento / filteredSales.length : 0;
    const roi = totalCusto > 0 ? (lucro / totalCusto) * 100 : 0;
    const margin = totalFaturamento > 0 ? (lucro / totalFaturamento) * 100 : 0;
    const totalUnits = filteredSales.reduce(
      (acc, s) => acc + s.items.reduce((a, it) => a + it.quantity, 0),
      0
    );
    return { totalFaturamento, totalCusto, lucro, avgTicket, roi, margin, totalUnits };
  }, [filteredSales]);

  const monthlyData = useMemo(() => {
    const yearSales = filteredSales.filter(s => new Date(s.date).getFullYear() === monthlyYear);
    const months: Record<number, { revenue: number; cost: number; profit: number; count: number }> = {};

    for (let m = 1; m <= 12; m++) {
      months[m] = { revenue: 0, cost: 0, profit: 0, count: 0 };
    }

    yearSales.forEach(sale => {
      const m = new Date(sale.date).getMonth() + 1;
      months[m].revenue += sale.total;
      months[m].cost += sale.totalCost;
      // Recalcula em vez de usar sale.profit (gravado no momento da venda)
      // para ficar consistente caso o custo do produto tenha sido alterado depois.
      months[m].profit += sale.total - sale.totalCost;
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
  }, [filteredSales, monthlyYear]);

  const yearlyData = useMemo(() => {
    const years: Record<number, { revenue: number; cost: number; profit: number; count: number }> = {};

    filteredSales.forEach(sale => {
      const y = new Date(sale.date).getFullYear();
      if (!years[y]) years[y] = { revenue: 0, cost: 0, profit: 0, count: 0 };
      years[y].revenue += sale.total;
      years[y].cost += sale.totalCost;
      years[y].profit += sale.total - sale.totalCost;
      years[y].count++;
    });

    return Object.entries(years)
      .map(([y, data]) => ({ year: parseInt(y), ...data, margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0 }))
      .sort((a, b) => b.year - a.year);
  }, [filteredSales]);

  // Sales respecting every filter EXCEPT the year filter — used by the
  // comparative (month x year) view so all years remain visible.
  const comparativeSales = useMemo(() => {
    let result = completedSales;
    if (selectedPayment !== 'all') result = result.filter(s => s.paymentMethod === selectedPayment);
    if (selectedChannel !== 'all') result = result.filter(s => effectiveChannel(s) === selectedChannel);
    if (selectedType !== 'all') result = result.filter(s => s.saleType === selectedType);
    if (selectedCategory !== 'all') {
      result = result.filter(s =>
        s.items.some(item => {
          const origProduct = findProductForItem(item, products);
          return (origProduct ? origProduct.category : 'Outros') === selectedCategory;
        })
      );
    }
    return result;
  }, [completedSales, selectedPayment, selectedChannel, selectedType, selectedCategory, products]);

  const comparativeData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Agos', 'Set', 'Out', 'Nov', 'Dez'];
    const yearSet = new Set<number>();
    comparativeSales.forEach(s => yearSet.add(new Date(s.date).getFullYear()));
    const years: number[] = Array.from(yearSet).sort((a, b) => a - b);
    const grid: Record<number, Record<number, { revenue: number; cost: number; profit: number; count: number }>> = {};
    years.forEach(y => {
      grid[y] = {};
      for (let m = 1; m <= 12; m++) grid[y][m] = { revenue: 0, cost: 0, profit: 0, count: 0 };
    });
    comparativeSales.forEach(s => {
      const y = new Date(s.date).getFullYear();
      const m = new Date(s.date).getMonth() + 1;
      grid[y][m].revenue += s.total;
      grid[y][m].cost += s.totalCost;
      grid[y][m].profit += s.total - s.totalCost;
      grid[y][m].count++;
    });

    type YearTotal = {
      year: number;
      revenue: number;
      cost: number;
      profit: number;
      count: number;
      margin: number;
      ticket: number;
      revenueYoY: number | null;
      profitYoY: number | null;
      countYoY: number | null;
      ticketYoY: number | null;
    };
    const yearTotals: YearTotal[] = years.map(y => {
      const t = { revenue: 0, cost: 0, profit: 0, count: 0 };
      for (let m = 1; m <= 12; m++) {
        t.revenue += grid[y][m].revenue;
        t.cost += grid[y][m].cost;
        t.profit += grid[y][m].profit;
        t.count += grid[y][m].count;
      }
      return {
        year: y,
        ...t,
        margin: t.revenue > 0 ? (t.profit / t.revenue) * 100 : 0,
        ticket: t.count > 0 ? t.revenue / t.count : 0,
        revenueYoY: null,
        profitYoY: null,
        countYoY: null,
        ticketYoY: null,
      };
    });
    yearTotals.forEach((yt, i) => {
      const prev = yearTotals[i - 1];
      yt.revenueYoY = prev && prev.revenue > 0 ? ((yt.revenue - prev.revenue) / prev.revenue) * 100 : null;
      yt.profitYoY = prev && prev.profit !== 0 ? ((yt.profit - prev.profit) / Math.abs(prev.profit)) * 100 : null;
      yt.countYoY = prev && prev.count > 0 ? ((yt.count - prev.count) / prev.count) * 100 : null;
      yt.ticketYoY = prev && prev.ticket > 0 ? ((yt.ticket - prev.ticket) / prev.ticket) * 100 : null;
    });

    const months = monthNames.map((name, mi) => {
      const m = mi + 1;
      const cells = years.map(y => {
        const cur = grid[y][m];
        const prevYear = years.find(yy => yy === y - 1);
        const prev = prevYear !== undefined ? grid[prevYear][m] : null;
        const yoy = prev && prev.revenue > 0 ? ((cur.revenue - prev.revenue) / prev.revenue) * 100 : null;
        return { year: y, ...cur, yoy };
      });
      return { month: m, name, cells };
    });

    const maxCellRevenue = Math.max(1, ...years.flatMap(y => Array.from({ length: 12 }, (_, i) => grid[y][i + 1].revenue)));
    return { years, months, yearTotals, maxCellRevenue };
  }, [comparativeSales]);

  const maxMonthlyRevenue = Math.max(...monthlyData.months.map(m => m.revenue), 1);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { revenue: number; cost: number; profit: number; itemsSold: number }> = {};
    categories.forEach(cat => { stats[cat.name] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 }; });
    stats['Outros'] = { revenue: 0, cost: 0, profit: 0, itemsSold: 0 };

    filteredSales.forEach(sale => {
      const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
      const discountRatio = subtotal > 0 ? (sale.total / subtotal) : 1;
      sale.items.forEach(item => {
        const origProduct = findProductForItem(item, products);
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
    const map = new Map<string, {
      productName: string;
      category: string;
      units: number;
      sales: Set<string>;
      revenue: number;
      cost: number;
      profit: number;
    }>();

    filteredSales.forEach(sale => {
      const subtotal = sale.items.reduce((acc, item) => acc + item.total, 0);
      const discountRatio = subtotal > 0 ? (sale.total / subtotal) : 1;
      sale.items.forEach(item => {
        const origProduct = findProductForItem(item, products);
        const catName = origProduct ? origProduct.category : 'Outros';
        const key = item.productId && item.productId.trim() ? item.productId : normalizeName(item.productName);
        let entry = map.get(key);
        if (!entry) {
          entry = { productName: item.productName, category: catName, units: 0, sales: new Set(), revenue: 0, cost: 0, profit: 0 };
          map.set(key, entry);
        }
        const effectiveTotal = item.total * discountRatio;
        entry.units += item.quantity;
        entry.sales.add(sale.id);
        entry.revenue += effectiveTotal;
        entry.cost += item.costPrice * item.quantity;
        entry.profit += effectiveTotal - (item.costPrice * item.quantity);
      });
    });

    return Array.from(map.values()).map(e => ({
      productName: e.productName,
      category: e.category,
      units: e.units,
      salesCount: e.sales.size,
      revenue: e.revenue,
      cost: e.cost,
      profit: e.profit,
      margin: e.revenue > 0 ? (e.profit / e.revenue) * 100 : 0,
    }));
  }, [filteredSales, products]);

  // Apply search + sorting for the sold-items report
  const visibleProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    let list = productStats;
    if (q) {
      list = list.filter(p =>
        p.productName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    const dir = productSortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      if (productSort === 'productName') return a.productName.localeCompare(b.productName) * dir;
      return ((a[productSort] as number) - (b[productSort] as number)) * dir;
    });
  }, [productStats, productSearch, productSort, productSortDir]);

  const productsTotals = useMemo(() => {
    return visibleProducts.reduce(
      (acc, p) => {
        acc.units += p.units;
        acc.revenue += p.revenue;
        acc.cost += p.cost;
        acc.profit += p.profit;
        return acc;
      },
      { units: 0, revenue: 0, cost: 0, profit: 0 }
    );
  }, [visibleProducts]);

  const handleSort = (field: SortField) => {
    if (productSort === field) {
      setProductSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setProductSort(field);
      setProductSortDir(field === 'productName' ? 'asc' : 'desc');
    }
  };

  const sortCaret = (field: SortField) =>
    productSort === field ? (productSortDir === 'asc' ? ' ▲' : ' ▼') : '';

  // ----- Export helpers (respect current filters / search / sort) -----
  const numBr = (v: number) => v.toFixed(2).replace('.', ',');

  const exportCsv = () => {
    const headers = ['Produto', 'Categoria', 'Qtd', 'Vendas', 'Faturamento', 'Custo', 'Lucro', 'Margem(%)'];
    const lines = [headers.join(';')];
    visibleProducts.forEach(p => {
      lines.push([
        `"${p.productName.replace(/"/g, '""')}"`,
        p.category,
        String(p.units),
        String(p.salesCount),
        numBr(p.revenue),
        numBr(p.cost),
        numBr(p.profit),
        numBr(p.margin),
      ].join(';'));
    });
    lines.push([
      'TOTAL', '', String(productsTotals.units), '',
      numBr(productsTotals.revenue), numBr(productsTotals.cost),
      numBr(productsTotals.profit),
      numBr(productsTotals.revenue > 0 ? (productsTotals.profit / productsTotals.revenue) * 100 : 0),
    ].join(';'));
    const csv = '﻿' + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itens_vendidos_${yearLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const filterText = [
      `Ano: ${yearLabel}`,
      selectedCategory !== 'all' ? `Categoria: ${selectedCategory}` : null,
      selectedPayment !== 'all' ? `Pagamento: ${paymentMethodLabels[selectedPayment]}` : null,
      selectedChannel !== 'all' ? `Canal: ${saleChannelLabels[selectedChannel] || selectedChannel}` : null,
      selectedType !== 'all' ? `Tipo: ${saleTypeLabels[selectedType]}` : null,
    ].filter(Boolean).join('  •  ');

    const rows = visibleProducts.map(p => `
      <tr>
        <td>${p.productName.replace(/</g, '&lt;')}</td>
        <td>${p.category}</td>
        <td style="text-align:center">${p.units}</td>
        <td style="text-align:center">${p.salesCount}</td>
        <td style="text-align:right">${fmtBRL(p.revenue)}</td>
        <td style="text-align:right">${fmtBRL(p.cost)}</td>
        <td style="text-align:right">${fmtBRL(p.profit)}</td>
        <td style="text-align:right">${p.margin.toFixed(0)}%</td>
      </tr>`).join('');

    const html = `<!doctype html><html><head><meta charset="utf-8">
      <title>Itens Vendidos - ${yearLabel}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 24px; }
        h1 { font-size: 16px; margin: 0 0 4px; }
        .sub { color: #555; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border-bottom: 1px solid #ddd; padding: 5px 6px; text-align: left; }
        th { background: #f1f5f9; font-size: 10px; text-transform: uppercase; }
        tfoot td { font-weight: bold; border-top: 2px solid #333; }
        .right { text-align: right; }
      </style></head>
      <body>
        <h1>Relatório de Itens Vendidos</h1>
        <div class="sub">${filterText} &nbsp;|&nbsp; Gerado em ${new Date().toLocaleString('pt-BR')}</div>
        <table>
          <thead><tr>
            <th>Produto</th><th>Categoria</th><th>Qtd</th><th>Vendas</th>
            <th class="right">Faturamento</th><th class="right">Custo</th><th class="right">Lucro</th><th class="right">Margem</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr>
            <td>TOTAL</td><td></td><td style="text-align:center">${productsTotals.units}</td><td></td>
            <td class="right">${fmtBRL(productsTotals.revenue)}</td>
            <td class="right">${fmtBRL(productsTotals.cost)}</td>
            <td class="right">${fmtBRL(productsTotals.profit)}</td>
            <td class="right">${productsTotals.revenue > 0 ? ((productsTotals.profit / productsTotals.revenue) * 100).toFixed(0) : 0}%</td>
          </tr></tfoot>
        </table>
      </body></html>`;
    const w = window.open('', '_blank');
    if (!w) { alert('Permita pop-ups para exportar o PDF.'); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  // ----- Breakdowns -----
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, { revenue: number; count: number }> = {};
    filteredSales.forEach(s => {
      const k = s.paymentMethod;
      if (!map[k]) map[k] = { revenue: 0, count: 0 };
      map[k].revenue += s.total;
      map[k].count++;
    });
    return Object.entries(map)
      .map(([k, v]) => ({ key: k, label: paymentMethodLabels[k] || k, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  const channelBreakdown = useMemo(() => {
    const map: Record<string, { revenue: number; count: number }> = {};
    filteredSales.forEach(s => {
      const k = effectiveChannel(s);
      if (!map[k]) map[k] = { revenue: 0, count: 0 };
      map[k].revenue += s.total;
      map[k].count++;
    });
    return Object.entries(map)
      .map(([k, v]) => ({ key: k, label: saleChannelLabels[k] || k, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  const maxBreakdownRevenue = Math.max(
    ...paymentBreakdown.map(p => p.revenue),
    ...channelBreakdown.map(c => c.revenue),
    1
  );

  const maxCategoryRevenue = Math.max(...categoryStats.map(c => c.revenue), 100);

  const yearLabel = selectedYear === 'all' ? 'Todos os anos' : String(selectedYear);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
            Relatórios
          </h1>
          <p className="text-sm text-slate-500 mt-1">Análise de desempenho por período, categoria, canal e produto.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
          <button onClick={() => setViewMode('resume')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'resume' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}>
            Resumo
          </button>
          <button onClick={() => setViewMode('monthly')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}>
            Por Mês
          </button>
          <button onClick={() => setViewMode('yearly')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'yearly' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}>
            Por Ano
          </button>
          <button onClick={() => setViewMode('comparative')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'comparative' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-900'}`}>
            Comparativo
          </button>
        </div>
      </div>

      {/* ========== FILTER BAR ========== */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">Filtros</span>
          {filtersActive && (
            <button onClick={clearFilters} className="ml-1 flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:text-rose-700">
              <X className="h-3 w-3" /> Limpar
            </button>
          )}
          <span className="text-[10px] text-slate-400 font-medium ml-auto">
            {filteredSales.length} venda{filteredSales.length !== 1 ? 's' : ''} · {resumeData.totalFaturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <label className="text-[10px] font-bold text-slate-500 uppercase">Ano:</label>
          </div>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-medium bg-white"
          >
            <option value="all">Todos os anos</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <div className="w-px h-5 bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <label className="text-[10px] font-bold text-slate-500 uppercase">Dia:</label>
            <button
              type="button"
              onClick={() => { setSelectedDay(todayLocalISODate()); setSelectedYear('all'); }}
              className={`px-2.5 py-1.5 text-[10px] font-bold rounded-md transition-colors ${selectedDay === todayLocalISODate() ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
            >
              Hoje
            </button>
            <input
              type="date"
              value={selectedDay === 'all' ? todayLocalISODate() : selectedDay}
              onChange={e => { setSelectedDay(e.target.value || 'all'); setSelectedYear('all'); }}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-medium bg-white"
            />
            {selectedDay !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedDay('all')}
                className="px-2 py-1.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                title="Limpar filtro de dia"
              >
                <X className="h-3 w-3" />
              </button>
            )}
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
            <CreditCard className="h-3.5 w-3.5 text-slate-400" />
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

          <div className="w-px h-5 bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-slate-400" />
            <label className="text-[10px] font-bold text-slate-500 uppercase">Canal:</label>
          </div>
          <select
            value={selectedChannel}
            onChange={e => setSelectedChannel(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-medium bg-white"
          >
            <option value="all">Todos</option>
            {availableChannels.map(c => (
              <option key={c} value={c}>{saleChannelLabels[c] || c}</option>
            ))}
          </select>

          <div className="w-px h-5 bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
            <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo:</label>
          </div>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-medium bg-white"
          >
            {Object.entries(saleTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ========== RESUME VIEW ========== */}
      {viewMode === 'resume' && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Faturamento</span>
              <span className="text-2xl font-bold font-mono text-slate-900 block mt-3">{fmtBRL(resumeData.totalFaturamento)}</span>
              <p className="text-xs text-slate-400 mt-1.5">{yearLabel}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Custo Total</span>
              <span className="text-2xl font-bold font-mono text-amber-600 block mt-3">{fmtBRL(resumeData.totalCusto)}</span>
              <p className="text-xs text-slate-400 mt-1.5">Valor pago nos produtos</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Lucro Líquido</span>
              <span className="text-2xl font-bold font-mono text-emerald-600 block mt-3">{fmtBRL(resumeData.lucro)}</span>
              <p className="text-xs text-slate-400 mt-1.5">Margem {fmtPct(resumeData.margin)}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Ticket Médio</span>
              <span className="text-2xl font-bold font-mono text-indigo-600 block mt-3">{fmtBRL(resumeData.avgTicket)}</span>
              <p className="text-xs text-slate-400 mt-1.5">Faturamento / nº de vendas</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Nº de Vendas</span>
              <span className="text-2xl font-bold font-mono text-slate-900 block mt-3">{filteredSales.length}</span>
              <p className="text-xs text-slate-400 mt-1.5">Vendas concluídas</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Itens Vendidos</span>
              <span className="text-2xl font-bold font-mono text-slate-900 block mt-3">{resumeData.totalUnits}</span>
              <p className="text-xs text-slate-400 mt-1.5">Unidades comercializadas</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">ROI (Retorno)</span>
              <span className="text-2xl font-bold font-mono text-emerald-600 block mt-3">{resumeData.roi.toFixed(1)}%</span>
              <p className="text-xs text-slate-400 mt-1.5">Lucro p/ R$ 1,00 investido</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Margem Líquida</span>
              <span className="text-2xl font-bold font-mono text-indigo-600 block mt-3">{resumeData.margin.toFixed(1)}%</span>
              <p className="text-xs text-slate-400 mt-1.5">% de lucro sobre faturamento</p>
            </div>
          </div>

          {/* ===== Declaração de Imposto - CPF vs CNPJ ===== */}
          {filteredSales.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <BarChart3 className="h-5 w-5 text-slate-500" />
                <h2 className="text-base font-bold text-slate-900">Declaração de Imposto - CPF vs CNPJ ({yearLabel})</h2>
              </div>
              {(() => {
                const cpfSales = filteredSales.filter(s => s.saleType === 'CPF');
                const cnpjSales = filteredSales.filter(s => s.saleType === 'CNPJ');
                const cpfTotal = cpfSales.reduce((a, s) => a + s.total, 0);
                const cnpjTotal = cnpjSales.reduce((a, s) => a + s.total, 0);
                const overallTotal = cpfTotal + cnpjTotal;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">CPF - Consumidor Final</span>
                      <span className="text-xl font-bold font-mono text-emerald-800 block mt-2">{fmtBRL(cpfTotal)}</span>
                      <span className="text-xs text-emerald-600 mt-1 block">{cpfSales.length} venda{cpfSales.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">CNPJ - Revenda / Empresa</span>
                      <span className="text-xl font-bold font-mono text-indigo-800 block mt-2">{fmtBRL(cnpjTotal)}</span>
                      <span className="text-xs text-indigo-600 mt-1 block">{cnpjSales.length} venda{cnpjSales.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-white">
                      <span className="text-[10px] font-bold text-slate-300 uppercase">Total {yearLabel}</span>
                      <span className="text-xl font-bold font-mono block mt-2">{fmtBRL(overallTotal)}</span>
                      <span className="text-xs text-slate-300 mt-1 block">{filteredSales.length} venda{filteredSales.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ===== Breakdowns: payment & channel ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <CreditCard className="h-5 w-5 text-slate-500" />
                <h2 className="text-base font-bold text-slate-900">Por Forma de Pagamento</h2>
              </div>
              {paymentBreakdown.length === 0 ? (
                <div className="text-center py-8 text-slate-400"><p className="text-sm">Nenhuma venda no filtro.</p></div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {paymentBreakdown.map((p, idx) => {
                    const percentageOfMax = (p.revenue / maxBreakdownRevenue) * 100;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">{p.label}</span>
                          <span className="font-mono text-slate-500">{p.count} vnd • <strong className="text-slate-900">{fmtBRL(p.revenue)}</strong></span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${percentageOfMax}%` }} className="bg-indigo-600 h-full rounded-full transition-all duration-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                <Store className="h-5 w-5 text-slate-500" />
                <h2 className="text-base font-bold text-slate-900">Por Canal de Venda</h2>
              </div>
              {channelBreakdown.length === 0 ? (
                <div className="text-center py-8 text-slate-400"><p className="text-sm">Nenhuma venda no filtro.</p></div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {channelBreakdown.map((c, idx) => {
                    const percentageOfMax = (c.revenue / maxBreakdownRevenue) * 100;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">{c.label}</span>
                          <span className="font-mono text-slate-500">{c.count} vnd • <strong className="text-slate-900">{fmtBRL(c.revenue)}</strong></span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${percentageOfMax}%` }} className="bg-emerald-600 h-full rounded-full transition-all duration-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                        <td className="py-2.5 text-right font-mono text-slate-900 font-medium">{fmtBRL(yd.revenue)}</td>
                        <td className="py-2.5 text-right font-mono text-slate-500">{fmtBRL(yd.cost)}</td>
                        <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">{fmtBRL(yd.profit)}</td>
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
            {selectedYear === 'all' ? (
              <select value={monthlyYearLocal} onChange={e => setMonthlyYearLocal(parseInt(e.target.value))} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-medium">
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            ) : (
              <span className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 rounded-lg">{monthlyYear}</span>
            )}
            <span className="text-[10px] text-slate-400 font-medium ml-2">
              {monthlyData.yearTotal.count} vendas | {fmtBRL(monthlyData.yearTotal.revenue)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Faturamento {monthlyYear}</span>
              <span className="text-xl font-bold font-mono text-slate-900 block mt-2">{fmtBRL(monthlyData.yearTotal.revenue)}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Custo {monthlyYear}</span>
              <span className="text-xl font-bold font-mono text-amber-600 block mt-2">{fmtBRL(monthlyData.yearTotal.cost)}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lucro {monthlyYear}</span>
              <span className="text-xl font-bold font-mono text-emerald-600 block mt-2">{fmtBRL(monthlyData.yearTotal.profit)}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Nº Vendas {monthlyYear}</span>
              <span className="text-xl font-bold font-mono text-indigo-600 block mt-2">{monthlyData.yearTotal.count}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Faturamento Mensal - {monthlyYear}</h2>

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
                      <td className="py-2 text-right font-mono text-slate-900 font-medium">{fmtBRL(m.revenue)}</td>
                      <td className="py-2 text-right font-mono text-slate-500">{fmtBRL(m.cost)}</td>
                      <td className="py-2 text-right font-mono text-emerald-600 font-bold">{fmtBRL(m.profit)}</td>
                      <td className="py-2 text-right font-mono font-bold text-indigo-600">{m.margin.toFixed(0)}%</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-300 font-bold">
                    <td className="py-2 text-slate-900">TOTAL {monthlyYear}</td>
                    <td className="py-2 text-center font-mono text-slate-900">{monthlyData.yearTotal.count}</td>
                    <td className="py-2 text-right font-mono text-slate-900">{fmtBRL(monthlyData.yearTotal.revenue)}</td>
                    <td className="py-2 text-right font-mono text-slate-900">{fmtBRL(monthlyData.yearTotal.cost)}</td>
                    <td className="py-2 text-right font-mono text-emerald-600">{fmtBRL(monthlyData.yearTotal.profit)}</td>
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
                        <div className="flex justify-between"><span className="text-slate-500">Receita:</span><span className="font-bold text-slate-900">{fmtBRL(yd.revenue)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Custo:</span><span className="font-medium text-slate-600">{fmtBRL(yd.cost)}</span></div>
                        <div className="flex justify-between border-t border-slate-200 pt-1.5"><span className="text-slate-500">Lucro:</span><span className="font-bold text-emerald-600">{fmtBRL(yd.profit)}</span></div>
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
                        <td className="py-2.5 text-right font-mono text-slate-900 font-medium">{fmtBRL(yd.revenue)}</td>
                        <td className="py-2.5 text-right font-mono text-slate-500">{fmtBRL(yd.cost)}</td>
                        <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">{fmtBRL(yd.profit)}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-indigo-600">{yd.margin.toFixed(0)}%</td>
                        <td className="py-2.5 text-right font-mono text-slate-900">{yd.count > 0 ? fmtBRL(yd.revenue / yd.count) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========== COMPARATIVE VIEW ========== */}
      {viewMode === 'comparative' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1 border-b border-slate-200 pb-3">
              <BarChart3 className="h-5 w-5 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">Comparativo por Mês e Ano</h2>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Cada célula mostra o <b>Faturamento</b> do mês/ano. O <b>%</b> é a variação vs o mesmo mês do ano anterior (YoY).
            </p>

            {comparativeData.years.length === 0 ? (
              <div className="text-center py-12 text-slate-400"><p className="text-sm font-medium">Nenhuma venda registrada.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Mês</th>
                      {comparativeData.years.map(y => (
                        <th key={y} className="pb-3 text-right min-w-[120px]">{y}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {comparativeData.months.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 font-bold text-slate-900">{row.name}</td>
                        {row.cells.map((c) => {
                          const intensity = comparativeData.maxCellRevenue > 0 ? (c.revenue / comparativeData.maxCellRevenue) : 0;
                          return (
                            <td key={c.year} className="py-2 text-right align-top">
                              <div className="font-mono font-medium text-slate-900">{fmtBRL(c.revenue)}</div>
                              {c.revenue > 0 && (
                                <div className={`text-[10px] font-bold ${c.yoy !== null && c.yoy >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {c.yoy !== null ? `${c.yoy >= 0 ? '▲' : '▼'} ${Math.abs(c.yoy).toFixed(1)}%` : '—'}
                                </div>
                              )}
                              <div className="h-1 mt-1 rounded-full bg-slate-100 overflow-hidden">
                                <div style={{ width: `${intensity * 100}%` }} className="h-full bg-indigo-500/70 rounded-full" />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-300 font-bold">
                      <td className="py-2 text-slate-900">TOTAL</td>
                      {comparativeData.yearTotals.map((yt) => (
                        <td key={yt.year} className="py-2 text-right align-top">
                          <div className="font-mono text-slate-900">{fmtBRL(yt.revenue)}</div>
                          {yt.revenueYoY !== null && (
                            <div className={`text-[10px] font-bold ${yt.revenueYoY >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {yt.revenueYoY >= 0 ? '▲' : '▼'} {Math.abs(yt.revenueYoY).toFixed(1)}%
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">Resumo Anual (variação ano a ano)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Ano</th>
                    <th className="pb-3 text-right">Faturamento</th>
                    <th className="pb-3 text-right">Δ Fat.</th>
                    <th className="pb-3 text-right">Lucro</th>
                    <th className="pb-3 text-right">Δ Lucro</th>
                    <th className="pb-3 text-right">Vendas</th>
                    <th className="pb-3 text-right">Δ Vendas</th>
                    <th className="pb-3 text-right">Ticket Médio</th>
                    <th className="pb-3 text-right">Δ Ticket</th>
                    <th className="pb-3 text-right">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {comparativeData.yearTotals.map((yt) => (
                    <tr key={yt.year} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900">{yt.year}</td>
                      <td className="py-2.5 text-right font-mono text-slate-900 font-medium">{fmtBRL(yt.revenue)}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{yt.revenueYoY !== null ? <span className={yt.revenueYoY >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{yt.revenueYoY >= 0 ? '▲' : '▼'} {Math.abs(yt.revenueYoY).toFixed(1)}%</span> : '—'}</td>
                      <td className="py-2.5 text-right font-mono text-emerald-600 font-bold">{fmtBRL(yt.profit)}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{yt.profitYoY !== null ? <span className={yt.profitYoY >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{yt.profitYoY >= 0 ? '▲' : '▼'} {Math.abs(yt.profitYoY).toFixed(1)}%</span> : '—'}</td>
                      <td className="py-2.5 text-right font-mono text-slate-600">{yt.count}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{yt.countYoY !== null ? <span className={yt.countYoY >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{yt.countYoY >= 0 ? '▲' : '▼'} {Math.abs(yt.countYoY).toFixed(1)}%</span> : '—'}</td>
                      <td className="py-2.5 text-right font-mono text-slate-900">{fmtBRL(yt.ticket)}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{yt.ticketYoY !== null ? <span className={yt.ticketYoY >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{yt.ticketYoY >= 0 ? '▲' : '▼'} {Math.abs(yt.ticketYoY).toFixed(1)}%</span> : '—'}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-indigo-600">{yt.margin.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========== CATEGORY & SOLD ITEMS (always shown) ========== */}
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
                      <span className="font-mono text-slate-500">{cat.itemsSold} un • <strong className="text-slate-900">{fmtBRL(cat.revenue)}</strong></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div style={{ width: `${percentageOfMax}%` }} className="bg-indigo-600 h-full rounded-full transition-all duration-500" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Custo: {fmtBRL(cat.cost)}</span>
                      <span className="text-emerald-600 font-semibold">Lucro: {fmtBRL(cat.profit)} ({catMargin.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== Sold items report (full, searchable, sortable) ===== */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-3">
            <ShoppingBag className="h-5 w-5 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900">Itens Vendidos</h2>
            <span className="text-[10px] font-medium text-slate-400 ml-auto">{visibleProducts.length} produto{visibleProducts.length !== 1 ? 's' : ''}</span>
            <button onClick={exportCsv} className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors" title="Exportar CSV" aria-label="Exportar CSV">
              <Download className="h-3 w-3" /> CSV
            </button>
            <button onClick={exportPdf} className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors" title="Exportar PDF" aria-label="Exportar PDF">
              <FileText className="h-3 w-3" /> PDF
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              placeholder="Buscar produto ou categoria..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
            />
          </div>

          {visibleProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-400"><p className="text-sm">Nenhum item vendido no filtro.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2 pr-2 cursor-pointer select-none hover:text-slate-600" onClick={() => handleSort('productName')}>Produto{sortCaret('productName')}</th>
                    <th className="pb-2 text-center cursor-pointer select-none hover:text-slate-600" onClick={() => handleSort('units')}>Qtd{sortCaret('units')}</th>
                    <th className="pb-2 text-center cursor-pointer select-none hover:text-slate-600" onClick={() => handleSort('salesCount')}>Vendas{sortCaret('salesCount')}</th>
                    <th className="pb-2 text-right cursor-pointer select-none hover:text-slate-600" onClick={() => handleSort('revenue')}>Faturamento{sortCaret('revenue')}</th>
                    <th className="pb-2 text-right cursor-pointer select-none hover:text-slate-600" onClick={() => handleSort('cost')}>Custo{sortCaret('cost')}</th>
                    <th className="pb-2 text-right cursor-pointer select-none hover:text-slate-600" onClick={() => handleSort('profit')}>Lucro{sortCaret('profit')}</th>
                    <th className="pb-2 text-right cursor-pointer select-none hover:text-slate-600" onClick={() => handleSort('margin')}>Margem{sortCaret('margin')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {visibleProducts.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 pr-2 font-bold text-slate-900">
                        <p className="line-clamp-1" title={prod.productName}>{prod.productName}</p>
                        <span className="text-[9px] text-slate-400 font-normal uppercase">{prod.category}</span>
                      </td>
                      <td className="py-2 text-center font-mono text-slate-600">{prod.units}</td>
                      <td className="py-2 text-center font-mono text-slate-500">{prod.salesCount}</td>
                      <td className="py-2 text-right font-mono text-slate-900 font-medium">{fmtBRL(prod.revenue)}</td>
                      <td className="py-2 text-right font-mono text-slate-500">{fmtBRL(prod.cost)}</td>
                      <td className="py-2 text-right font-mono text-emerald-600 font-bold">{fmtBRL(prod.profit)}</td>
                      <td className="py-2 text-right font-mono font-bold text-indigo-600">{prod.margin.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 font-bold text-xs">
                    <td className="py-2 pr-2 text-slate-900">TOTAL</td>
                    <td className="py-2 text-center font-mono text-slate-900">{productsTotals.units}</td>
                    <td className="py-2 text-center font-mono text-slate-400">—</td>
                    <td className="py-2 text-right font-mono text-slate-900">{fmtBRL(productsTotals.revenue)}</td>
                    <td className="py-2 text-right font-mono text-slate-900">{fmtBRL(productsTotals.cost)}</td>
                    <td className="py-2 text-right font-mono text-emerald-600">{fmtBRL(productsTotals.profit)}</td>
                    <td className="py-2 text-right font-mono font-bold text-indigo-600">{productsTotals.revenue > 0 ? ((productsTotals.profit / productsTotals.revenue) * 100).toFixed(0) : 0}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
