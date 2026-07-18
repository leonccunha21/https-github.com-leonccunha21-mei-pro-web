import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, UserPlus, Search, Scale, Syringe, Wallet } from 'lucide-react';
import { ClienteMounjaro, PesagemMounjaro, DoseMounjaro, PagamentoMounjaro } from '../types';
import { Card, Button, Field, SelectField, TextArea, Modal, Badge, StatCard } from '../ui';
import { newId } from '../localDb';
import { calcIMC, classificacaoIMC, pesoAtual, pesoPerdido, calcularScore, formatarMoeda } from '../lib';

interface Props {
  clientes: ClienteMounjaro[];
  pesagens: PesagemMounjaro[];
  doses: DoseMounjaro[];
  pagamentos: PagamentoMounjaro[];
  setClientes: (c: ClienteMounjaro[]) => void;
  setPesagens: (p: PesagemMounjaro[]) => void;
}

export default function Clientes({ clientes, pesagens, doses, pagamentos, setClientes, setPesagens }: Props) {
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<ClienteMounjaro | null>(null);
  const [detalhe, setDetalhe] = useState<ClienteMounjaro | null>(null);

  const [form, setForm] = useState<Partial<ClienteMounjaro>>({
    nome: '', ativo: true, sexo: 'F',
  });

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: '', ativo: true, sexo: 'F' });
    setModalOpen(true);
  };

  const abrirEditar = (c: ClienteMounjaro) => {
    setEditando(c);
    setForm({ ...c });
    setModalOpen(true);
  };

  const salvar = () => {
    if (!form.nome?.trim()) return;
    const agora = new Date().toISOString();
    const imc = calcIMC(Number(form.pesoInicial) || 0, Number(form.alturaCm) || 0);

    if (editando) {
      const atualizado: ClienteMounjaro = {
        ...editando,
        ...form,
        alturaCm: Number(form.alturaCm) || undefined,
        pesoInicial: Number(form.pesoInicial) || undefined,
        imcInicial: imc || undefined,
        updatedAt: agora,
      } as ClienteMounjaro;
      setClientes(clientes.map((c) => (c.id === editando.id ? atualizado : c)));
    } else {
      const novo: ClienteMounjaro = {
        id: newId('cl'),
        nome: form.nome.trim(),
        telefone: form.telefone,
        email: form.email,
        dataNascimento: form.dataNascimento,
        sexo: form.sexo,
        endereco: form.endereco,
        cidade: form.cidade,
        estado: form.estado,
        cpf: form.cpf,
        alturaCm: Number(form.alturaCm) || undefined,
        pesoInicial: Number(form.pesoInicial) || undefined,
        imcInicial: imc || undefined,
        comorbidades: form.comorbidades,
        objetivoPeso: Number(form.objetivoPeso) || undefined,
        medicoResponsavel: form.medicoResponsavel,
        observacoes: form.observacoes,
        dataInicioTratamento: form.dataInicioTratamento,
        ativo: form.ativo !== false,
        createdAt: agora,
        updatedAt: agora,
      };
      setClientes([novo, ...clientes]);
    }
    setModalOpen(false);
  };

  const excluir = (c: ClienteMounjaro) => {
    if (!window.confirm(`Excluir ${c.nome}? Isso também remove pesagens e doses vinculadas.`)) return;
    setClientes(clientes.filter((x) => x.id !== c.id));
    setPesagens(pesagens.filter((p) => p.clienteId !== c.id));
    setDetalhe(null);
  };

  const filtrados = useMemo(() => {
    const b = busca.toLowerCase();
    return clientes.filter((c) => c.nome.toLowerCase().includes(b) || c.telefone?.includes(b));
  }, [clientes, busca]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold">Clientes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{clientes.length} cadastrados · {clientes.filter(c => c.ativo).length} em tratamento</p>
        </div>
        <Button onClick={abrirNovo}><Plus size={16} className="inline" /> Novo cliente</Button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtrados.map((c) => {
          const peso = pesoAtual(c, pesagens);
          const perdido = pesoPerdido(c, pesagens, doses);
          const score = calcularScore(c.id, pagamentos);
          const qtdDoses = doses.filter((d) => d.clienteId === c.id).length;
          return (
            <Card key={c.id} className="cursor-pointer hover:border-cyan-400 transition" onClick={() => setDetalhe(c)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-xs text-slate-500">{c.telefone || 'sem telefone'}</p>
                </div>
                {c.ativo ? <Badge tone="green">ativo</Badge> : <Badge tone="slate">inativo</Badge>}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[11px] text-slate-400">Peso atual</p>
                  <p className="font-semibold">{peso ? `${peso} kg` : '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Perdido</p>
                  <p className="font-semibold text-emerald-600">{perdido > 0 ? `${perdido} kg` : '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Doses</p>
                  <p className="font-semibold">{qtdDoses}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs">Score: <b>{score.pontuacao}</b></span>
                <span className="text-xs text-slate-400">IMC {c.imcInicial || '-'}</span>
              </div>
            </Card>
          );
        })}
        {filtrados.length === 0 && (
          <Card className="col-span-full text-center text-slate-500 py-10">
            <UserPlus className="mx-auto mb-2" size={28} />
            Nenhum cliente encontrado.
          </Card>
        )}
      </div>

      {/* Modal de cadastro/edição */}
      <Modal
        open={modalOpen}
        title={editando ? 'Editar cliente' : 'Novo cliente'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={salvar}>{editando ? 'Salvar' : 'Cadastrar'}</Button>
          </>
        }
      >
        <Field label="Nome completo" value={form.nome || ''} onChange={(v) => setForm({ ...form, nome: v })} required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefone" value={form.telefone || ''} onChange={(v) => setForm({ ...form, telefone: v })} />
          <Field label="CPF" value={form.cpf || ''} onChange={(v) => setForm({ ...form, cpf: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="E-mail" value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} />
          <SelectField label="Sexo" value={form.sexo || 'F'} onChange={(v) => setForm({ ...form, sexo: v as any })}
            options={[{ value: 'F', label: 'Feminino' }, { value: 'M', label: 'Masculino' }, { value: 'O', label: 'Outro' }]} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Altura (cm)" type="number" value={form.alturaCm || ''} onChange={(v) => setForm({ ...form, alturaCm: Number(v) })} />
          <Field label="Peso inicial (kg)" type="number" value={form.pesoInicial || ''} onChange={(v) => setForm({ ...form, pesoInicial: Number(v) })} />
          <Field label="Objetivo (kg)" type="number" value={form.objetivoPeso || ''} onChange={(v) => setForm({ ...form, objetivoPeso: Number(v) })} />
        </div>
        <Field label="Data início do tratamento" type="date" value={form.dataInicioTratamento || ''} onChange={(v) => setForm({ ...form, dataInicioTratamento: v })} />
        <Field label="Médico responsável" value={form.medicoResponsavel || ''} onChange={(v) => setForm({ ...form, medicoResponsavel: v })} />
        <TextArea label="Comorbidades / observações clínicas" value={form.comorbidades || ''} onChange={(v) => setForm({ ...form, comorbidades: v })} />
        <TextArea label="Observações gerais" value={form.observacoes || ''} onChange={(v) => setForm({ ...form, observacoes: v })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.ativo !== false} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
          Cliente em tratamento ativo
        </label>
      </Modal>

      {/* Modal de detalhe */}
      <Modal
        open={!!detalhe}
        title={detalhe?.nome || ''}
        onClose={() => setDetalhe(null)}
        footer={
          <>
            <Button variant="danger" onClick={() => detalhe && excluir(detalhe)}><Trash2 size={16} className="inline" /> Excluir</Button>
            <Button variant="ghost" onClick={() => detalhe && abrirEditar(detalhe)}><Pencil size={16} className="inline" /> Editar</Button>
            <Button onClick={() => setDetalhe(null)}>Fechar</Button>
          </>
        }
      >
        {detalhe && <DetalheCliente cliente={detalhe} pesagens={pesagens} doses={doses} pagamentos={pagamentos} />}
      </Modal>
    </div>
  );
}

function DetalheCliente({
  cliente, pesagens, doses, pagamentos,
}: {
  cliente: ClienteMounjaro;
  pesagens: PesagemMounjaro[];
  doses: DoseMounjaro[];
  pagamentos: PagamentoMounjaro[];
}) {
  const peso = pesoAtual(cliente, pesagens);
  const perdido = pesoPerdido(cliente, pesagens, doses);
  const score = calcularScore(cliente.id, pagamentos);
  const ultimaDose = doses.filter((d) => d.clienteId === cliente.id).sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Peso atual" value={`${peso || '-'} kg`} icon={<Scale size={18} />} accent="cyan" />
        <StatCard title="Perda total" value={`${perdido > 0 ? perdido : 0} kg`} icon={<Scale size={18} />} accent="green" />
        <StatCard title="Doses aplicadas" value={doses.filter((d) => d.clienteId === cliente.id).length} icon={<Syringe size={18} />} accent="violet" />
        <StatCard title="Score pagamento" value={score.pontuacao} icon={<Wallet size={18} />} accent="amber"
          hint={`${score.pagamentosEmDia} em dia · ${score.pagamentosAtrasados} atrasados`} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <InfoRow label="IMC inicial" value={cliente.imcInicial ? `${cliente.imcInicial} (${classificacaoIMC(cliente.imcInicial)})` : '-'} />
        <InfoRow label="Telefone" value={cliente.telefone || '-'} />
        <InfoRow label="E-mail" value={cliente.email || '-'} />
        <InfoRow label="Objetivo" value={cliente.objetivoPeso ? `${cliente.objetivoPeso} kg` : '-'} />
        <InfoRow label="Médico" value={cliente.medicoResponsavel || '-'} />
        <InfoRow label="Última dose" value={ultimaDose ? `${ultimaDose.dose} mg` : 'não aplicada'} />
        <InfoRow label="Comorbidades" value={cliente.comorbidades || '-'} full />
      </div>

      <div>
        <p className="text-sm font-semibold mb-1">Resumo financeiro</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Pago: <b className="text-emerald-600">{formatarMoeda(score.valorTotalPago)}</b> · Em aberto: <b className="text-rose-600">{formatarMoeda(score.valorEmAberto)}</b>
          {score.atrasoMedioDias > 0 && <> · Atraso médio: {score.atrasoMedioDias} dias</>}
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}
