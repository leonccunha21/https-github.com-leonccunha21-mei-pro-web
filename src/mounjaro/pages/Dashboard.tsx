import React, { useMemo, useEffect } from 'react';
import { Users, Syringe, Scale, Wallet, TrendingDown, AlertTriangle, CheckCircle2, Clock, MessageCircle, Bell } from 'lucide-react';
import { MounjaroDb } from '../types';
import { StatCard, Card, Badge } from '../ui';
import {
  calcularScore, pesoAtual, pesoPerdido, statusDose, proximaDose, formatarMoeda, formatarDataCurta,
  lembrarDoses, cobrancasPendentes, linkWhatsapp, mensagemLembreteDose, mensagemCobranca,
} from '../lib';
import type { Tab } from '../App';

export default function Dashboard({ db, onNavigate }: { db: MounjaroDb; onNavigate: (t: Tab) => void }) {
  const { clientes, doses, pesagens, pagamentos } = db;
  const configClinica = db.config?.nomeClinica || undefined;

  const abrirWhatsapp = (telefone: string | undefined, msg: string) => {
    const url = linkWhatsapp(telefone, msg);
    if (!url) { alert('Paciente sem telefone cadastrado para envio de lembrete.'); return; }
    window.open(url, '_blank');
  };

  const metricas = useMemo(() => {
    const ativos = clientes.filter((c) => c.ativo);
    const totalDoses = doses.length;
    const pesoTotalPerdido = ativos.reduce((acc, c) => acc + pesoPerdido(c, pesagens, doses), 0);
    const valorEmAberto = pagamentos
      .filter((p) => p.status === 'pendente' || p.status === 'atrasado')
      .reduce((acc, p) => acc + p.valor, 0);
    const valorPago = pagamentos.filter((p) => p.status === 'pago').reduce((acc, p) => acc + p.valor, 0);

    // Doses vencidas / vencem hoje
    const hoje = new Date().toISOString().slice(0, 10);
    const alertas = ativos.map((c) => {
      const ultima = doses
        .filter((d) => d.clienteId === c.id)
        .sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))[0];
      if (!ultima) return null;
      const st = statusDose(ultima.dataAplicacao, ultima.intervaloDias);
      return { cliente: c, ultima, st, prox: proximaDose(ultima) };
    }).filter(Boolean) as { cliente: typeof clientes[number]; ultima: typeof doses[number]; st: ReturnType<typeof statusDose>; prox: string | null }[];

    const vencidas = alertas.filter((a) => a.st.status === 'atrasada');
    const venceHoje = alertas.filter((a) => a.st.status === 'hoje');

    return { ativos, totalDoses, pesoTotalPerdido, valorEmAberto, valorPago, vencidas, venceHoje, alertas };
  }, [clientes, doses, pesagens, pagamentos]);

  const scores = useMemo(
    () => clientes.map((c) => ({ cliente: c, score: calcularScore(c.id, pagamentos) })),
    [clientes, pagamentos]
  );

  const piorScore = useMemo(
    () => scores.filter((s) => s.cliente.ativo).sort((a, b) => a.score.pontuacao - b.score.pontuacao)[0],
    [scores]
  );

  const lembretes = useMemo(() => lembrarDoses(clientes, doses), [clientes, doses]);
  const lembretesUrgentes = lembretes.filter((l) => l.status === 'atrasada' || l.status === 'hoje' || l.status === 'amanha');

  const cobrancas = useMemo(() => cobrancasPendentes(clientes, pagamentos), [clientes, pagamentos]);
  const cobrancasUrgentes = cobrancas.filter((c) => c.vencida || c.dias <= 3);

  // Notificação do navegador ao montar (uma vez por sessão — deps intencionalmente vazias).
  // Usa ref para garantir que só dispara uma vez mesmo com re-renders do componente pai.
  const notifiedRef = React.useRef(false);
  useEffect(() => {
    if (notifiedRef.current) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    const atrasadas = lembretes.filter((l) => l.status === 'atrasada').length;
    const vencidas = cobrancas.filter((c) => c.vencida).length;
    if (atrasadas > 0) {
      new Notification('Saúde PRO', { body: `${atrasadas} dose(s) de aplicação em atraso.` });
    }
    if (vencidas > 0) {
      new Notification('Saúde PRO', { body: `${vencidas} cobrança(s) vencida(s).` });
    }
    notifiedRef.current = true;
  }, [lembretes, cobrancas]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Painel de Controle</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Visão geral do acompanhamento de tirzepatida</p>
      </div>

      {/* Lembretes de dose (banner proativo) */}
      {lembretesUrgentes.length > 0 && (
        <div className="space-y-2">
          {lembretesUrgentes.slice(0, 5).map((l) => {
            const tom = l.status === 'atrasada' ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30'
              : l.status === 'hoje' ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30'
              : 'border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-950/30';
            const txt = l.status === 'atrasada' ? `${Math.abs(l.diasRestantes)} dia(s) de atraso`
              : l.status === 'hoje' ? 'vence hoje' : 'vence amanhã';
            return (
              <div key={l.cliente.id} className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${tom}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <Clock size={16} className="shrink-0" />
                  <span className="text-sm font-medium truncate">{l.cliente.nome}</span>
                  <span className="text-xs opacity-80">{txt}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button onClick={() => abrirWhatsapp(l.cliente.telefone, mensagemLembreteDose(l.cliente, l.proxima, l.status, configClinica))}
                    title="Avisar paciente no WhatsApp" className="text-cyan-700 dark:text-cyan-300 hover:scale-110 transition">
                    <MessageCircle size={16} />
                  </button>
                  <button onClick={() => onNavigate('doses')} className="text-xs font-semibold underline">
                    registrar dose
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lembretes de cobrança (banner proativo) */}
      {cobrancasUrgentes.length > 0 && (
        <div className="space-y-2">
          {cobrancasUrgentes.slice(0, 5).map((c) => {
            const tom = c.vencida ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30'
              : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30';
            const txt = c.vencida ? `${Math.abs(c.dias)} dia(s) em atraso` : `vence em ${c.dias} dia(s)`;
            return (
              <div key={c.pagamento.id} className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${tom}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <Wallet size={16} className="shrink-0" />
                  <span className="text-sm font-medium truncate">{c.cliente.nome}</span>
                  <span className="text-xs opacity-80">{formatarMoeda(c.pagamento.valor)} · {txt}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button onClick={() => abrirWhatsapp(c.cliente.telefone, mensagemCobranca(c, configClinica))}
                    title="Avisar paciente no WhatsApp" className="text-cyan-700 dark:text-cyan-300 hover:scale-110 transition">
                    <MessageCircle size={16} />
                  </button>
                  <button onClick={() => onNavigate('pagamentos')} className="text-xs font-semibold underline">
                    ver
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Ativos" title="Clientes" value={metricas.ativos.length}
          icon={<Users size={20} />} accent="cyan" onClick={() => onNavigate('clientes')} />
        <StatCard label="Registradas" title="Doses" value={metricas.totalDoses}
          icon={<Syringe size={20} />} accent="violet" onClick={() => onNavigate('doses')} />
        <StatCard label="Total acumulado" title="Peso perdido" value={`${metricas.pesoTotalPerdido.toFixed(1)} kg`}
          icon={<TrendingDown size={20} />} accent="green" onClick={() => onNavigate('peso')} />
        <StatCard label="Em aberto" title="A receber" value={formatarMoeda(metricas.valorEmAberto)}
          icon={<Wallet size={20} />} accent="amber" onClick={() => onNavigate('pagamentos')} />
      </div>

      {/* Alertas de dose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className={metricas.vencidas.length > 0 ? 'border-rose-300 dark:border-rose-700' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-rose-600" />
            <h3 className="font-semibold">Doses atrasadas ({metricas.vencidas.length})</h3>
          </div>
          {metricas.vencidas.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma dose em atraso. 👍</p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {metricas.vencidas.map((a) => (
                <li key={a.cliente.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{a.cliente.nome}</span>
                  <Badge tone="red">{Math.abs(a.st.diasRestantes)}d atraso</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className={metricas.venceHoje.length > 0 ? 'border-amber-300 dark:border-amber-700' : ''}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-amber-600" />
            <h3 className="font-semibold">Vencem hoje ({metricas.venceHoje.length})</h3>
          </div>
          {metricas.venceHoje.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma aplicação para hoje.</p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {metricas.venceHoje.map((a) => (
                <li key={a.cliente.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{a.cliente.nome} · {a.ultima.dose} mg</span>
                  <Badge tone="amber">hoje</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Próximas doses */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Syringe size={18} className="text-violet-600" />
          <h3 className="font-semibold">Próximas aplicações</h3>
        </div>
        {metricas.alertas.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma dose registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 dark:text-slate-400 text-left">
                <tr>
                  <th className="py-2 pr-2">Cliente</th>
                  <th className="py-2 pr-2">Última dose</th>
                  <th className="py-2 pr-2">Próxima</th>
                  <th className="py-2 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...metricas.alertas]
                  .sort((a, b) => (a.prox || '').localeCompare(b.prox || ''))
                  .slice(0, 8)
                  .map((a) => (
                    <tr key={a.cliente.id} className="border-t border-slate-100 dark:border-slate-700">
                      <td className="py-2 pr-2 font-medium truncate max-w-[140px]">{a.cliente.nome}</td>
                      <td className="py-2 pr-2">{a.ultima.dose} mg <span className="text-slate-400">({formatarDataCurta(a.ultima.dataAplicacao)})</span></td>
                      <td className="py-2 pr-2">{a.prox ? formatarDataCurta(a.prox) : '-'}</td>
                      <td className="py-2 pr-2">
                        {a.st.status === 'atrasada' && <Badge tone="red">atrasada</Badge>}
                        {a.st.status === 'hoje' && <Badge tone="amber">hoje</Badge>}
                        {a.st.status === 'ok' && <Badge tone="green">{a.st.diasRestantes}d</Badge>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Taxa de adesão */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <h3 className="font-semibold">Taxa de Adesão</h3>
        </div>
        {metricas.ativos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum cliente ativo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 dark:text-slate-400 text-left">
                <tr>
                  <th className="py-2 pr-2">Cliente</th>
                  <th className="py-2 pr-2">Doses no prazo</th>
                  <th className="py-2 pr-2">Atrasadas</th>
                  <th className="py-2 pr-2">Adesão</th>
                </tr>
              </thead>
              <tbody>
                {metricas.ativos.map((cli) => {
                  const dosesCli = doses.filter((d) => d.clienteId === cli.id);
                  const total = dosesCli.length;
                  if (total === 0) return null;
                  const noPrazo = dosesCli.filter((d) => {
                    const ordem = [...dosesCli].sort((a, b) => a.dataAplicacao.localeCompare(b.dataAplicacao));
                    const idx = ordem.findIndex((o) => o.id === d.id);
                    if (idx === 0) return true;
                    const ant = ordem[idx - 1];
                    const diff = (new Date(d.dataAplicacao).getTime() - new Date(ant.dataAplicacao).getTime()) / 86400000;
                    return diff <= ant.intervaloDias + 2;
                  }).length;
                  const adesao = Math.round((noPrazo / total) * 100);
                  const cor = adesao >= 80 ? 'text-emerald-600' : adesao >= 60 ? 'text-amber-600' : 'text-rose-600';
                  return (
                    <tr key={cli.id} className="border-t border-slate-100 dark:border-slate-700">
                      <td className="py-2 pr-2 font-medium truncate max-w-[140px]">{cli.nome}</td>
                      <td className="py-2 pr-2">{noPrazo}/{total}</td>
                      <td className="py-2 pr-2">{total - noPrazo}</td>
                      <td className={`py-2 pr-2 font-bold ${cor}`}>{adesao}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Score de pagamento */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} className="text-emerald-600" />
          <h3 className="font-semibold">Score de pagamento dos clientes</h3>
        </div>
        {scores.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum cliente cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 dark:text-slate-400 text-left">
                <tr>
                  <th className="py-2 pr-2">Cliente</th>
                  <th className="py-2 pr-2">Score</th>
                  <th className="py-2 pr-2">Em dia</th>
                  <th className="py-2 pr-2">Atrasados</th>
                  <th className="py-2 pr-2">Aberto</th>
                </tr>
              </thead>
              <tbody>
                {scores.sort((a, b) => b.score.pontuacao - a.score.pontuacao).map(({ cliente, score }) => (
                  <tr key={cliente.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-2 pr-2 font-medium truncate max-w-[140px]">{cliente.nome}</td>
                    <td className="py-2 pr-2">
                      <span className="font-bold">{score.pontuacao}</span>
                      <span className="text-xs ml-1">
                        {score.classificacao === 'excelente' && <Badge tone="green">excelente</Badge>}
                        {score.classificacao === 'bom' && <Badge tone="cyan">bom</Badge>}
                        {score.classificacao === 'regular' && <Badge tone="amber">regular</Badge>}
                        {score.classificacao === 'ruim' && <Badge tone="red">ruim</Badge>}
                      </span>
                    </td>
                    <td className="py-2 pr-2">{score.pagamentosEmDia}</td>
                    <td className="py-2 pr-2">{score.pagamentosAtrasados}</td>
                    <td className="py-2 pr-2">{formatarMoeda(score.valorEmAberto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {piorScore && piorScore.score.pontuacao < 65 && (
          <p className="mt-2 text-xs text-rose-600 flex items-center gap-1">
            <AlertTriangle size={14} /> Atenção: {piorScore.cliente.nome} tem o menor score ({piorScore.score.pontuacao}).
          </p>
        )}
      </Card>
    </div>
  );
}
