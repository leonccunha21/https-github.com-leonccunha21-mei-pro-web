import React, { useState, useMemo } from 'react';
import { Product, Sale, StoreInfo } from '../types';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Download, Filter, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface MarginReportProps {
  products: Product[];
  sales: Sale[];
  storeInfo: StoreInfo;
}

type SortField = 'marginPercent' | 'totalProfit' | 'totalRevenue' | 'totalCost' | 'unitsSold';
type SortOrder = 'asc' | 'desc';

interface ProductMargin {
  productId: string;
  productName: string;
  category: string;
  costPrice: number;
  salePrice: number;
  marginPercent: number;
  profitPerUnit: number;
  unitsSold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

export default function MarginReport({ products, sales, storeInfo }: MarginReportProps) {
  const [sortField, setSortField] = useState<SortField>('marginPercent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [minMargin, setMinMargin] = useState<number>(0);

  const productMargins = useMemo(() => {
    const marginMap: Record<string, ProductMargin> = {};

    products.forEach(product => {
      const productSales = sales.filter(s =>
        s.items.some(item => item.productId === product.id)
      );

      let unitsSold = 0;
      productSales.forEach(sale => {
        sale.items.forEach(item => {
          if (item.productId === product.id) {
            unitsSold += item.quantity;
          }
        });
      });

      const marginPercent = product.costPrice > 0
        ? ((product.salePrice - product.costPrice) / product.costPrice) * 100
        : 0;

      const profitPerUnit = product.salePrice - product.costPrice;
      const totalRevenue = unitsSold * product.salePrice;
      const totalCost = unitsSold * product.costPrice;
      const totalProfit = totalRevenue - totalCost;

      marginMap[product.id] = {
        productId: product.id,
        productName: product.name,
        category: product.category || 'Sem categoria',
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        marginPercent,
        profitPerUnit,
        unitsSold,
        totalRevenue,
        totalCost,
        totalProfit,
      };
    });

    return Object.values(marginMap);
  }, [products, sales]);

  const categories = useMemo(() => {
    const cats = new Set(productMargins.map(p => p.category));
    return Array.from(cats).sort();
  }, [productMargins]);

  const filteredMargins = useMemo(() => {
    let result = productMargins;

    if (filterCategory !== 'all') {
      result = result.filter(p => p.category === filterCategory);
    }

    if (minMargin > 0) {
      result = result.filter(p => p.marginPercent >= minMargin);
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [productMargins, filterCategory, minMargin, sortField, sortOrder]);

  const stats = useMemo(() => {
    const totalRevenue = productMargins.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalCost = productMargins.reduce((sum, p) => sum + p.totalCost, 0);
    const totalProfit = productMargins.reduce((sum, p) => sum + p.totalProfit, 0);
    const avgMargin = productMargins.length > 0
      ? productMargins.reduce((sum, p) => sum + p.marginPercent, 0) / productMargins.length
      : 0;
    const highMarginProducts = productMargins.filter(p => p.marginPercent >= 50).length;
    const lowMarginProducts = productMargins.filter(p => p.marginPercent < 20).length;
    const noMarginProducts = productMargins.filter(p => p.costPrice === 0).length;

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      avgMargin,
      highMarginProducts,
      lowMarginProducts,
      noMarginProducts,
    };
  }, [productMargins]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return 'text-emerald-600 bg-emerald-50';
    if (margin >= 30) return 'text-blue-600 bg-blue-50';
    if (margin >= 20) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getMarginLabel = (margin: number) => {
    if (margin >= 50) return 'Alta';
    if (margin >= 30) return 'Boa';
    if (margin >= 20) return 'Regular';
    if (margin > 0) return 'Baixa';
    return 'Sem custo';
  };

  const exportCSV = () => {
    const headers = ['Produto', 'Categoria', 'Preço Custo', 'Preço Venda', 'Margem %', 'Lucro/Unidade', 'Unidades Vendidas', 'Receita Total', 'Custo Total', 'Lucro Total'];
    const rows = filteredMargins.map(p => [
      p.productName,
      p.category,
      p.costPrice.toFixed(2),
      p.salePrice.toFixed(2),
      p.marginPercent.toFixed(1),
      p.profitPerUnit.toFixed(2),
      p.unitsSold.toString(),
      p.totalRevenue.toFixed(2),
      p.totalCost.toFixed(2),
      p.totalProfit.toFixed(2),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-margens-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Relatório exportado!');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Relatório de Margem</h3>
            <p className="text-sm text-slate-500">Análise de lucratividade por produto</p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-600">R$ {(stats.totalProfit / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-emerald-600">Lucro Total</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-600">{stats.avgMargin.toFixed(1)}%</p>
          <p className="text-[10px] text-blue-600">Margem Média</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-purple-600">{stats.highMarginProducts}</p>
          <p className="text-[10px] text-purple-600">Alta Margem (50%+)</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-amber-600">{stats.lowMarginProducts}</p>
          <p className="text-[10px] text-amber-600">Baixa Margem (&lt;20%)</p>
        </div>
      </div>

      {/* Warning */}
      {stats.noMarginProducts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{stats.noMarginProducts} produto(s)</strong> sem preço de custo definido. Cadastre o custo para ter relatórios precisos.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"
          >
            <option value="all">Todas categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Margem mín:</span>
          <input
            type="number"
            value={minMargin}
            onChange={e => setMinMargin(Number(e.target.value))}
            min={0}
            max={100}
            className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"
          />
          <span className="text-sm text-slate-500">%</span>
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { field: 'marginPercent' as SortField, label: 'Margem' },
          { field: 'totalProfit' as SortField, label: 'Lucro' },
          { field: 'totalRevenue' as SortField, label: 'Receita' },
          { field: 'unitsSold' as SortField, label: 'Unidades' },
        ].map(s => (
          <button
            key={s.field}
            onClick={() => handleSort(s.field)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap flex items-center gap-1 ${
              sortField === s.field
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.label}
            {sortField === s.field && (
              <ArrowUpDown className="h-3 w-3" />
            )}
          </button>
        ))}
      </div>

      {/* Products List */}
      <div className="space-y-2">
        {filteredMargins.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <DollarSign className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold">Nenhum produto encontrado</p>
            <p className="text-sm">Ajuste os filtros ou cadastre produtos com preço de custo</p>
          </div>
        ) : (
          filteredMargins.map(p => (
            <div key={p.productId} className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 text-sm">{p.productName}</h4>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getMarginColor(p.marginPercent)}`}>
                      {getMarginLabel(p.marginPercent)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2">{p.category}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Custo</p>
                      <p className="font-semibold text-slate-900">R$ {p.costPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Venda</p>
                      <p className="font-semibold text-slate-900">R$ {p.salePrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Lucro/und</p>
                      <p className={`font-semibold ${p.profitPerUnit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        R$ {p.profitPerUnit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getMarginColor(p.marginPercent).split(' ')[0]}`}>
                    {p.marginPercent.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-500">margem</p>
                </div>
              </div>
              {p.unitsSold > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500">Vendidos</p>
                    <p className="font-semibold text-slate-900">{p.unitsSold} un</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Receita</p>
                    <p className="font-semibold text-blue-600">R$ {p.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Lucro Total</p>
                    <p className={`font-semibold ${p.totalProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      R$ {p.totalProfit.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredMargins.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-4 text-white">
          <h4 className="font-bold mb-2">Resumo do Relatório</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="opacity-80">Produtos analisados:</p>
              <p className="font-bold">{filteredMargins.length}</p>
            </div>
            <div>
              <p className="opacity-80">Receita total:</p>
              <p className="font-bold">R$ {stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="opacity-80">Custo total:</p>
              <p className="font-bold">R$ {stats.totalCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="opacity-80">Lucro total:</p>
              <p className="font-bold">R$ {stats.totalProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
