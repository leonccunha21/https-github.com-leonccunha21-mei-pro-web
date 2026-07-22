import React, { useMemo, useState } from 'react';
import { Search, Filter, User as UserIcon, Syringe, Wallet, Scale, Camera, Users, Trash2, Pencil, PlusCircle } from 'lucide-react';
import { ClienteMounjaro, RegistroAuditoria } from '../types';
import { Card, SelectField, Field } from '../ui';
import { formatarDataCurta } from '../lib';

interface Props {
  auditoria: RegistroAuditoria[];
  clientes: ClienteMounjaro[];
}

const ACAO_ICONE = {
  criar: <PlusCircle size={14} className="text-emerald-600" />,
  editar: <Pencil size={14} className="text-amber-600" />,
  excluir: <Trash2 size={14} className="text-rose-600" />,
} as const;

const ENTIDADE_ICONE = {
  cliente: <Users size={14} />,
  dose: <Syringe size={14} />,
  pagamento: <Wallet size={14} />,
  pesagem: <Scale size={14} />,
  foto: <Camera size={14} />,
} as const;

export default function Auditoria({ auditoria, clientes }: Props) {
  const [busca, setBusca] = useState('');
  const [entidade, setEntidade] = useState('');
  const [acao, setAcao] = useState('');

  const nomeCliente = (id?: string) => (id ? clientes.find((c) => c.id === id)?.nome || '—' : '');

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase();
    // BUG-FIX: variável 'b' no sort shadow a variável outer 'b = busca.toLowerCase()'.
    // Renomeado para 'termo' para eliminar a ambiguidade.
    return [...auditoria]
      .sort((x, y) => y.data.localeCompare(x.data))
      .filter((r) => !entidade || r.entidade === entidade)
      .filter((r) => !acao || r.acao === acao)
      .filter((r) => {
        if (!termo) return true;
        return (
          r.resumo.toLowerCase().includes(termo) ||
          r.usuario.toLowerCase().includes(termo) ||
          (r.clienteId ? nomeCliente(r.clienteId).toLowerCase().includes(termo) : false)
        );
      });
  }, [auditoria, entidade, acao, busca, clientes]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Auditoria</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Histórico de alterações críticas (doses, pagamentos, clientes, fotos)</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por paciente, ação ou usuário..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <SelectField label="Entidade" value={entidade} onChange={setEntidade}
            options={[{ value: '', label: 'Todas' }, { value: 'cliente', label: 'Cliente' }, { value: 'dose', label: 'Dose' }, { value: 'pagamento', label: 'Pagamento' }, { value: 'pesagem', label: 'Pesagem' }, { value: 'foto', label: 'Foto' }]} />
          <SelectField label="Ação" value={acao} onChange={setAcao}
            options={[{ value: '', label: 'Todas' }, { value: 'criar', label: 'Criar' }, { value: 'editar', label: 'Editar' }, { value: 'excluir', label: 'Excluir' }]} />
        </div>
      </Card>

      {filtrados.length === 0 ? (
        <Card className="text-center text-slate-500 py-10">
          <Filter className="mx-auto mb-2" size={28} />
          Nenhum registro de auditoria.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtrados.map((r) => (
              <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 text-slate-400">{ENTIDADE_ICONE[r.entidade]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ACAO_ICONE[r.acao]}
                    <span className="text-sm font-medium">{r.resumo}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <UserIcon size={12} /> {r.usuario} · {new Date(r.data).toLocaleString('pt-BR')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-xs text-slate-400 text-center">
        Os registros são sincronizados na nuvem junto com os demais dados e ficam limitados aos últimos 500 eventos.
      </p>
    </div>
  );
}
