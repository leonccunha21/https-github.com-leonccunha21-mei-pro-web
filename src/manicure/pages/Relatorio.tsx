import { useState, useMemo } from 'react';
import { MovimentoCaixa, AgendamentoManicure, ServicoManicure, ClienteManicure } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, Calendar, Award, CreditCard, Scissors, Users, BarChart3 } from 'lucide-react';

interface Props {
  movimentos: MovimentoCaixa[];
  agendamentos: AgendamentoManicure[];
  servicos: ServicoManicure[];
  clientes: ClienteManicure[];
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];

function formatMoney(v: number) { return `R$ ${v.toFixed(2)}`; }

const CORES_PAG = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
const CORES_CAT = ['#f97316', '#06b6d4', '#a855f7', '#64748b'];

// Dias úteis (seg-sex) num mês
function diasUteisNoMes(ano: number, mes: number): number {
  const total = new Date(ano, mes + 1, 0).getDate();
  let uteis = 0;
  for (let d = 1; d <= total; d++) {
    const dow = new Date(ano, mes, d).getDay();
    if (dow !== 0 && dow !== 6) uteis++;
  }
  return uteis;
}

export default function Relatorio({ movimentos, agendamentos, servicos, clientes }: Props) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());

  const movimentosMes = useMemo(() => {
    const prefix = `${ano}-${String(mes + 1).padStart(2, '0')}`;
    return movimentos.filter((m) => m.data.startsWith(prefix));
  }, [movimentos, mes, ano]);

  // Mês anterior para comparativos
  const mesAntNum = mes === 0 ? 11 : mes - 1;
  const anoAntNum = mes === 0 ? ano - 1 : ano;
  const movimentosMesAnt = useMemo(() => {
    const prefix = `${anoAntNum}-${String(mesAntNum + 1).padStart(2, '0')}`;
    return movimentos.filter((m) => m.data.startsWith(prefix));
  }, [movimentos, mesAntNum, anoAntNum]);

  const entradasMes = movimentosMes.filter((m) => m.tipo === 'entrada');
  const saidasMes = movimentosMes.filter((m) => m.tipo === 'saida');
  const receitaMes = entradasMes.reduce((s, m) => s + m.valor, 0);
  const custosMes = saidasMes.reduce((s, m) => s + m.valor, 0);
  const lucroMes = receitaMes - custosMes;
  const margemMes = receitaMes > 0 ? (lucroMes / receitaMes) * 100 : 0;

  // Comparativos mês anterior
  const receitaAnt = movimentosMesAnt.filter((m) => m.tipo === 'entrada').reduce((s, m) => s + m.valor, 0);
  const custosAnt = movimentosMesAnt.filter((m) => m.tipo === 'saida').reduce((s, m) => s + m.valor, 0);
  const lucroAnt = receitaAnt - custosAnt;
  const margemAnt = receitaAnt > 0 ? (lucroAnt / receitaAnt) * 100 : 0;
  const variacao = (atual: number, ant: number) => ant === 0 ? null : ((atual - ant) / ant) * 100;

  const agendamentosMes = agendamentos.filter((a) => a.data.startsWith(`${ano}-${String(mes + 1).padStart(2, '0')}`));
  const concluidosMes = agendamentosMes.filter((a) => a.status === 'concluido');
  const taxaConclusao = agendamentosMes.length > 0 ? (concluidosMes.length / agendamentosMes.length) * 100 : 0;

  const servicosPorReceita = useMemo(() => {
    const map = new Map<string, { nome: string; receita: number; qtd: number }>();
    for (const c of concluidosMes) {
      const existing = map.get(c.servicoNome) || { nome: c.servicoNome, receita: 0, qtd: 0 };
      existing.receita += c.valor;
      existing.qtd++;
      map.set(c.servicoNome, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.receita - a.receita).slice(0, 5);
  }, [concluidosMes]);

  const clientesTop = useMemo(() => {
    const map = new Map<string, { nome: string; qtd: number; total: number }>();
    for (const c of concluidosMes) {
      const existing = map.get(c.clienteNome) || { nome: c.clienteNome, qtd: 0, total: 0 };
      existing.qtd++;
      existing.total += c.valor;
      map.set(c.clienteNome, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.qtd - a.qtd).slice(0, 5);
  }, [concluidosMes]);

  const pagamentos = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of entradasMes) {
      const chave = m.formaPagamento || 'outro';
      map.set(chave, (map.get(chave) || 0) + m.valor);
    }
    return Array.from(map.entries()).map(([nome, valor]) => ({ nome: nome.replace(/_/g, ' '), valor }));
  }, [entradasMes]);

  const custosPorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of saidasMes) {
      map.set(m.categoria, (map.get(m.categoria) || 0) + m.valor);
    }
    return Array.from(map.entries()).map(([nome, valor]) => ({ nome: nome.charAt(0).toUpperCase() + nome.slice(1), valor }));
  }, [saidasMes]);

  const dataMensal = useMemo(() => {
    const data: { mes: string; receita: number; custos: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ano, mes - i, 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const movs = movimentos.filter((m) => m.data.startsWith(prefix));
      data.push({
        mes: MESES[d.getMonth()],
        receita: movs.filter((m) => m.tipo === 'entrada').reduce((s, m) => s + m.valor, 0),
        custos: movs.filter((m) => m.tipo === 'saida').reduce((s, m) => s + m.valor, 0),
      });
    }
    return data;
  }, [movimentos, mes, ano]);

  const navigarMes = (dir: number) => {
    let novoMes = mes + dir;
    let novoAno = ano;
    if (novoMes < 0) { novoMes = 11; novoAno--; }
    if (novoMes > 11) { novoMes = 0; novoAno++; }
    setMes(novoMes); setAno(novoAno);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-fuchsia-600" />
          <h2 className="text-xl font-bold">Relatório Financeiro</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigarMes(-1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><span className="text-lg">‹</span></button>
          <span className="text-sm font-bold min-w-[120px] text-center">{MESES[mes]} {ano}</span>
          <button onClick={() => navigarMes(1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><span className="text-lg">›</span></button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Receita */}
        {(() => { const v = variacao(receitaMes, receitaAnt); return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="h-4 w-4 text-emerald-600" /><span className="text-xs font-bold text-slate-500">Receita</span></div>
          <p className="text-xl font-bold text-emerald-600">{formatMoney(receitaMes)}</p>
          {v !== null && <p className={`text-[11px] font-bold mt-1 ${v >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{v >= 0 ? '▲' : '▼'} {Math.abs(v).toFixed(1)}% vs mês ant.</p>}
        </div>
        ); })()}
        {/* Custos */}
        {(() => { const v = variacao(custosMes, custosAnt); return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2"><TrendingDown className="h-4 w-4 text-rose-600" /><span className="text-xs font-bold text-slate-500">Custos</span></div>
          <p className="text-xl font-bold text-rose-600">{formatMoney(custosMes)}</p>
          {v !== null && <p className={`text-[11px] font-bold mt-1 ${v <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{v >= 0 ? '▲' : '▼'} {Math.abs(v).toFixed(1)}% vs mês ant.</p>}
        </div>
        ); })()}
        {/* Lucro */}
        {(() => { const v = variacao(lucroMes, lucroAnt); return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-fuchsia-600" /><span className="text-xs font-bold text-slate-500">Lucro</span></div>
          <p className={`text-xl font-bold ${lucroMes >= 0 ? 'text-fuchsia-600' : 'text-rose-600'}`}>{formatMoney(lucroMes)}</p>
          {v !== null && <p className={`text-[11px] font-bold mt-1 ${v >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{v >= 0 ? '▲' : '▼'} {Math.abs(v).toFixed(1)}% vs mês ant.</p>}
        </div>
        ); })()}
        {/* Margem */}
        {(() => { const v = variacao(margemMes, margemAnt); return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2"><Percent className="h-4 w-4 text-blue-600" /><span className="text-xs font-bold text-slate-500">Margem</span></div>
          <p className={`text-xl font-bold ${margemMes >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>{margemMes.toFixed(1)}%</p>
          {v !== null && <p className={`text-[11px] font-bold mt-1 ${v >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{v >= 0 ? '▲' : '▼'} {Math.abs(Math.round(v))} p.p. vs mês ant.</p>}
        </div>
        ); })()}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-indigo-600" /><span className="text-xs font-bold text-slate-500">Agendamentos</span></div>
          <p className="text-xl font-bold text-indigo-600">{agendamentosMes.length}</p>
          <p className="text-[10px] text-slate-400">{concluidosMes.length} concluídos</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2"><Award className="h-4 w-4 text-emerald-600" /><span className="text-xs font-bold text-slate-500">Taxa Conclusão</span></div>
          <p className="text-xl font-bold text-emerald-600">{taxaConclusao.toFixed(0)}%</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2"><Users className="h-4 w-4 text-blue-600" /><span className="text-xs font-bold text-slate-500">Clientes Ativos</span></div>
          <p className="text-xl font-bold text-blue-600">{clientes.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="h-4 w-4 text-amber-600" /><span className="text-xs font-bold text-slate-500">Média/Dia útil</span></div>
          <p className="text-xl font-bold text-amber-600">{formatMoney(receitaMes / Math.max(diasUteisNoMes(ano, mes), 1))}</p>
          <p className="text-[10px] text-slate-400">{diasUteisNoMes(ano, mes)} dias úteis no mês</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm mb-4">Receita vs Custos (6 meses)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dataMensal}>
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} name="Receita" />
              <Bar dataKey="custos" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Custos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm mb-4">Formas de Pagamento</h3>
          {pagamentos.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum pagamento no período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pagamentos} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={80} label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}>
                  {pagamentos.map((_, i) => <Cell key={i} fill={CORES_PAG[i % CORES_PAG.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Scissors className="h-4 w-4 text-fuchsia-600" /> Top Serviços</h3>
          {servicosPorReceita.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhum serviço concluído no período.</p>
          ) : (
            <div className="space-y-3">
              {servicosPorReceita.map((s, i) => (
                <div key={s.nome} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5">{i + 1}º</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold truncate">{s.nome}</p>
                      <span className="text-xs font-bold text-emerald-600">{formatMoney(s.receita)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: `${(s.receita / servicosPorReceita[0].receita) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.qtd} vez(es)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /> Top Clientes</h3>
          {clientesTop.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhum cliente no período.</p>
          ) : (
            <div className="space-y-3">
              {clientesTop.map((c, i) => (
                <div key={c.nome} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.nome}</p>
                    <p className="text-[10px] text-slate-400">{c.qtd} visita(s) · {formatMoney(c.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><TrendingDown className="h-4 w-4 text-rose-600" /> Custos por Categoria</h3>
          {custosPorCategoria.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhum custo registrado no período.</p>
          ) : (
            <div className="space-y-3">
              {custosPorCategoria.map((c, i) => (
                <div key={c.nome} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CORES_CAT[i % CORES_CAT.length] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold">{c.nome}</p>
                      <span className="text-xs font-bold text-rose-600">{formatMoney(c.valor)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full" style={{ width: `${(c.valor / custosPorCategoria[0].valor) * 100}%`, backgroundColor: CORES_CAT[i % CORES_CAT.length] }} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                <span className="text-sm font-bold">Total Custos</span>
                <span className="text-sm font-bold text-rose-600">{formatMoney(custosMes)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4 text-amber-600" /> Resumo Financeiro</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <span className="text-sm font-semibold">Receita Total</span>
              <span className="text-sm font-bold text-emerald-600">{formatMoney(receitaMes)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
              <span className="text-sm font-semibold">Custos Totais</span>
              <span className="text-sm font-bold text-rose-600">{formatMoney(custosMes)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-xl">
              <span className="text-sm font-semibold">Lucro Líquido</span>
              <span className={`text-sm font-bold ${lucroMes >= 0 ? 'text-fuchsia-600' : 'text-rose-600'}`}>{formatMoney(lucroMes)}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Margem de Lucro</span>
                <span className={margemMes >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{margemMes.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Ticket Médio</span>
                <span>{formatMoney(concluidosMes.length > 0 ? receitaMes / concluidosMes.length : 0)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Custo por Serviço</span>
                <span>{formatMoney(concluidosMes.length > 0 ? custosMes / concluidosMes.length : 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
