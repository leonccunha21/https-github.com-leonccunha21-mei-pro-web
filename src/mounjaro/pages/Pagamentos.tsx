import React, { useState, useMemo } from 'react';
import { Plus, Wallet, Search, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { ClienteMounjaro, PagamentoMounjaro, DoseMounjaro } from '../types';
import { Card, Button, Field, SelectField, TextArea, Modal, Badge, StatCard } from '../ui';
import { newId } from '../localDb';
import { calcularScore, formatarMoeda, formatarDataCurta, diasEntre } from '../lib';

interface Props {
  clientes: ClienteMounjaro[];
  pagamentos: PagamentoMounjaro[];
  doses: DoseMounjaro[];
  setPagamentos: (p: PagamentoMounjaro[]) => void;
  setDoses: (d: DoseMounjaro[]) => void;
}

export default function Pagamentos({ clientes, pagamentos, doses, setPagamentos, setDoses }: Props) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'aberto' | 'pago'>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<PagamentoMounjaro>>({});

  const clientesAtivos = clientes.filter((c) => c.ativo);
  const nomeCliente = (id: string) => clientes.find((c) => c.id === id)?.nome || 'Desconhecido';

  const abrirNovo = (clientePre?: ClienteMounjaro) => {
    const ultimaDoseNaoPaga = clientePre
      ? doses.filter((d) => d.clienteId === clientePre.id && !d.pago).sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))[0]
      : undefined;
    setForm({
      clienteId: clientePre?.id,
      dataVencimento: new Date().toISOString().slice(0, 10),
      descricao: ultimaDoseNaoPaga ? `Dose ${ultimaDoseNaoPaga.dose} mg` : '',
      valor: ultimaDoseNaoPaga?.valorDose || 0,
      status: 'pendente',
      referenciaDoseId: ultimaDoseNaoPaga?.id,
    });
    setModalOpen(true);
  };

  const salvar = () => {
    if (!form.clienteId || !form.dataVencimento || !form.valor) return;
    const novo: PagamentoMounjaro = {
      id: newId('pag'),
      clienteId: form.clienteId,
      dataVencimento: form.dataVencimento,
      dataPagamento: form.status === 'pago' ? (form.dataPagamento || new Date().toISOString().slice(0, 10)) : undefined,
      descricao: form.descricao || '',
      valor: Number(form.valor),
      status: form.status || 'pendente',
      metodo: form.metodo,
      referenciaDoseId: form.referenciaDoseId,
      observacoes: form.observacoes,
      createdAt: new Date().toISOString(),
    };
    setPagamentos([novo, ...pagamentos]);

    // Marca a dose vinculada como paga
    if (novo.referenciaDoseId && novo.status === 'pago') {
      setDoses(doses.map((d) => (d.id === novo.referenciaDoseId ? { ...d, pago: true } : d)));
    }
    setModalOpen(false);
  };

  const marcarPago = (p: PagamentoMounjaro) => {
    const atualizado: PagamentoMounjaro = {
      ...p,
      status: 'pago',
      dataPagamento: new Date().toISOString().slice(0, 10),
    };
    setPagamentos(pagamentos.map((x) => (x.id === p.id ? atualizado : x)));
    if (p.referenciaDoseId) {
      setDoses(doses.map((d) => (d.id === p.referenciaDoseId ? { ...d, pago: true } : d)));
    }
  };

  const excluir = (p: PagamentoMounjaro) => {
    if (!window.confirm('Excluir este registro de pagamento?')) return;
    setPagamentos(pagamentos.filter((x) => x.id !== p.id));
  };

  const resumo = useMemo(() => {
    const pago = pagamentos.filter((p) => p.status === 'pago').reduce((a, p) => a + p.valor, 0);
    const pendente = pagamentos.filter((p) => p.status === 'pendente').reduce((a, p) => a + p.valor, 0);
    const atrasado = pagamentos.filter((p) => p.status === 'atrasado').reduce((a, p) => a + p.valor, 0);
    const hoje = new Date().toISOString().slice(0, 10);
    const vencidos = pagamentos.filter((p) => (p.status === 'pendente' || p.status === 'atrasado') && p.dataVencimento < hoje);
    return { pago, pendente, atrasado, vencidos, total: pago + pendente + atrasado };
  }, [pagamentos]);

  // Scores
  const scores = useMemo(
    () => clientes.map((c) => ({ cliente: c, score: calcularScore(c.id, pagamentos) }))
      .filter((s) => s.cliente.ativo)
      .sort((a, b) => a.score.pontuacao - b.score.pontuacao),
    [clientes, pagamentos]
  );

  const filtrados = useMemo(() => {
    const b = busca.toLowerCase();
    const hoje = new Date().toISOString().slice(0, 10);
    return pagamentos
      .filter((p) => !b || nomeCliente(p.clienteId).toLowerCase().includes(b))
      .filter((p) => {
        if (filtroStatus === 'todos') return true;
        if (filtroStatus === 'pago') return p.status === 'pago';
        return p.status === 'pendente' || p.status === 'atrasado';
      })
      .sort((a, b) => b.dataVencimento.localeCompare(a.dataVencimento));
  }, [pagamentos, busca, filtroStatus, clientes]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold">Pagamentos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Controle financeiro e score de pagamento</p>
        </div>
        <Button onClick={() => abrirNovo()} disabled={clientesAtivos.length === 0}><Plus size={16} className="inline" /> Novo pagamento</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Recebido" value={formatarMoeda(resumo.pago)} icon={<CheckCircle2 size={18} />} accent="green" />
        <StatCard title="Pendente" value={formatarMoeda(resumo.pendente)} icon={<Clock size={18} />} accent="amber" />
        <StatCard title="Atrasado" value={formatarMoeda(resumo.atrasado)} icon={<AlertTriangle size={18} />} accent="red" />
        <StatCard title="Em aberto" value={formatarMoeda(resumo.pendente + resumo.atrasado)} icon={<Wallet size={18} />} accent="cyan"
          hint={`${resumo.vencidos.length} vencido(s)`} />
      </div>

      {/* Score de pagamento */}
      <Card>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Wallet size={18} className="text-emerald-600" /> Score de pagamento dos clientes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {scores.map(({ cliente, score }) => (
            <div key={cliente.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{cliente.nome}</p>
                <p className="text-xs text-slate-400">
                  {score.pagamentosEmDia} em dia · {score.pagamentosAtrasados} atraso
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{score.pontuacao}</p>
                {score.classificacao === 'excelente' && <Badge tone="green">excelente</Badge>}
                {score.classificacao === 'bom' && <Badge tone="cyan">bom</Badge>}
                {score.classificacao === 'regular' && <Badge tone="amber">regular</Badge>}
                {score.classificacao === 'ruim' && <Badge tone="red">ruim</Badge>}
              </div>
            </div>
          ))}
          {scores.length === 0 && <p className="text-sm text-slate-500 col-span-full">Sem clientes ativos.</p>}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="flex gap-1">
          {(['todos', 'aberto', 'pago'] as const).map((f) => (
            <button key={f} onClick={() => setFiltroStatus(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                filtroStatus === f ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
              {f === 'todos' ? 'Todos' : f === 'aberto' ? 'Em aberto' : 'Pagos'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtrados.map((p) => {
          const vencido = p.status !== 'pago' && p.dataVencimento < new Date().toISOString().slice(0, 10);
          return (
            <Card key={p.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl ${vencido || p.status === 'atrasado' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'}`}>
                  <Wallet size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{nomeCliente(p.clienteId)}</p>
                  <p className="text-xs text-slate-500">{p.descricao || 'Pagamento'}</p>
                  <p className="text-xs text-slate-400">Venc: {formatarDataCurta(p.dataVencimento)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="font-semibold">{formatarMoeda(p.valor)}</p>
                  {p.status === 'pago' && <Badge tone="green">pago</Badge>}
                  {p.status === 'pendente' && !vencido && <Badge tone="amber">pendente</Badge>}
                  {(p.status === 'atrasado' || vencido) && <Badge tone="red">atrasado</Badge>}
                  {p.status === 'cancelado' && <Badge tone="slate">cancelado</Badge>}
                </div>
                {p.status !== 'pago' && p.status !== 'cancelado' && (
                  <button onClick={() => marcarPago(p)} className="text-emerald-600 hover:text-emerald-700 text-xs font-medium">pagar</button>
                )}
                <button onClick={() => excluir(p)} className="text-rose-500 text-sm">✕</button>
              </div>
            </Card>
          );
        })}
        {filtrados.length === 0 && <Card className="text-center text-slate-500 py-10">Nenhum pagamento encontrado.</Card>}
      </div>

      <Modal
        open={modalOpen}
        title="Novo pagamento"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={salvar}>Salvar</Button>
          </>
        }
      >
        <SelectField label="Cliente" value={form.clienteId || ''} onChange={(v) => setForm({ ...form, clienteId: v })}
          options={[{ value: '', label: 'Selecione...' }, ...clientesAtivos.map((c) => ({ value: c.id, label: c.nome }))]} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vencimento" type="date" value={form.dataVencimento || ''} onChange={(v) => setForm({ ...form, dataVencimento: v })} required />
          <Field label="Valor (R$)" type="number" value={form.valor || ''} onChange={(v) => setForm({ ...form, valor: Number(v) })} required />
        </div>
        <Field label="Descrição" value={form.descricao || ''} onChange={(v) => setForm({ ...form, descricao: v })} />
        <SelectField label="Status" value={form.status || 'pendente'} onChange={(v) => setForm({ ...form, status: v as any })}
          options={[
            { value: 'pendente', label: 'Pendente' },
            { value: 'pago', label: 'Pago' },
            { value: 'atrasado', label: 'Atrasado' },
            { value: 'cancelado', label: 'Cancelado' },
          ]} />
        <SelectField label="Forma de pagamento" value={form.metodo || ''} onChange={(v) => setForm({ ...form, metodo: v as any })}
          options={[
            { value: '', label: '—' },
            { value: 'pix', label: 'PIX' },
            { value: 'dinheiro', label: 'Dinheiro' },
            { value: 'cartao_credito', label: 'Cartão de crédito' },
            { value: 'cartao_debito', label: 'Cartão de débito' },
            { value: 'transferencia', label: 'Transferência' },
          ]} />
        <TextArea label="Observações" value={form.observacoes || ''} onChange={(v) => setForm({ ...form, observacoes: v })} />
      </Modal>
    </div>
  );
}
