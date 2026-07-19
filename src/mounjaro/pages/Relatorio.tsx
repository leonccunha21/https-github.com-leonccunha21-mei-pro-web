import React, { useMemo, useState } from 'react';
import { FileText, Printer, Download } from 'lucide-react';
import { ClienteMounjaro, DoseMounjaro, PagamentoMounjaro, PesagemMounjaro, ConfigMounjaro } from '../types';
import { Card, Button, SelectField, StatCard } from '../ui';
import { pesoAtual, pesoPerdido, formatarDataCurta, formatarMoeda, calcularScore } from '../lib';

function calcularImc(peso: number, alturaCm?: number): number {
  if (!peso || !alturaCm) return 0;
  const m = alturaCm / 100;
  return Math.round((peso / (m * m)) * 10) / 10;
}

interface Props {
  clientes: ClienteMounjaro[];
  pesagens: PesagemMounjaro[];
  doses: DoseMounjaro[];
  pagamentos: PagamentoMounjaro[];
  config: ConfigMounjaro;
}

function gerarRelatorio(cliente: ClienteMounjaro, pesagens: PesagemMounjaro[], doses: DoseMounjaro[], pagamentos: PagamentoMounjaro[]) {
  const p = pesagens
    .filter((x) => x.clienteId === cliente.id)
    .sort((a, b) => a.data.localeCompare(b.data));
  const d = doses
    .filter((x) => x.clienteId === cliente.id)
    .sort((a, b) => a.dataAplicacao.localeCompare(b.dataAplicacao));
  const pg = pagamentos
    .filter((x) => x.clienteId === cliente.id)
    .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento));
  const score = calcularScore(cliente.id, pagamentos);

  const totalPago = pg.filter((x) => x.status === 'pago').reduce((s, x) => s + x.valor, 0);
  const totalAberto = pg.filter((x) => x.status !== 'pago' && x.status !== 'cancelado').reduce((s, x) => s + x.valor, 0);
  const receitaDoses = d.filter((x) => x.pago && x.valorDose).reduce((s, x) => s + (x.valorDose || 0), 0);

  return { pesagens: p, doses: d, pagamentos: pg, score, totalPago, totalAberto, receitaDoses };
}

