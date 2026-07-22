import React, { useState } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';
import { ConfigMounjaro } from '../types';
import { Card, Button, Field, TextArea } from '../ui';
import { compactarImagem } from '../image';
import { formatarMoeda } from '../lib';

interface Props {
  config: ConfigMounjaro;
  setConfig: (c: ConfigMounjaro) => void;
}

export default function Configuracoes({ config, setConfig }: Props) {
  const [form, setForm] = useState<ConfigMounjaro>(config);
  const [salvo, setSalvo] = useState(false);

  // Sincroniza o formulário quando config muda externamente (ex: carregamento do Supabase).
  React.useEffect(() => {
    setForm(config);
    setSalvo(false);
  }, [config]);

  const atualizar = (k: keyof ConfigMounjaro, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSalvo(false);
  };

  const aoLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compactarImagem(file, 256, 0.85);
      atualizar('logo', base64);
    } catch {
      alert('Falha ao processar a imagem do logo.');
    }
  };

  const salvar = () => {
    setConfig({
      ...form,
      valorDosePadrao: Number(form.valorDosePadrao) || 0,
      intervaloPadraoDias: Number(form.intervaloPadraoDias) || 7,
    });
    setSalvo(true);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold">Ajustes da clínica</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Personalize relatórios e mensagens de lembrete</p>
      </div>

      <Card className="space-y-3">
        <Field label="Nome da clínica" value={form.nomeClinica} onChange={(v) => atualizar('nomeClinica', v)} />
        <Field label="Profissional responsável" value={form.profissional} onChange={(v) => atualizar('profissional', v)} />
        <Field label="Telefone de contato" value={form.telefoneContato || ''} onChange={(v) => atualizar('telefoneContato', v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor padrão da dose (R$)" type="number" value={form.valorDosePadrao || ''} onChange={(v) => atualizar('valorDosePadrao', Number(v))} />
          <Field label="Intervalo padrão (dias)" type="number" value={form.intervaloPadraoDias || 7} onChange={(v) => atualizar('intervaloPadraoDias', Number(v))} />
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Logo (opcional)</p>
          <div className="flex items-center gap-3">
            {form.logo ? (
              <img src={form.logo} alt="logo" className="w-16 h-16 object-contain rounded-lg border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400">
                <ImageIcon size={20} />
              </div>
            )}
            <label className="text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-2 rounded-lg cursor-pointer">
              {form.logo ? 'Trocar logo' : 'Enviar logo'}
              <input type="file" accept="image/*" className="hidden" onChange={aoLogo} />
            </label>
            {form.logo && (
              <button onClick={() => atualizar('logo', undefined)} className="text-rose-500 text-sm">remover</button>
            )}
          </div>
        </div>
      </Card>

      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <p className="text-sm font-semibold mb-1">Pré-visualização do cabeçalho do relatório</p>
        <div className="flex items-center gap-3">
          {form.logo && <img src={form.logo} alt="logo" className="w-10 h-10 object-contain" />}
          <div>
            <p className="font-bold">{form.nomeClinica || 'Mounjaro PRO'}</p>
            <p className="text-xs text-slate-500">{form.profissional || 'Profissional responsável'}{form.telefoneContato ? ` · ${form.telefoneContato}` : ''}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Valor sugerido por dose: {formatarMoeda(Number(form.valorDosePadrao) || 0)} · Intervalo padrão: {form.intervaloPadraoDias || 7} dias</p>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={salvar}><Save size={16} className="inline" /> Salvar ajustes</Button>
        {salvo && <span className="text-sm text-emerald-600">Ajustes salvos e sincronizados.</span>}
      </div>

      <p className="text-xs text-slate-400">
        Os ajustes são salvos na nuvem junto com os demais dados e aparecem nos relatórios por paciente
        e nas mensagens de lembrete enviadas pelo WhatsApp.
      </p>
    </div>
  );
}
