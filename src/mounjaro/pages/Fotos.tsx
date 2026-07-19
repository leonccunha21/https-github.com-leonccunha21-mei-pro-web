import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Camera, Trash2, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClienteMounjaro, FotoEvolucao } from '../types';
import { Card, Button, Field, SelectField, Modal } from '../ui';
import { newId } from '../localDb';
import { compactarImagem } from '../image';
import { formatarDataCurta, LogAuditoriaFn } from '../lib';

interface Props {
  clientes: ClienteMounjaro[];
  fotos: FotoEvolucao[];
  setFotos: (f: FotoEvolucao[]) => void;
  logAuditoria: LogAuditoriaFn;
}

export default function Fotos({ clientes, fotos, setFotos, logAuditoria }: Props) {
  const [clienteId, setClienteId] = useState('');
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [legenda, setLegenda] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [preview, setPreview] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [comparar, setComparar] = useState(false);
  const [ver, setVer] = useState<FotoEvolucao | null>(null);
  const [idx, setIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const lista = useMemo(() => {
    let f = fotos.filter((x) => !clienteId || x.clienteId === clienteId);
    if (busca.trim()) {
      const ids = new Set(clientes.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase())).map((c) => c.id));
      f = f.filter((x) => ids.has(x.clienteId));
    }
    return f.sort((a, b) => a.data.localeCompare(b.data));
  }, [fotos, clienteId, busca, clientes]);

  const nomeCliente = (id: string) => clientes.find((c) => c.id === id)?.nome || '—';

  const aoSelecionar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSalvando(true);
    try {
      const base64 = await compactarImagem(file);
      setPreview(base64);
      setData(new Date().toISOString().slice(0, 10));
      setLegenda('');
      setModalAberto(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao processar imagem.');
    } finally {
      setSalvando(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const salvar = () => {
    if (!preview || !clienteId) return;
    const agora = new Date().toISOString();
    const foto: FotoEvolucao = {
      id: newId('ft'),
      clienteId,
      data,
      legenda: legenda.trim() || undefined,
      imagem: preview,
      createdAt: agora,
    };
    setFotos([...fotos, foto]);
    const cli = clientes.find((c) => c.id === clienteId);
    logAuditoria({ entidade: 'foto', acao: 'criar', resumo: `Foto de ${cli?.nome || '—'}${legenda.trim() ? ` (${legenda.trim()})` : ''}`, clienteId, refId: foto.id });
    setModalAberto(false);
    setPreview(null);
    setClienteId('');
  };

  const excluir = (f: FotoEvolucao) => {
    if (!window.confirm('Excluir esta foto?')) return;
    const cli = clientes.find((c) => c.id === f.clienteId);
    setFotos(fotos.filter((x) => x.id !== f.id));
    logAuditoria({ entidade: 'foto', acao: 'excluir', resumo: `Foto de ${cli?.nome || '—'}`, clienteId: f.clienteId, refId: f.id });
  };

  const abrirVer = (f: FotoEvolucao) => {
    setIdx(lista.findIndex((x) => x.id === f.id));
    setVer(f);
  };
  const nav = (dir: number) => {
    const n = (idx + dir + lista.length) % lista.length;
    setIdx(n);
    setVer(lista[n]);
  };

  // Atalhos de teclado no modo visualização
  useEffect(() => {
    if (!ver) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nav(1);
      if (e.key === 'ArrowLeft') nav(-1);
      if (e.key === 'Escape') setVer(null);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ver, idx, lista.length]);

  const primeira = lista[0];
  const ultima = lista[lista.length - 1];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Fotos de evolução</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Registre o acompanhamento visual do tratamento por paciente</p>
      </div>

      <Card className="print:shadow-none">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <SelectField label="Paciente" value={clienteId} onChange={setClienteId}
              options={[{ value: '', label: 'Todos os pacientes' }, ...clientes.map((c) => ({ value: c.id, label: c.nome }))]} />
          </div>
          <div className="min-w-[180px] flex-1">
            <Field label="Buscar por nome" value={busca} onChange={setBusca} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-xl h-[42px]">
            <Camera size={18} /> {salvando ? 'Processando…' : 'Adicionar foto'}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={aoSelecionar} />
          </label>
        </div>
      </Card>

      {lista.length === 0 ? (
        <Card className="text-center text-slate-500 py-10">
          <Camera className="mx-auto mb-2" size={28} />
          Nenhuma foto registrada{clienteId ? ` para ${nomeCliente(clienteId)}` : ''}.
        </Card>
      ) : (
        <>
          {!clienteId && primeira && ultima && primeira.id !== ultima.id && (
            <Card className="print:shadow-none">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Comparar: início vs. atual</h3>
                <Button variant="ghost" onClick={() => setComparar((v) => !v)}>{comparar ? 'Grade' : 'Lado a lado'}</Button>
              </div>
              {comparar ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">{formatarDataCurta(primeira.data)} · {nomeCliente(primeira.clienteId)}</p>
                    <img src={primeira.imagem} alt="início" className="w-full rounded-lg object-cover max-h-72" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">{formatarDataCurta(ultima.data)} · {nomeCliente(ultima.clienteId)}</p>
                    <img src={ultima.imagem} alt="atual" className="w-full rounded-lg object-cover max-h-72" />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center justify-center flex-wrap">
                  <img src={primeira.imagem} alt="início" className="w-32 h-40 object-cover rounded-lg" />
                  <span className="text-2xl text-slate-400">→</span>
                  <img src={ultima.imagem} alt="atual" className="w-32 h-40 object-cover rounded-lg" />
                </div>
              )}
            </Card>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {lista.map((f) => (
              <Card key={f.id} className="overflow-hidden p-0">
                <button onClick={() => abrirVer(f)} className="block w-full relative group">
                  <img src={f.imagem} alt={f.legenda || 'foto'} className="w-full h-44 object-cover" />
                  <span className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                    <Maximize2 size={14} />
                  </span>
                </button>
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{nomeCliente(f.clienteId)}</p>
                  <p className="text-[11px] text-slate-400">{formatarDataCurta(f.data)}{f.legenda ? ` · ${f.legenda}` : ''}</p>
                  <button onClick={() => excluir(f)} className="text-rose-500 hover:text-rose-700 text-xs mt-1 inline-flex items-center gap-1">
                    <Trash2 size={12} /> excluir
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Modal de cadastro de foto */}
      <Modal
        open={modalAberto}
        title="Nova foto de evolução"
        onClose={() => { setModalAberto(false); setPreview(null); }}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setModalAberto(false); setPreview(null); }}>Cancelar</Button>
            <Button onClick={salvar} disabled={!clienteId}>Salvar</Button>
          </>
        }
      >
        {preview && <img src={preview} alt="preview" className="w-full max-h-64 object-contain rounded-lg mb-3" />}
        <SelectField label="Paciente *" value={clienteId} onChange={setClienteId}
          options={[{ value: '', label: 'Selecione...' }, ...clientes.map((c) => ({ value: c.id, label: c.nome }))]} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data" type="date" value={data} onChange={setData} />
          <Field label="Legenda (opcional)" value={legenda} onChange={setLegenda} />
        </div>
      </Modal>

      {/* Visualização em tela cheia */}
      <Modal
        open={!!ver}
        title=""
        onClose={() => setVer(null)}
        footer={<Button onClick={() => ver && excluir(ver)} variant="danger"><Trash2 size={16} className="inline" /> Excluir</Button>}
      >
        {ver && (
          <div>
            <div className="relative">
              <img src={ver.imagem} alt={ver.legenda || 'foto'} className="w-full max-h-[70vh] object-contain rounded-lg" />
              {lista.length > 1 && (
                <>
                  <button onClick={() => nav(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"><ChevronLeft size={20} /></button>
                  <button onClick={() => nav(1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"><ChevronRight size={20} /></button>
                </>
              )}
            </div>
            <p className="text-sm mt-2">{nomeCliente(ver.clienteId)} · {formatarDataCurta(ver.data)}{ver.legenda ? ` · ${ver.legenda}` : ''}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