export default function Relatorio({ clientes, pesagens, doses, pagamentos, config }: Props) {
  const [clienteId, setClienteId] = useState('');
  const ativos = clientes.filter((c) => c.ativo);

  const cliente = useMemo(() => clientes.find((c) => c.id === clienteId), [clientes, clienteId]);
  const rel = useMemo(() => (cliente ? gerarRelatorio(cliente, pesagens, doses, pagamentos) : null), [cliente, pesagens, doses, pagamentos]);

  const imprimir = () => window.print();

  const exportarJson = () => {
    if (!cliente || !rel) return;
    const blob = new Blob([JSON.stringify({ cliente, ...rel }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${cliente.nome.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><FileText size={20} /> Relatório por paciente</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Resumo de evolução de peso e financeiro — imprimível ou exportável</p>
        </div>
        {cliente && (
          <div className="flex gap-2 print:hidden">
            <Button variant="ghost" onClick={exportarJson}><Download size={16} /> JSON</Button>
            <Button onClick={imprimir}><Printer size={16} /> Imprimir / PDF</Button>
          </div>
        )}
      </div>

      <Card className="print:shadow-none">
        <SelectField label="Selecione o paciente" value={clienteId} onChange={setClienteId}
          options={[{ value: '', label: 'Selecione...' }, ...clientes.map((c) => ({ value: c.id, label: `${c.nome}${c.ativo ? '' : ' (inativo)'}` }))]} />
      </Card>

      {!cliente && (
        <Card className="text-center text-slate-500 py-10 print:hidden">Escolha um paciente para gerar o relatório.</Card>
      )}

      {cliente && rel && (
        <div className="space-y-5">
          {/* Cabeçalho do relatório */}
          <Card className="print:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                {config.logo && <img src={config.logo} alt="logo" className="w-12 h-12 object-contain shrink-0" />}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">{config.nomeClinica || 'Mounjaro PRO'}</p>
                  <h3 className="text-lg font-bold truncate">{cliente.nome}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cliente.telefone || '—'} · {cliente.cidade ? `${cliente.cidade}/${cliente.estado || ''}` : '—'}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-slate-400 shrink-0">
                Emitido em {formatarDataCurta(new Date().toISOString().slice(0, 10))}<br />
                {config.profissional ? `Dr(a). ${config.profissional}` : 'Mounjaro PRO'}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><span className="text-slate-500 dark:text-slate-400">Início</span><div className="font-semibold">{cliente.dataInicioTratamento ? formatarDataCurta(cliente.dataInicioTratamento) : '—'}</div></div>
              <div><span className="text-slate-500 dark:text-slate-400">Altura</span><div className="font-semibold">{cliente.alturaCm ? `${cliente.alturaCm} cm` : '—'}</div></div>
              <div><span className="text-slate-500 dark:text-slate-400">Peso inicial</span><div className="font-semibold">{cliente.pesoInicial ? `${cliente.pesoInicial} kg` : '—'}</div></div>
              <div><span className="text-slate-500 dark:text-slate-400">IMC inicial</span><div className="font-semibold">{cliente.imcInicial ? calcularImc(cliente.pesoInicial || 0, cliente.alturaCm || 0).toFixed(1) : '—'}</div></div>
              <div><span className="text-slate-500 dark:text-slate-400">Peso atual</span><div className="font-semibold">{pesoAtual(cliente, pesagens, doses) ? `${pesoAtual(cliente, pesagens, doses)} kg` : '—'}</div></div>
              <div><span className="text-slate-500 dark:text-slate-400">Perda total</span><div className="font-semibold text-emerald-600">{pesoPerdido(cliente, pesagens, doses) ? `${pesoPerdido(cliente, pesagens, doses).toFixed(1)} kg` : '—'}</div></div>
              <div><span className="text-slate-500 dark:text-slate-400">Objetivo</span><div className="font-semibold">{cliente.objetivoPeso ? `${cliente.objetivoPeso} kg` : '—'}</div></div>
              <div><span className="text-slate-500 dark:text-slate-400">Médico</span><div className="font-semibold">{cliente.medicoResponsavel || '—'}</div></div>
            </div>
          </Card>

          {/* Resumo financeiro */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <StatCard title="Total recebido" value={formatarMoeda(rel.totalPago)} accent="green" />
            <StatCard title="Em aberto" value={formatarMoeda(rel.totalAberto)} accent="amber" />
            <StatCard title="Receita de doses" value={formatarMoeda(rel.receitaDoses)} accent="cyan" />
            <StatCard title="Score pagamento" value={`${rel.score.pontuacao}`} accent={rel.score.pontuacao >= 70 ? 'green' : rel.score.pontuacao >= 40 ? 'amber' : 'red'} />
          </div>

          {/* Evolução de peso */}
          <Card className="print:shadow-none">
            <h4 className="font-bold mb-2">Evolução de peso</h4>
            {rel.pesagens.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Nenhuma pesagem registrada.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-1.5">Data</th><th>Peso (kg)</th><th>Δ (kg)</th><th>IMC</th>
                  </tr>
                </thead>
                <tbody>
                  {rel.pesagens.map((x, i) => {
                    const prev = i > 0 ? rel.pesagens[i - 1].peso : cliente.pesoInicial;
                    const delta = prev != null ? x.peso - prev : null;
                    const imc = cliente.alturaCm ? calcularImc(x.peso, cliente.alturaCm) : null;
                    return (
                      <tr key={x.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-1.5">{formatarDataCurta(x.data)}</td>
                        <td>{x.peso.toFixed(1)}</td>
                        <td className={delta != null && delta < 0 ? 'text-emerald-600' : 'text-rose-500'}>{delta != null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}` : '—'}</td>
                        <td>{imc ? imc.toFixed(1) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>

          {/* Doses aplicadas */}
          <Card className="print:shadow-none">
            <h4 className="font-bold mb-2">Doses aplicadas ({rel.doses.length})</h4>
            {rel.doses.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Nenhuma dose registrada.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-1.5">Data</th><th>Dose (mg)</th><th>Intervalo</th><th>Local</th><th>Pago</th><th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {rel.doses.map((x) => (
                    <tr key={x.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5">{formatarDataCurta(x.dataAplicacao)}</td>
                      <td>{x.dose}</td>
                      <td>{x.intervaloDias} d</td>
                      <td className="capitalize">{x.localAplicacao || '—'}</td>
                      <td>{x.pago ? '✓' : '—'}</td>
                      <td>{x.valorDose ? formatarMoeda(x.valorDose) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Financeiro */}
          <Card className="print:shadow-none">
            <h4 className="font-bold mb-2">Financeiro ({rel.pagamentos.length})</h4>
            {rel.pagamentos.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Nenhum pagamento registrado.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-1.5">Vencimento</th><th>Descrição</th><th>Valor</th><th>Status</th><th>Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {rel.pagamentos.map((x) => (
                    <tr key={x.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-1.5">{formatarDataCurta(x.dataVencimento)}</td>
                      <td>{x.descricao}</td>
                      <td>{formatarMoeda(x.valor)}</td>
                      <td className="capitalize">{x.status}</td>
                      <td>{x.dataPagamento ? formatarDataCurta(x.dataPagamento) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
