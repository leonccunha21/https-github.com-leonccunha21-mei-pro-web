import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Syringe, Search, CalendarClock } from 'lucide-react';
import { ClienteMounjaro, DoseMounjaro, PagamentoMounjaro } from '../types';
import { Card, Button, Field, SelectField, TextArea, Modal, Badge } from '../ui';
import { newId } from '../localDb';
import { DOSES_DISPONIVEIS, formatarDataCurta, formatarMoeda, proximaDose, statusDose, diasEntre, sugerirProximaDose, LogAuditoriaFn } from '../lib';

interface Props {
  clientes: ClienteMounjaro[];
  doses: DoseMounjaro[];
  pagamentos: PagamentoMounjaro[];
  setDoses: (d: DoseMounjaro[]) => void;
  setPagamentos: (p: PagamentoMounjaro[]) => void;
  setDbAtomico: (patch: { doses?: DoseMounjaro[]; pagamentos?: PagamentoMounjaro[] }) => void;
  logAuditoria: LogAuditoriaFn;
}

export default function Doses({ clientes, doses, pagamentos, setDoses, setPagamentos, setDbAtomico, logAuditoria }: Props) {
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<DoseMounjaro>>({});

  const clientesAtivos = clientes.filter((c) => c.ativo);

  const abrirNovo = (clientePre?: ClienteMounjaro) => {
    const ultima = clientePre
      ? doses.filter((d) => d.clienteId === clientePre.id).sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))[0]
      : undefined;
    const sugestao = sugerirProximaDose(ultima);
    setEditandoId(null);
    setForm({
      clienteId: clientePre?.id,
      dataAplicacao: new Date().toISOString().slice(0, 10),
      dose: sugestao?.dose ?? ultima?.dose ?? 2.5,
      intervaloDias: ultima?.intervaloDias ?? 7,
      localAplicacao: 'abdomen',
      pago: false,
    });
    setModalOpen(true);
  };

  const abrirEditar = (d: DoseMounjaro) => {
    setEditandoId(d.id);
    setForm({ ...d });
    setModalOpen(true);
  };

  const salvar = () => {
    if (!form.clienteId || !form.dataAplicacao) return;
    const cliente = clientes.find((c) => c.id === form.clienteId);
    if (editandoId) {
      const atualizada: DoseMounjaro = { ...(doses.find((d) => d.id === editandoId) as DoseMounjaro), ...form,
        dose: Number(form.dose) as DoseMounjaro['dose'],
        intervaloDias: Number(form.intervaloDias) || 7,
        pesoAplicacao: Number(form.pesoAplicacao) || undefined,
        valorDose: Number(form.valorDose) || undefined,
        pago: form.pago === true,
        updatedAt: new Date().toISOString(),
      } as DoseMounjaro;
      setDoses(doses.map((d) => (d.id === editandoId ? atualizada : d)));
      logAuditoria({ entidade: 'dose', acao: 'editar', resumo: `Dose ${atualizada.dose} mg de ${cliente?.nome || '—'}`, clienteId: form.clienteId, refId: editandoId });
    } else {
      const now = new Date().toISOString();
      const nova: DoseMounjaro = {
        id: newId('dose'),
        clienteId: form.clienteId,
        dataAplicacao: form.dataAplicacao,
        dose: Number(form.dose) as DoseMounjaro['dose'],
        intervaloDias: Number(form.intervaloDias) || 7,
        localAplicacao: form.localAplicacao,
        lote: form.lote,
        observacoes: form.observacoes,
        efeitosColaterais: form.efeitosColaterais,
        pesoAplicacao: Number(form.pesoAplicacao) || undefined,
        pago: form.pago === true,
        valorDose: Number(form.valorDose) || undefined,
        createdAt: now,
        updatedAt: now,
      };
      setDoses([nova, ...doses]);
      logAuditoria({ entidade: 'dose', acao: 'criar', resumo: `Dose ${nova.dose} mg de ${cliente?.nome || '—'}`, clienteId: form.clienteId, refId: nova.id });
    }
    setModalOpen(false);
    setEditandoId(null);
  };

  const excluir = (d: DoseMounjaro) => {
    if (!window.confirm('Excluir esta dose? Os pagamentos vinculados a ela serão desassociados.')) return;
    const cliente = clientes.find((c) => c.id === d.clienteId);
    // BUG-07 fix: dose + pagamentos atualizados atomicamente em um único persist.
    const novasDoses = doses.filter((x) => x.id !== d.id);
    const pagsAfetados = pagamentos.filter((p) => p.referenciaDoseId === d.id);
    const novosPagamentos = pagsAfetados.length > 0
      ? pagamentos.map((p) => (p.referenciaDoseId === d.id ? { ...p, referenciaDoseId: undefined } : p))
      : pagamentos;
    setDbAtomico({ doses: novasDoses, pagamentos: novosPagamentos });
    if (pagsAfetados.length > 0) {
      logAuditoria({ entidade: 'pagamento', acao: 'editar', resumo: `Desvinculou ${pagsAfetados.length} pagamento(s) da dose excluída`, clienteId: d.clienteId, refId: d.id });
    }
    logAuditoria({ entidade: 'dose', acao: 'excluir', resumo: `Dose ${d.dose} mg de ${cliente?.nome || '—'}`, clienteId: d.clienteId, refId: d.id });
  };

  const jaTemPagamento = (d: DoseMounjaro) => pagamentos.some((p) => p.referenciaDoseId === d.id);

  const cobrar = (d: DoseMounjaro) => {
    const cliente = clientes.find((c) => c.id === d.clienteId);
    if (!cliente) return;
    const valor = Number(d.valorDose) || 0;
    if (valor <= 0) {
      toast.error('Informe o Valor (R$) na dose antes de cobrar, ou crie o pagamento manualmente.');
      return;
    }
    // BUG-08 fix: pagamento + dose marcada como paga atomicamente em um único persist.
    const now = new Date().toISOString();
    const novo: PagamentoMounjaro = {
      id: newId('pag'),
      clienteId: d.clienteId,
      dataVencimento: d.dataAplicacao,
      dataPagamento: now.slice(0, 10),
      descricao: `Dose ${d.dose} mg`,
      valor,
      status: 'pago',
      metodo: 'dinheiro',
      referenciaDoseId: d.id,
      createdAt: now,
    };
    setDbAtomico({
      pagamentos: [novo, ...pagamentos],
      doses: doses.map((x) => (x.id === d.id ? { ...x, pago: true } : x)),
    });
    logAuditoria({ entidade: 'pagamento', acao: 'criar', resumo: `Pagamento ${formatarMoeda(novo.valor)} de ${cliente.nome} (dose ${d.dose} mg)`, clienteId: d.clienteId, refId: novo.id });
    toast.success(`Pagamento de ${formatarMoeda(valor)} registrado.`);
  };

  const nomeCliente = (id: string) => clientes.find((c) => c.id === id)?.nome || 'Desconhecido';

  const filtradas = useMemo(() => {
    const b = busca.toLowerCase();
    return doses
      .filter((d) => !b || nomeCliente(d.clienteId).toLowerCase().includes(b))
      .sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doses, busca, clientes]);

  // Lista de "próximas doses" sugeridas (clientes ativos sem dose recente)
  const sugestoes = useMemo(() => {
    return clientesAtivos.map((c) => {
      const ultima = doses.filter((d) => d.clienteId === c.id).sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))[0];
      if (!ultima) return { cliente: c, status: 'sem_registro' as const, prox: null, st: null };
      const prox = proximaDose(ultima);
      return { cliente: c, status: 'ok' as const, prox, st: statusDose(ultima.dataAplicacao, ultima.intervaloDias) };
    }).sort((a, b) => (a.prox || '9999').localeCompare(b.prox || '9999'));
  }, [clientesAtivos, doses]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold">Doses</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Registro de aplicações (intervalo 7 a 15 dias)</p>
        </div>
        <Button onClick={() => abrirNovo()} disabled={clientesAtivos.length === 0}>
          <Plus size={16} className="inline" /> Registrar dose
        </Button>
      </div>

      {clientesAtivos.length === 0 && (
        <Card className="text-center text-slate-500 py-8">Cadastre um cliente ativo antes de registrar doses.</Card>
      )}

      {/* Agenda de próximas doses */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <CalendarClock size={18} className="text-cyan-600" />
          <h3 className="font-semibold">Agenda de aplicações</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {sugestoes.map(({ cliente, prox, st }) => (
            <div key={cliente.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{cliente.nome}</p>
                <p className="text-xs text-slate-400">{prox ? `Próx: ${formatarDataCurta(prox)}` : 'sem registro'}</p>
              </div>
              <div className="flex items-center gap-2">
                {st?.status === 'atrasada' && <Badge tone="red">{Math.abs(st.diasRestantes)}d</Badge>}
                {st?.status === 'hoje' && <Badge tone="amber">hoje</Badge>}
                {st?.status === 'ok' && <Badge tone="green">{st.diasRestantes}d</Badge>}
                {!st && <Badge tone="slate">+</Badge>}
                <button onClick={() => abrirNovo(cliente)} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">+ dose</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por cliente..."
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="space-y-2">
        {filtradas.map((d) => (
          <Card key={d.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                <Syringe size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{nomeCliente(d.clienteId)}</p>
                <p className="text-xs text-slate-500">
                  {d.dose} mg · {formatarDataCurta(d.dataAplicacao)} · intervalo {d.intervaloDias}d
                  {d.localAplicacao && ` · ${d.localAplicacao}`}
                </p>
                {d.valorDose ? <p className="text-xs font-semibold text-emerald-600">{formatarMoeda(d.valorDose)}</p> : null}
                {d.efeitosColaterais && <p className="text-xs text-amber-600">⚠ {d.efeitosColaterais}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {d.pago ? <Badge tone="green">pago</Badge> : <Badge tone="amber">não pago</Badge>}
              {d.valorDose && !d.pago && !jaTemPagamento(d) && (
                <button onClick={() => cobrar(d)} className="text-emerald-600 hover:text-emerald-700 text-xs font-medium" title="Registrar pagamento desta dose">cobrar</button>
              )}
              <button onClick={() => abrirEditar(d)} className="text-cyan-600 hover:text-cyan-800 text-sm" title="Editar">✎</button>
              <button onClick={() => excluir(d)} className="text-rose-500 hover:text-rose-700 text-sm">✕</button>
            </div>
          </Card>
        ))}
        {filtradas.length === 0 && <Card className="text-center text-slate-500 py-10">Nenhuma dose registrada.</Card>}
      </div>

      <Modal
        open={modalOpen}
        title={editandoId ? 'Editar dose' : 'Registrar dose'}
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
          <Field label="Data da aplicação" type="date" value={form.dataAplicacao || ''} onChange={(v) => setForm({ ...form, dataAplicacao: v })} required />
          <SelectField label="Dose (mg)" value={String(form.dose ?? 2.5)} onChange={(v) => setForm({ ...form, dose: Number(v) as any })}
            options={DOSES_DISPONIVEIS.map((d) => ({ value: String(d), label: `${d} mg` }))} />
        </div>
        {(() => {
          const cli = clientes.find((c) => c.id === form.clienteId);
          const ult = cli ? doses.filter((d) => d.clienteId === cli.id).sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))[0] : undefined;
          const sug = sugerirProximaDose(ult);
          if (!sug) return null;
          return (
            <div className="rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 px-3 py-2 text-xs text-cyan-800 dark:text-cyan-200">
              <b>Dose sugerida:</b> {sug.dose} mg — {sug.motivo} <span className="opacity-70">(apoio, decisão final é do médico)</span>
            </div>
          );
        })()}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Intervalo (dias)" type="number" value={form.intervaloDias || 7} onChange={(v) => setForm({ ...form, intervaloDias: Number(v) })} />
          <SelectField label="Local" value={form.localAplicacao || 'abdomen'} onChange={(v) => setForm({ ...form, localAplicacao: v as any })}
            options={[
              { value: 'abdomen', label: 'Abdômen' },
              { value: 'coxa', label: 'Coxa' },
              { value: 'braco', label: 'Braço' },
              { value: 'outro', label: 'Outro' },
            ]} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso na aplicação (kg)" type="number" value={form.pesoAplicacao || ''} onChange={(v) => setForm({ ...form, pesoAplicacao: Number(v) })} />
          <Field label="Lote" value={form.lote || ''} onChange={(v) => setForm({ ...form, lote: v })} />
        </div>
        <TextArea label="Efeitos colaterais" value={form.efeitosColaterais || ''} onChange={(v) => setForm({ ...form, efeitosColaterais: v })} />
        <TextArea label="Observações" value={form.observacoes || ''} onChange={(v) => setForm({ ...form, observacoes: v })} />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.pago === true} onChange={(e) => setForm({ ...form, pago: e.target.checked })} />
            Dose paga
          </label>
          <Field label="Valor (R$)" type="number" value={form.valorDose || ''} onChange={(v) => setForm({ ...form, valorDose: Number(v) })} />
        </div>
      </Modal>
    </div>
  );
}
