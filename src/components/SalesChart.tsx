import React from 'react';

export interface ChartPoint {
  label: string;
  revenue: number;
  profit: number;
}

interface SalesChartProps {
  data: ChartPoint[];
}

// Renderiza o gráfico de faturamento/lucro (barras agrupadas) em SVG puro,
// extraído de Dashboard.tsx para manter aquele componente focado em layout.
export default function SalesChart({ data }: SalesChartProps) {
  if (data.length === 0) return null;

  const width = 700;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(...data.map(d => d.revenue), 100);
  const barWidth = Math.max(2, (chartWidth / data.length) - 2);
  const gap = 2;

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gráfico de faturamento e lucro por período">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => (
        <g key={idx}>
          <line x1={padding.left} y1={padding.top + val * chartHeight} x2={width - padding.right} y2={padding.top + val * chartHeight} stroke="#F1F5F9" strokeWidth="1" />
          <text x={padding.left - 5} y={padding.top + val * chartHeight + 4} textAnchor="end" className="text-[8px] fill-slate-400 font-mono">
            {Math.round(maxRevenue - maxRevenue * val)}
          </text>
        </g>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const x = padding.left + (i * (chartWidth / data.length)) + gap;
        const barH = (d.revenue / maxRevenue) * chartHeight;
        const profitH = (d.profit / maxRevenue) * chartHeight;

        return (
          <g key={i}>
            {/* Revenue bar */}
            <rect x={x} y={padding.top + chartHeight - barH} width={barWidth / 2} height={barH} fill="#4F46E5" rx="1" className="hover:opacity-80 transition-opacity">
              <title>{`Vendas: R$ ${d.revenue.toFixed(2)}`}</title>
            </rect>
            {/* Profit bar */}
            <rect x={x + barWidth / 2 + 1} y={padding.top + chartHeight - profitH} width={barWidth / 2} height={profitH} fill="#10B981" rx="1" className="hover:opacity-80 transition-opacity">
              <title>{`Lucro: R$ ${d.profit.toFixed(2)}`}</title>
            </rect>
            {/* X label */}
            {(data.length <= 31 || i % Math.ceil(data.length / 15) === 0) && (
              <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" className="text-[7px] fill-slate-500 font-medium">
                {d.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <rect x={width - 120} y={5} width={8} height={8} fill="#4F46E5" rx="1" />
      <text x={width - 108} y={13} className="text-[9px] fill-slate-500 font-medium">Vendas</text>
      <rect x={width - 65} y={5} width={8} height={8} fill="#10B981" rx="1" />
      <text x={width - 53} y={13} className="text-[9px] fill-slate-500 font-medium">Lucro</text>
    </svg>
  );
}
