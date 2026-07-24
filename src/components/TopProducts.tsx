import React, { useMemo, useState } from 'react';
import { Product, Sale } from '../types';
import { Trophy, TrendingUp, Package, Download, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface TopProductsProps {
  products: Product[];
  sales: Sale[];
}

export default function TopProducts({ products, sales }: TopProductsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [showCount, setShowCount] = useState(10);

  const topProducts = useMemo(() => {
    const completedSales = sales.filter(s => s.status === 'completed');
    
    // Filter by time range
    const now = new Date();
    const filteredSales = completedSales.filter(s => {
      const saleDate = new Date(s.date);
      switch (timeRange) {
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return saleDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return saleDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return saleDate >= yearAgo;
        default:
          return true;
      }
    });

    // Calculate sales per product
    const productSales: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {};
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.productId || item.productName;
        if (!productSales[key]) {
          productSales[key] = { name: item.productName, quantity: 0, revenue: 0, profit: 0 };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.total;
        productSales[key].profit += item.total - (item.costPrice * item.quantity);
      });
    });

    // Sort by quantity and return top N
    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, showCount);
  }, [sales, timeRange, showCount]);

  const totalRevenue = topProducts.reduce((acc, p) => acc + p.revenue, 0);
  const totalProfit = topProducts.reduce((acc, p) => acc + p.profit, 0);
  const totalQuantity = topProducts.reduce((acc, p) => acc + p.quantity, 0);

  const generateReport = () => {
    const rangeLabel = timeRange === 'week' ? 'Última Semana' :
                       timeRange === 'month' ? 'Último Mês' :
                       timeRange === 'year' ? 'Último Ano' : 'Todo Período';
    
    let report = `📊 *RELATÓRIO DE PRODUTOS MAIS VENDIDOS*\n`;
    report += `📅 Período: ${rangeLabel}\n`;
    report += `⏰ Gerado: ${new Date().toLocaleString('pt-BR')}\n\n`;
    
    report += `🏆 *TOP ${showCount} PRODUTOS*\n\n`;
    
    topProducts.forEach((p, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`;
      report += `${medal} *${p.name}*\n`;
      report += `   📦 Vendidos: ${p.quantity} un.\n`;
      report += `   💰 Receita: R$ ${p.revenue.toFixed(2)}\n`;
      report += `   📈 Lucro: R$ ${p.profit.toFixed(2)}\n\n`;
    });

    report += `📊 *RESUMO*\n`;
    report += `• Total de produtos vendidos: ${totalQuantity}\n`;
    report += `• Receita total: R$ ${totalRevenue.toFixed(2)}\n`;
    report += `• Lucro total: R$ ${totalProfit.toFixed(2)}\n`;
    report += `• Ticket médio por produto: R$ ${(totalRevenue / totalQuantity || 0).toFixed(2)}`;

    return report;
  };

  const handleSendReport = () => {
    const report = generateReport();
    const encoded = encodeURIComponent(report);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    toast.success('Relatório preparado!');
  };

  const handleExportCSV = () => {
    const csv = [
      'Posição,Produto,Quantidade Vendida,Receita,Lucro',
      ...topProducts.map((p, i) => 
        `${i + 1},"${p.name}",${p.quantity},${p.revenue.toFixed(2)},${p.profit.toFixed(2)}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TopProdutos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('CSV exportado!');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Trophy className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Produtos Mais Vendidos</h3>
            <p className="text-sm text-slate-500">Análise de performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={handleSendReport}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            Enviar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['week', 'month', 'year', 'all'] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeRange === range
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {range === 'week' ? '7 Dias' : range === 'month' ? '30 Dias' : range === 'year' ? '1 Ano' : 'Tudo'}
          </button>
        ))}
        <select
          value={showCount}
          onChange={(e) => setShowCount(Number(e.target.value))}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white"
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">{totalQuantity}</p>
          <p className="text-xs text-indigo-600">Itens Vendidos</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            R$ {totalRevenue.toFixed(0)}
          </p>
          <p className="text-xs text-emerald-600">Receita</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">
            R$ {totalProfit.toFixed(0)}
          </p>
          <p className="text-xs text-amber-600">Lucro</p>
        </div>
      </div>

      {/* Product List */}
      {topProducts.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>Nenhuma venda encontrada no período selecionado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topProducts.map((product, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                index < 3 ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-slate-100 text-slate-600' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-50 text-slate-500'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {product.quantity} unidades • {((product.quantity / totalQuantity) * 100).toFixed(1)}% do total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-slate-900">
                  R$ {product.revenue.toFixed(2)}
                </p>
                <p className="text-[10px] text-emerald-600">
                  +R$ {product.profit.toFixed(2)} lucro
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
