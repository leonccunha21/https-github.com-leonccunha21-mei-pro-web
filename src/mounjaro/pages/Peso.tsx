import React, { useState, useMemo } from 'react';
import { Plus, Scale, TrendingDown } from 'lucide-react';
import { ClienteMounjaro, PesagemMounjaro, DoseMounjaro } from '../types';
import { Card, Button, Field, SelectField, Modal, Badge, StatCard } from '../ui';
import { newId } from '../localDb';
import {
  pesoAtual, pesoBase, pesoPerdido, perdaMediaPorDose, calcIMC, classificacaoIMC,
  formatarDataCurta, formatarMoeda, LogAuditoriaFn,
} from '../lib';

interface Props {
  clientes: ClienteMounjaro[];
  pesagens: PesagemMounjaro[];
  doses: DoseMounjaro[];
  setPesagens: (p: PesagemMounjaro[]) => void;
  logAuditoria: LogAuditoriaFn;
}

export default function Peso({ clientes, pesagens, doses, setPesagens, logAuditoria }: Props) {
  const [clienteSel, setClienteSel] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PesagemMounjaro>>({ peso: 0 });

  const clientesAtivos = clientes.filter((c) => c.ativo);
  const clienteId = clienteSel || clienteSel === '' ? clienteSel : (clientesAtivos[0]?.id ?? '');
  const cliente = clientes.find((c) => c.id === clienteId);

  const abrirNovo = (cid?: string) => {
    setEditandoId(null);
    setForm({ clienteId: cid || clienteId, data: new Date().toISOString().slice(0, 10), peso: 0 });
    setModalOpen(true);
  };

  const abrirEditar = (p: PesagemMounjaro) => {
    setEditandoId(p.id);
    setForm({ ...p });
    setModalOpen(true);
  };

  const salvar = () => {
    if (!form.clienteId || !form.data || !form.peso) return;
    const cli = clientes.find((c) => c.id === form.clienteId);
    if (editandoId) {
      const atualizada: PesagemMounjaro = { ...(pesagens.find((p) => p.id === editandoId) as PesagemMounjaro), ...form, peso: Number(form.peso) } as PesagemMounjaro;
      setPesagens(pesagens.map((p) => (p.id === editandoId ? atualizada : p)));
      logAuditoria({ entidade: 'pesagem', acao: 'editar', resumo: `Pesagem ${atualizada.peso} kg de ${cli?.nome || '—'}`, clienteId: form.clienteId, refId: editandoId });
    } else {
      const nova: PesagemMounjaro = {
        id: newId('peso'),
        clienteId: form.clienteId,
        data: form.data,
        peso: Number(form.peso),
        observacoes: form.observacoes,
        createdAt: new Date().toISOString(),
      };
      setPesagens([...pesagens, nova]);
      logAuditoria({ entidade: 'pesagem', acao: 'criar', resumo: `Pesagem ${nova.peso} kg de ${cli?.nome || '—'}`, clienteId: form.clienteId, refId: nova.id });
    }
    setModalOpen(false);
    setEditandoId(null);
  };

  const excluir = (p: PesagemMounjaro) => {
    if (!window.confirm('Excluir esta pesagem?')) return;
    const cli = clientes.find((c) => c.id === p.clienteId);
    setPesagens(pesagens.filter((x) => x.id !== p.id));
    logAuditoria({ entidade: 'pesagem', acao: 'excluir', resumo: `Pesagem ${p.peso} kg de ${cli?.nome || '—'}`, clienteId: p.clienteId, refId: p.id });
  };

  // Dados do gráfico para o cliente selecionado
  const serie = useMemo(() => {
    if (!clienteId) return [];
    return pesagens
      .filter((p) => p.clienteId === clienteId)
      .sort((a, b) => a.data.localeCompare(b.data));
  }, [pesagens, clienteId]);

  const svg = useMemo(() => buildChart(serie.map((s) => s.peso)), [serie]);

  if (clientesAtivos.length === 0) {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold">Controle de Peso</h2>
        <Card className="text-center text-slate-500 py-10">Cadastre um cliente ativo para registrar pesagens.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold">Controle de Peso</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Evolução e perda por dose</p>
        </div>
        <Button onClick={() => abrirNovo()} disabled={!clienteId}><Plus size={16} className="inline" /> Registrar pesagem</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {clientesAtivos.map((c) => (
          <button
            key={c.id}
            onClick={() => setClienteSel(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
              clienteId === c.id ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {c.nome}
          </button>
        ))}
      </div>

      {cliente && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="Peso atual" value={`${pesoAtual(cliente, pesagens, doses)} kg`} icon={<Scale size={18} />} accent="cyan" />
            <StatCard title="Peso base" value={`${pesoBase(cliente, pesagens, doses)} kg`} icon={<Scale size={18} />} accent="blue" />
            <StatCard title="Perda total" value={`${pesoPerdido(cliente, pesagens, doses)} kg`} icon={<TrendingDown size={18} />} accent="green" />
            <StatCard title="Média / dose" value={`${perdaMediaPorDose(cliente, pesagens, doses)} kg`} icon={<TrendingDown size={18} />} accent="violet" />
          </div>

          {/* IMC atual */}
          {cliente.alturaCm && pesoAtual(cliente, pesagens, doses) > 0 && (
            <Card>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm text-slate-500">IMC atual</p>
                  <p className="text-2xl font-bold">
                    {calcIMC(pesoAtual(cliente, pesagens, doses), cliente.alturaCm)}
                  </p>
                  <p className="text-xs text-slate-400">{classificacaoIMC(calcIMC(pesoAtual(cliente, pesagens, doses), cliente.alturaCm))}</p>
                </div>
                {cliente.objetivoPeso && (
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Meta</p>
                    <p className="text-xl font-bold text-emerald-600">{cliente.objetivoPeso} kg</p>
                    <p className="text-xs text-slate-400">
                      faltam {Math.max(0, pesoAtual(cliente, pesagens, doses) - cliente.objetivoPeso)} kg
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Gráfico de evolução */}
          <Card>
            <h3 className="font-semibold mb-3">Evolução do peso</h3>
            {serie.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma pesagem registrada para este cliente.</p>
            ) : (
              <div className="w-full">
                <svg viewBox="0 0 300 120" className="w-full h-40" preserveAspectRatio="none">
                  {svg}
                </svg>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>{serie[0] && formatarDataCurta(serie[0].data)}</span>
                  <span>{serie[serie.length - 1] && formatarDataCurta(serie[serie.length - 1].data)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Histórico */}
          <Card>
            <h3 className="font-semibold mb-2">Histórico de pesagens</h3>
            <div className="space-y-2">
              {serie.slice().reverse().map((p) => (
                <div key={p.id} className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-2 first:border-0">
                  <div>
                    <p className="font-medium">{p.peso} kg</p>
                    <p className="text-xs text-slate-400">{formatarDataCurta(p.data)}{p.observacoes ? ` · ${p.observacoes}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => abrirEditar(p)} className="text-cyan-600 hover:text-cyan-800 text-sm" title="Editar">✎</button>
                    <button onClick={() => excluir(p)} className="text-rose-500 text-sm">✕</button>
                  </div>
                </div>
              ))}
              {serie.length === 0 && <p className="text-sm text-slate-500">Sem registros.</p>}
            </div>
          </Card>
        </>
      )}

      <Modal
        open={modalOpen}
        title={editandoId ? 'Editar pesagem' : 'Registrar pesagem'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={salvar}>Salvar</Button>
          </>
        }
      >
        <SelectField label="Cliente" value={form.clienteId || clienteId} onChange={(v) => setForm({ ...form, clienteId: v })}
          options={clientesAtivos.map((c) => ({ value: c.id, label: c.nome }))} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data" type="date" value={form.data || ''} onChange={(v) => setForm({ ...form, data: v })} />
          <Field label="Peso (kg)" type="number" value={form.peso || ''} onChange={(v) => setForm({ ...form, peso: Number(v) })} required />
        </div>
        <Field label="Observações" value={form.observacoes || ''} onChange={(v) => setForm({ ...form, observacoes: v })} />
      </Modal>
    </div>
  );
}

// Gera um polyline SVG simples da evolução de peso.
function buildChart(valores: number[]): React.ReactNode {
  if (valores.length < 2) {
    if (valores.length === 1) {
      return <circle cx={150} cy={60} r={4} className="fill-cyan-500" />;
    }
    return null;
  }
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const range = max - min || 1;
  const w = 300, h = 120, pad = 10;
  const pts = valores.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (valores.length - 1);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;
  return (
    <>
      <path d={area} className="fill-cyan-500/15" />
      <path d={path} className="stroke-cyan-500" strokeWidth={2} fill="none" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={2.5} className="fill-cyan-500" />)}
    </>
  );
}
