import React, { useState, useMemo } from 'react';
import { Product, Sale, StoreInfo } from '../types';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Lightbulb, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SeasonalityChartProps {
  products: Product[];
  sales: Sale[];
  storeInfo: StoreInfo;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const SEASONAL_EVENTS: Record<number, { event: string; tip: string; emoji: string }> = {
  0: { event: 'Férias / Ano Novo', tip: 'Celulares e acessórios de viagem', emoji: '🏖️' },
  1: { event: 'Carnaval', tip: 'Capas protetoras, power banks', emoji: '🎭' },
  2: { event: 'Volta às aulas', tip: 'Notebooks, tablets, acessórios', emoji: '📚' },
  3: { event: 'Páscoa', tip: 'Promoções de primavera', emoji: '🐰' },
  4: { event: 'Dia das Mães', tip: 'Presentes, smartphones', emoji: '👩' },
  5: { event: 'Dia dos Namorados', tip: 'Fones, smartwatches, presentes', emoji: '💕' },
  6: { event: 'Férias de inverno', tip: 'Acessórios para casa', emoji: '❄️' },
  7: { event: 'Dia dos Pais', tip: 'Gadgets, ferramentas tech', emoji: '👨' },
  8: { event: 'Dia do Cliente', tip: 'Promoções especiais', emoji: '🤝' },
  9: { event: 'Dia das Crianças', tip: 'Games, tablets, brinquedos tech', emoji: '🧸' },
  10: { event: 'Black Friday', tip: 'MAIOR PROMOÇÃO DO ANO!', emoji: '🖤' },
  11: { event: 'Natal / Ano Novo', tip: 'Presentes, promoções de fim de ano', emoji: '🎄' },
};

export default function SeasonalityChart({ products, sales, storeInfo }: SeasonalityChartProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly'>('monthly');

  const salesByMonth = useMemo(() => {
    const monthly: number[] = Array(12).fill(0);
    const countByMonth: number[] = Array(12).fill(0);
    const itemsByMonth: number[] = Array(12).fill(0);

    sales.forEach(sale => {
      const date = new Date(sale.date);
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        monthly[month] += sale.total;
        countByMonth[month]++;
        itemsByMonth[month] += sale.items.reduce((sum, item) => sum + item.quantity, 0);
      }
    });

    return { monthly, countByMonth, itemsByMonth };
  }, [sales, selectedYear]);

  const maxSale = Math.max(...salesByMonth.monthly, 1);

  const stats = useMemo(() => {
    const total = salesByMonth.monthly.reduce((a, b) => a + b, 0);
    const avg = total / 12;
    const bestMonth = salesByMonth.monthly.indexOf(Math.max(...salesByMonth.monthly));
    const worstMonth = salesByMonth.monthly.indexOf(Math.min(...salesByMonth.monthly));
    const totalItems = salesByMonth.itemsByMonth.reduce((a, b) => a + b, 0);

    return { total, avg, bestMonth, worstMonth, totalItems };
  }, [salesByMonth]);

  const quarterly = useMemo(() => {
    return [
      { label: 'Q1 (Jan-Mar)', total: salesByMonth.monthly.slice(0, 3).reduce((a, b) => a + b, 0) },
      { label: 'Q2 (Abr-Jun)', total: salesByMonth.monthly.slice(3, 6).reduce((a, b) => a + b, 0) },
      { label: 'Q3 (Jul-Set)', total: salesByMonth.monthly.slice(6, 9).reduce((a, b) => a + b, 0) },
      { label: 'Q4 (Out-Dez)', total: salesByMonth.monthly.slice(9, 12).reduce((a, b) => a + b, 0) },
    ];
  }, [salesByMonth]);

  const maxQuarter = Math.max(...quarterly.map(q => q.total), 1);

  const currentMonth = new Date().getMonth();
  const currentEvent = SEASONAL_EVENTS[currentMonth];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    sales.forEach(sale => years.add(new Date(sale.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [sales]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Análise de Sazonalidade</h3>
            <p className="text-sm text-slate-500">Padrões de vendas por período</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                viewMode === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setViewMode('quarterly')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                viewMode === 'quarterly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              Trimestral
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-orange-600">R$ {(stats.total / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-orange-600">Total {selectedYear}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-600">R$ {(stats.avg / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-blue-600">Média/mês</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-600">{stats.totalItems}</p>
          <p className="text-[10px] text-emerald-600">Itens vendidos</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-purple-600">{stats.bestMonth !== -1 ? MONTHS[stats.bestMonth] : '-'}</p>
          <p className="text-[10px] text-purple-600">Melhor mês</p>
        </div>
      </div>

      {/* Current Event */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentEvent.emoji}</span>
          <div>
            <h4 className="font-bold">Evento Atual: {currentEvent.event}</h4>
            <p className="text-sm opacity-90">{currentEvent.tip}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="font-bold text-slate-900 mb-4">
          {viewMode === 'monthly' ? 'Vendas Mensais' : 'Vendas Trimestrais'} - {selectedYear}
        </h4>
        
        {viewMode === 'monthly' ? (
          <div className="space-y-2">
            {MONTHS.map((month, idx) => {
              const value = salesByMonth.monthly[idx];
              const percentage = maxSale > 0 ? (value / maxSale) * 100 : 0;
              const isBest = idx === stats.bestMonth;
              const isWorst = idx === stats.worstMonth;
              const isCurrent = idx === currentMonth;

              return (
                <div key={month} className="flex items-center gap-2">
                  <span className={`text-xs font-semibold w-8 ${isCurrent ? 'text-orange-600' : 'text-slate-600'}`}>
                    {month}
                  </span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full flex items-center justify-end pr-2 ${
                        isBest ? 'bg-emerald-500' :
                        isWorst && value > 0 ? 'bg-red-400' :
                        isCurrent ? 'bg-orange-500' :
                        'bg-blue-400'
                      }`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    >
                      {percentage > 15 && (
                        <span className="text-[10px] font-bold text-white">
                          R$ {(value / 1000).toFixed(1)}k
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-16 text-right">
                    R$ {value.toFixed(0)}
                  </span>
                  {isBest && <span className="text-xs">🏆</span>}
                  {isCurrent && !isBest && <span className="text-xs">📍</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {quarterly.map((q, idx) => {
              const percentage = maxQuarter > 0 ? (q.total / maxQuarter) * 100 : 0;
              const isBest = q.total === Math.max(...quarterly.map(q2 => q2.total));

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">{q.label}</span>
                    <span className="text-xs font-bold text-slate-900">R$ {q.total.toFixed(0)}</span>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full flex items-center justify-center ${
                        isBest ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-blue-400'
                      }`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      <span className="text-xs font-bold text-white">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seasonal Tips */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Dicas Sazonais
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(SEASONAL_EVENTS).map(([month, event]) => {
            const monthIdx = Number(month);
            const isCurrent = monthIdx === currentMonth;
            const monthSales = salesByMonth.monthly[monthIdx];

            return (
              <div
                key={month}
                className={`p-2 rounded-xl text-xs ${
                  isCurrent
                    ? 'bg-orange-50 border-2 border-orange-300'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span>{event.emoji}</span>
                  <span className="font-semibold text-slate-900">{MONTHS_FULL[monthIdx].slice(0, 3)}</span>
                </div>
                <p className="text-slate-600 text-[10px]">{event.event}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{event.tip}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best vs Worst */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-emerald-800">Melhor Mês</span>
          </div>
          {stats.bestMonth !== -1 ? (
            <>
              <p className="text-2xl font-bold text-emerald-600">{MONTHS_FULL[stats.bestMonth]}</p>
              <p className="text-sm text-emerald-700">R$ {salesByMonth.monthly[stats.bestMonth].toFixed(2)}</p>
              <p className="text-xs text-emerald-600">{salesByMonth.countByMonth[stats.bestMonth]} vendas</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Sem dados</p>
          )}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="font-bold text-red-800">Pior Mês</span>
          </div>
          {stats.worstMonth !== -1 && salesByMonth.monthly[stats.worstMonth] > 0 ? (
            <>
              <p className="text-2xl font-bold text-red-600">{MONTHS_FULL[stats.worstMonth]}</p>
              <p className="text-sm text-red-700">R$ {salesByMonth.monthly[stats.worstMonth].toFixed(2)}</p>
              <p className="text-xs text-red-600">{salesByMonth.countByMonth[stats.worstMonth]} vendas</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Sem dados</p>
          )}
        </div>
      </div>
    </div>
  );
}
